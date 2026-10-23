import React, { useState } from "react";
import { X, Globe, Lock, Loader2 } from "lucide-react";
import * as groupService from "../../services/group.service";
import { useQueryClient } from "@tanstack/react-query";

interface EditGroupModalProps {
  groupId: string;
  initialName: string;
  initialDescription?: string | null;
  initialIsPublic: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  groupId,
  initialName,
  initialDescription,
  initialIsPublic,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription || "");
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await groupService.updateGroup(groupId, {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });

      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Edit Group Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Group Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition ${
                  isPublic
                    ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-sm font-semibold">Public</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition ${
                  !isPublic
                    ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm font-semibold">Private</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
