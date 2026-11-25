import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Film, Mail, Lock, User as UserIcon, Loader2, CheckCircle2 } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (username.length < 3 || username.length > 30) {
      setError("Username must be between 3 and 30 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register({ username, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Registration failed. Please try a different email or username.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-[#09090B]">
        <div className="w-full max-w-sm bg-[#111113] border border-zinc-800/80 rounded-xl p-6 text-center space-y-4 animate-fade-up">
          <div className="inline-flex p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Check your inbox</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We sent a verification link to{" "}
            <span className="text-zinc-100 font-medium">{email}</span>. Click it to activate your account before signing in.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block py-2 px-5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-[#09090B]">
      <div className="w-full max-w-sm bg-[#111113] border border-zinc-800/80 rounded-xl p-6 sm:p-7 space-y-6 animate-fade-up">
        <div className="space-y-1.5">
          <div className="inline-flex p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg mb-1">
            <Film className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Create an account
          </h1>
          <p className="text-xs text-zinc-400">
            Join MediaShare to track books, movies, shows, and games together.
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
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs transition"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Password (min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
