import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as userService from "../services/user.service";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Key,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, logout, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [username, setUsername] = useState(user?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (username.length < 3 || username.length > 30) {
      setError("Username must be between 3 and 30 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSaveSuccess(false);

      const updated = await userService.updateUser(user.id, {
        username: username.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });

      updateUserContext({
        username: updated.username,
        avatarUrl: updated.avatarUrl,
      });

      toastSuccess("Profile updated");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      setDeleteLoading(true);
      await userService.deleteUser(user.id);
      await logout();
      navigate("/register");
    } catch (err: any) {
      toastError(err?.response?.data?.error || "Failed to delete account");
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-zinc-400 text-xs mt-1">
          Manage your account details, avatar, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Summary Card */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6 flex flex-col items-center text-center space-y-4 h-fit">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-20 h-20 rounded-full object-cover border border-zinc-700"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-semibold text-xl text-zinc-200">
              {username?.slice(0, 2).toUpperCase() || <UserIcon className="w-8 h-8" />}
            </div>
          )}

          <div>
            <h2 className="text-base font-semibold text-zinc-100">@{username}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-zinc-800/80 space-y-2 text-left text-[11px] text-zinc-400 font-mono tabular-nums">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{user?.id}</span>
            </div>
            {user?.createdAt && (
              <div className="flex items-center gap-2 font-sans">
                <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form & Danger Zone */}
        <div className="md:col-span-2 bg-[#111113] border border-zinc-800/80 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-zinc-100">Account Information</h3>

          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>Profile updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 text-xs transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2 bg-[#09090B]/60 border border-zinc-800/80 rounded-lg text-zinc-400 text-xs">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>{user?.email}</span>
                <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Avatar Image URL (optional)
              </label>
              <input
                type="url"
                maxLength={500}
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs transition"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 py-2 px-4 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="pt-5 border-t border-zinc-800/80 space-y-3">
            <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Danger Zone
            </h4>
            <div className="flex items-center justify-between p-4 bg-rose-500/[0.05] border border-rose-500/20 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-zinc-100">Delete Account</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Permanently delete your profile, memberships, and progress.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        title="Delete Your Account?"
        message="This action is permanent and cannot be undone. All your profile data and progress records will be erased."
        confirmLabel="Yes, Delete My Account"
        loading={deleteLoading}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};

export default ProfilePage;
