import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, KeyRound, Loader2 } from "lucide-react";
import * as groupService from "../../services/group.service";
import { useQueryClient } from "@tanstack/react-query";

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter an 8-character invite code");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await groupService.joinGroupByCode(cleanCode);

      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      onClose();
      navigate(`/groups/${res.groupId}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Could not join group. Check the invite code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Join with Invite Code</h2>
          </div>
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
              8-Character Code
            </label>
            <input
              type="text"
              maxLength={8}
              autoFocus
              placeholder="e.g. A9B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full text-center tracking-widest text-lg font-mono font-semibold px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
            />
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              Ask your group creator or member for the 8-character invite code.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-900" />}
              Join Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;
