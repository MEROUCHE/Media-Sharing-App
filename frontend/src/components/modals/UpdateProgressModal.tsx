import React, { useState } from "react";
import { X, Check, Loader2, BookmarkCheck } from "lucide-react";
import * as progressService from "../../services/progress.service";
import { useQueryClient } from "@tanstack/react-query";

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
              <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Update Progress</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{mediaTitle}</p>
            </div>
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

          {/* Progress Slider & Input */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Position
              </span>
              <span className="text-sm font-bold text-indigo-400">
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
                {/* Visual completion bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-200"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs text-slate-400 shrink-0">Exact number:</label>
              <input
                type="number"
                min="0"
                max={totalUnits || undefined}
                value={currentUnit}
                onChange={(e) => setCurrentUnit(Math.max(0, Number(e.target.value)))}
                className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-center font-mono focus:outline-none focus:border-indigo-500"
              />
              {totalUnits && (
                <button
                  type="button"
                  onClick={() => setCurrentUnit(totalUnits)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 ml-auto"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                    status === s.value
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              If omitted, status will calculate automatically based on completed units.
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Note / Thoughts (optional)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="e.g. Chapter 14 was crazy! Taking a break here."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            />
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
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProgressModal;
