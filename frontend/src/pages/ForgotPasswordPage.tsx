import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import * as authService from "../services/auth.service";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await authService.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-[#09090B]">
      <div className="w-full max-w-sm bg-[#111113] border border-zinc-800/80 rounded-xl p-6 sm:p-7 space-y-5 animate-fade-up">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>

        {submitted ? (
          <div className="text-center space-y-3 py-2">
            <div className="inline-flex p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Reset Link Sent</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If an account exists for{" "}
              <span className="text-zinc-100 font-medium">{email}</span>, a reset link has been sent.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs text-zinc-400">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
