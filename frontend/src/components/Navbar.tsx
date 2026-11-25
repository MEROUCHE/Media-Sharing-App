import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Compass,
  Layers,
  Plus,
  KeyRound,
  LogOut,
  User as UserIcon,
  Film,
  Menu,
  X,
  ChevronDown,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const isNavActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#09090B]/95 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand & Nav Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-sm tracking-tight text-zinc-100 hover:text-white transition"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span>MediaShare</span>
              </Link>

              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to="/"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isNavActive("/")
                        ? "bg-zinc-800/90 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    My Clubs
                  </Link>
                  <Link
                    to="/explore"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isNavActive("/explore")
                        ? "bg-zinc-800/90 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Explore
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Actions & User Menu */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsJoinOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                    Join Code
                  </button>

                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Club
                  </button>

                  <div className="h-4 w-px bg-zinc-800 mx-1" />

                  {/* User Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-200">
                          {user?.username?.slice(0, 2).toUpperCase() || (
                            <UserIcon className="w-3 h-3" />
                          )}
                        </div>
                      )}
                      <span className="max-w-[110px] truncate">{user?.username}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-1.5 w-48 bg-[#111113] border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 animate-fade-up">
                        <div className="px-3 py-2 border-b border-zinc-800/80">
                          <p className="text-xs font-medium text-zinc-200 truncate">
                            @{user?.username}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 transition"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                          Profile & Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-[#09090B] px-4 pt-3 pb-4 space-y-1.5 animate-fade-up">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    isNavActive("/") ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  My Clubs
                </Link>
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    isNavActive("/explore") ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Explore Clubs
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    isNavActive("/profile") ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Profile (@{user?.username})
                </Link>

                <div className="pt-2 flex flex-col gap-2 border-t border-zinc-800/80">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsJoinOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                    Join via Code
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCreateOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-indigo-500 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Club
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-zinc-300 hover:bg-zinc-900 rounded-lg text-xs font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-white bg-indigo-500 rounded-lg text-xs font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </>
  );
};

export default Navbar;
