import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import * as authService from "../services/auth.service";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Reset token is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword({
        token: token.trim(),
        newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Failed to reset password. The token may be expired or already used.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-[#09090B]">
      <div className="w-full max-w-sm bg-[#111113] border border-zinc-800/80 rounded-xl p-6 sm:p-7 space-y-5 animate-fade-up">
        {success ? (
          <div className="text-center space-y-3 py-2">
            <div className="inline-flex p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Password Updated</h2>
            <p className="text-xs text-zinc-400">
              Your password has been changed. You can now sign in.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate("/login")}
                className="py-2 px-5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                Set New Password
              </h1>
              <p className="text-xs text-zinc-400">
                Enter your reset token and choose a new password.
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
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
              </button>
            </form>

            <div className="text-center">
              <Link to="/login" className="text-xs text-zinc-400 hover:text-zinc-100 transition">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
