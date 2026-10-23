import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Compass,
  Users,
  PlusCircle,
  KeyRound,
  LogOut,
  User as UserIcon,
  Film,
  Menu,
  X,
} from "lucide-react";
import CreateGroupModal from "./modals/CreateGroupModal";
import JoinGroupModal from "./modals/JoinGroupModal";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isNavActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/8 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight group"
              >
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 border border-indigo-500/30 rounded-xl group-hover:scale-105 group-hover:border-indigo-400/50 transition-all shadow-lg shadow-indigo-500/10">
                  <Film className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition" />
                </div>
                <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  MediaShare
                </span>
              </Link>

              {/* Desktop Nav Links */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-1.5 ml-8">
                  <Link
                    to="/"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition ${
                      isNavActive("/")
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    My Clubs
                  </Link>
                  <Link
                    to="/explore"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition ${
                      isNavActive("/explore")
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Explore
                  </Link>
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsJoinOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Enter Code
                  </button>

                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Create Club
                  </button>

                  <div className="h-5 w-px bg-slate-800 mx-1" />

                  <Link
                    to="/profile"
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-sm font-medium transition ${
                      isNavActive("/profile")
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-7 h-7 rounded-full object-cover border border-indigo-500/50 shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {user?.username?.slice(0, 2).toUpperCase() || <UserIcon className="w-4 h-4" />}
                      </div>
                    )}
                    <span className="text-xs font-semibold">@{user?.username}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  My Clubs
                </Link>
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  <Compass className="w-4 h-4 text-purple-400" />
                  Explore Public Clubs
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  Profile (@{user?.username})
                </Link>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsJoinOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 rounded-xl"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Enter Invite Code
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCreateOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create New Club
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-slate-300 hover:bg-white/5 rounded-xl text-sm font-semibold"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-white bg-indigo-600 rounded-xl text-sm font-semibold"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Modals */}
      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </>
  );
};
export default Navbar;
