import { useEffect, useState } from "react";
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
  RememberMeSwitch,
  SocialAuthButtons,
} from "@/features/auth/components";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

const REMEMBER_EMAIL_KEY = "winmix:auth:remember-email";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rememberedEmail = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      form.setValue("rememberMe", true);
    }
  }, [form]);

  const handleSubmit = async (values: LoginFormData) => {
    try {
      setIsSubmitting(true);
      await signIn(values.email, values.password);

      if (typeof window !== "undefined") {
        if (values.rememberMe) {
          window.localStorage.setItem(REMEMBER_EMAIL_KEY, values.email);
        } else {
          window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      }

      toast({
        title: "Welcome back",
        description: "You are now signed in to WinMix TipsterHub.",
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast({
        title: "Unable to sign in",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: Provider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      toast({
        title: "Social sign-in unavailable",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    formState: { errors },
    setValue,
  } = form;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to explore your WinMix dashboard"
      footer={
        <span>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-emerald-200 hover:text-emerald-100">
            Create one
          </Link>
        </span>
      }
    >
      <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-6">
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
          autoComplete="current-password"
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register("password")}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <RememberMeSwitch
            checked={watch("rememberMe")}
            onCheckedChange={(checked) => setValue("rememberMe", checked)}
            disabled={isSubmitting}
          />
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-emerald-200 transition hover:text-emerald-100"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <SocialAuthButtons onSelect={handleSocialLogin} />
      </div>
    </AuthLayout>
  );
};

export default Login;
