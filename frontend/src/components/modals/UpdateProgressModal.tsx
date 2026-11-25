import React, { useState } from "react";
import { Check, Loader2, BookmarkCheck } from "lucide-react";
import * as progressService from "../../services/progress.service";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../ui/Modal";

interface UpdateProgressModalProps {
  groupId: string;
  mediaId: string;
  mediaTitle: string;
  totalUnits: number | null;
  initialUnit?: number;
  initialStatus?: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";
  initialNote?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({
  groupId,
  mediaId,
  mediaTitle,
  totalUnits,
  initialUnit = 0,
  initialStatus,
  initialNote = "",
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [currentUnit, setCurrentUnit] = useState<number>(initialUnit);
  const [status, setStatus] = useState<"NOT_STARTED" | "IN_PROGRESS" | "FINISHED" | undefined>(
    initialStatus,
  );
  const [note, setNote] = useState<string>(initialNote || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const percentage =
    totalUnits && totalUnits > 0
      ? Math.min(100, Math.round((currentUnit * 100) / totalUnits))
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalUnits && currentUnit > totalUnits) {
      setError(`Progress cannot exceed total units (${totalUnits})`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await progressService.upsertProgress(groupId, mediaId, {
        currentUnit,
        status,
        note: note.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["media-item", groupId, mediaId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["all-progress", groupId, mediaId] });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Progress"
      subtitle={mediaTitle}
      icon={<BookmarkCheck className="w-4 h-4 text-indigo-400" />}
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Slider & Exact Input */}
        <div className="bg-[#09090B] p-4 rounded-lg border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Current Position
            </span>
            <span className="text-xs font-mono font-semibold text-indigo-400 tabular-nums">
              {currentUnit} {totalUnits ? `/ ${totalUnits}` : "units"}{" "}
              {percentage !== null && `(${percentage}%)`}
            </span>
          </div>

          {totalUnits && (
            <>
              <input
                type="range"
                min="0"
                max={totalUnits}
                value={currentUnit}
                onChange={(e) => setCurrentUnit(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-1">
            <label className="text-xs text-zinc-400 shrink-0">Exact:</label>
            <input
              type="number"
              min="0"
              max={totalUnits || undefined}
              value={currentUnit}
              onChange={(e) => setCurrentUnit(Math.max(0, Number(e.target.value)))}
              className="w-24 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 text-center font-mono text-xs tabular-nums focus:outline-none focus:border-indigo-500"
            />
            {totalUnits && (
              <button
                type="button"
                onClick={() => setCurrentUnit(totalUnits)}
                className="text-xs text-indigo-400 hover:text-indigo-300 ml-auto font-medium"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>

        {/* Status selector */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Status Override (optional)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "NOT_STARTED", label: "Not Started" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "FINISHED", label: "Finished" },
              ] as const
            ).map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(status === s.value ? undefined : s.value)}
                className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition ${
                  status === s.value
                    ? "bg-indigo-500/15 border-indigo-500/60 text-indigo-300"
                    : "bg-[#09090B] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Leave unselected to auto-calculate from completed units.
          </p>
        </div>

        {/* Note */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
            Note / Thoughts (optional)
          </label>
          <textarea
            rows={2}
            maxLength={500}
            placeholder="e.g. Chapter 14 was wild — pausing here."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
          />
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
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Save Progress
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateProgressModal;
