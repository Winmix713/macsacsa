import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Provider } from "@supabase/auth-js";
import { Loader2 } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthLayout,
  FloatingLabelInput,
  PasswordField,
  SocialAuthButtons,
} from "@/features/auth/components";

const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: "Your name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Enter a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string({ required_error: "Confirm your password" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      await signUp(values.email, values.password, values.fullName);

      toast({
        title: "Almost there",
        description: "We sent a verification email. Confirm it to start predicting.",
      });

      reset({ ...values, password: "", confirmPassword: "" });
      navigate(`/email-verification-success?email=${encodeURIComponent(values.email)}`, {
        replace: true,
      });
    } catch (error) {
      toast({
        title: "Unable to create account",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (provider: Provider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      toast({
        title: "Social sign-up unavailable",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <AuthLayout
      title="Create your WinMix account"
      subtitle="Register to unlock the WinMix dashboard and AI-driven insights"
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-200 hover:text-emerald-100">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FloatingLabelInput
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          disabled={isSubmitting}
          {...register("fullName")}
        />

        <FloatingLabelInput
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register("email")}
        />

        <PasswordField
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register("password")}
        />

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Creating account" : "Create account"}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Or sign up with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <SocialAuthButtons onSelect={handleSocialSignUp} />
      </div>
    </AuthLayout>
  );
};

export default Register;
