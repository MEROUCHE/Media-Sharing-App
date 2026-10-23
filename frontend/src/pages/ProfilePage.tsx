import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as userService from "../services/user.service";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Key,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
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

      toastSuccess("Profile updated successfully!");
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account settings, personal details, and avatar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-xl h-fit">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-950/60 border-2 border-indigo-500/40 flex items-center justify-center font-bold text-2xl text-indigo-300">
                {username?.slice(0, 2).toUpperCase() || <UserIcon className="w-10 h-10" />}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">@{username}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 space-y-2 text-left text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-mono truncate">{user?.id}</span>
            </div>
            {user?.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white">Edit Profile Information</h3>

          {error && (
            <div className="p-3 text-sm text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-500 text-sm">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
                <span className="ml-auto text-2xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                  Verified
                </span>
              </div>
              <p className="text-2xs text-slate-500 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Avatar Image URL (optional)
              </label>
              <input
                type="url"
                maxLength={500}
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>

          {/* Danger Zone: Delete Account */}
          <div className="pt-6 border-t border-slate-800/80 space-y-3">
            <h4 className="text-sm font-bold text-rose-400">Danger Zone</h4>
            <div className="flex items-center justify-between p-4 bg-rose-950/10 border border-rose-900/30 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-white">Delete Account</p>
                <p className="text-xs text-slate-400">
                  Permanently delete your profile and membership from all clubs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Your Account?</h3>
            </div>
            <p className="text-sm text-slate-300">
              This action is permanent and cannot be undone. All your profile data and progress records will be erased.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
