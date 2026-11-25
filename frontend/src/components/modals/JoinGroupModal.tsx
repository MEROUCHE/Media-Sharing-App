import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import * as groupService from "../../services/group.service";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../ui/Modal";

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
          "Could not join club. Check the invite code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join with Invite Code"
      maxWidthClass="max-w-sm"
      icon={<KeyRound className="w-4 h-4 text-amber-400" />}
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            8-Character Code
          </label>
          <input
            type="text"
            maxLength={8}
            autoFocus
            placeholder="A9B2C3D4"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full text-center tracking-widest text-base font-mono font-semibold px-4 py-2.5 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
          />
          <p className="text-[11px] text-zinc-500 mt-1.5 text-center">
            Ask a club member for their 8-character invite code.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Join Club
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinGroupModal;
