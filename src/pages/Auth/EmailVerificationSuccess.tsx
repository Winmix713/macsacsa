import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/features/auth/components";

const getEmailFromSearch = (search: string) => {
  const params = new URLSearchParams(search);
  return params.get("email");
};

const EmailVerificationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { acknowledgeEmailVerification, pendingVerificationEmail, user } = useAuth();

  const email = useMemo(() => {
    return (
      pendingVerificationEmail ??
      getEmailFromSearch(location.search) ??
      user?.email ??
      ""
    );
  }, [location.search, pendingVerificationEmail, user?.email]);

  const handleContinue = async () => {
    try {
      await acknowledgeEmailVerification();
      toast({
        title: "Verification acknowledged",
        description: "You can now sign in with your credentials.",
      });
      navigate(user ? "/dashboard" : "/login", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({
        title: "Unable to continue",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthLayout
      title="You're almost ready!"
      subtitle="Confirm your email to unlock the full WinMix experience"
    >
      <div className="space-y-6 text-center text-slate-200">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400/15">
          <MailCheck className="h-12 w-12 text-emerald-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Check your inbox</h2>
          <p className="text-sm text-slate-300/80">
            {email
              ? `We sent a verification link to ${email}. Click the link in the email and then continue.`
              : "We sent a verification link to your inbox. Click the link to verify your account and then continue."}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
            onClick={handleContinue}
          >
            <CheckCircle2 className="h-5 w-5" />
            I've verified my email
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-2xl border-white/20 bg-white/5 text-slate-100 hover:border-emerald-200/60 hover:bg-emerald-400/10"
            onClick={() => navigate("/register")}
          >
            Back to registration
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationSuccess;
