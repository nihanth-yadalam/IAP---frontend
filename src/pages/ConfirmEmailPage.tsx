import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { confirmEmail, isLoading } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing confirmation token.");
      return;
    }

    confirmEmail(token)
      .then((msg) => {
        setStatus("success");
        setMessage(msg);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.detail || "Email confirmation failed.");
      });
  }, [token]);

  return (
    <AuthLayout
      title={status === "success" ? "Email Confirmed!" : status === "error" ? "Confirmation Failed" : "Confirming..."}
      subtitle=""
    >
      <div className="space-y-5 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Verifying your email address...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link to="/login">
              <Button variant="gradient" className="h-11 rounded-xl font-semibold px-8">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-sm text-destructive">{message}</p>
            <Link to="/signup">
              <Button variant="outline" className="h-11 rounded-xl font-medium px-8">
                Try signing up again
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
