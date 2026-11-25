import React, { useState } from "react";
import { Globe, Lock, Loader2, Settings2 } from "lucide-react";
import * as groupService from "../../services/group.service";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../ui/Modal";

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
      setError(err?.response?.data?.error || "Failed to update club");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Club Details"
      icon={<Settings2 className="w-4 h-4 text-zinc-300" />}
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Club Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            Visibility
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition ${
                isPublic
                  ? "bg-indigo-500/10 border-indigo-500/50 text-zinc-100"
                  : "bg-[#09090B] border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold">Public</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition ${
                !isPublic
                  ? "bg-indigo-500/10 border-indigo-500/50 text-zinc-100"
                  : "bg-[#09090B] border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="text-xs font-semibold">Private</span>
            </button>
          </div>
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGroupModal;
