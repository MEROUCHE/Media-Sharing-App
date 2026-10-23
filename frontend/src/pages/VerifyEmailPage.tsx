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
            "Invalid or expired verification token. Please register again or request support.",
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        {loading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
            <p className="text-slate-400 text-sm">Verifying your email address...</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-sm text-slate-400">
              Your account has been successfully verified. You can now log in and start tracking media.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
              >
                Log In Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-400">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/60">
              {error}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/register"
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition"
              >
                Try Registering
              </Link>
              <Link
                to="/login"
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
