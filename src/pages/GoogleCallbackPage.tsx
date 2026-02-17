import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(3);

    const status = searchParams.get("status");
    const message = searchParams.get("message");
    const isSuccess = status === "success";

    useEffect(() => {
        if (!isSuccess) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/settings?tab=integrations", { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isSuccess, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md text-center space-y-6">
                {isSuccess ? (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Google Calendar Connected!</h1>
                            <p className="text-muted-foreground">
                                Your calendar has been linked. Initial sync is in progress.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Redirecting to Settings in {countdown}s…
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <XCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Connection Failed</h1>
                            <p className="text-muted-foreground">
                                {message || "An error occurred during Google OAuth."}
                            </p>
                        </div>
                        <Button onClick={() => navigate("/settings?tab=integrations", { replace: true })} className="rounded-xl">
                            Back to Settings
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
