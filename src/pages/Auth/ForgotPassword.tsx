import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout, FloatingLabelInput } from "@/features/auth/components";

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      await sendPasswordReset(values.email);
      toast({
        title: "Check your inbox",
        description: "If an account exists, we've sent password reset instructions.",
      });
      reset();
      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Unable to send reset email",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive password reset instructions"
      footer={
        <span>
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-emerald-200 hover:text-emerald-100">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FloatingLabelInput
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register("email")}
        />

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Sending reset link" : "Send reset link"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border-white/20 bg-white/5 text-slate-100 hover:border-emerald-200/60 hover:bg-emerald-400/10"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Back
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
