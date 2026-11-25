import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import * as authService from "../services/auth.service";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Verification token is missing in the URL.");
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setSuccess(true);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            "Invalid or expired verification token.",
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-[#09090B]">
      <div className="w-full max-w-sm bg-[#111113] border border-zinc-800/80 rounded-xl p-6 text-center space-y-4 animate-fade-up">
        {loading ? (
          <div className="space-y-3 py-6">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
            <p className="text-zinc-400 text-xs">Verifying your email...</p>
          </div>
        ) : success ? (
          <div className="space-y-3">
            <div className="inline-flex p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Email Verified</h2>
            <p className="text-xs text-zinc-400">
              Your account is active. You can now sign in and start tracking media.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block py-2 px-5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <XCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Verification Failed</h2>
            <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
              {error}
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Link
                to="/register"
                className="py-2 px-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-lg transition"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="py-2 px-3.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
