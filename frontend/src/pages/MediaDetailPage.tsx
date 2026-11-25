import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as mediaService from "../services/media.service";
import * as progressService from "../services/progress.service";
import UpdateProgressModal from "../components/modals/UpdateProgressModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { DetailPageSkeleton } from "../components/ui/Skeleton";
import {
  ArrowLeft,
  BookOpen,
  Film,
  Tv,
  Gamepad2,
  BookmarkCheck,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Circle,
  Trophy,
  Plus,
  Minus,
  MessageSquare,
} from "lucide-react";

export const MediaDetailPage: React.FC = () => {
  const { groupId, mediaId } = useParams<{ groupId: string; mediaId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quickUpdateLoading, setQuickUpdateLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["media-item", groupId, mediaId],
    queryFn: () => mediaService.getMediaItemDetails(groupId!, mediaId!),
    enabled: !!groupId && !!mediaId,
  });

  const myProgress = item?.progress.find((p) => p.userId === user?.id);

  const getParticipantLabel = (type: string, count: number): string => {
    switch (type?.toLowerCase()) {
      case "book":
        return count === 1 ? "reader" : "readers";
      case "movie":
        return count === 1 ? "viewer" : "viewers";
      case "show":
        return count === 1 ? "watcher" : "watchers";
      case "game":
        return count === 1 ? "player" : "players";
      default:
        return count === 1 ? "member" : "members";
    }
  };

  const getMediaTheme = (type: string) => {
    switch (type?.toLowerCase()) {
      case "book":
        return {
          icon: BookOpen,
          badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
          unitName: "Pages",
        };
      case "movie":
        return {
          icon: Film,
          badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/25",
          unitName: "Minutes",
        };
      case "show":
        return {
          icon: Tv,
          badgeColor: "bg-violet-500/15 text-violet-300 border-violet-500/25",
          unitName: "Episodes",
        };
      case "game":
        return {
          icon: Gamepad2,
          badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
          unitName: "Units",
        };
      default:
        return {
          icon: Film,
          badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
          unitName: "Units",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "finished":
        return {
          label: "Finished",
          color: "badge-finished",
          icon: CheckCircle,
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "badge-in-progress",
          icon: Clock,
        };
      default:
        return {
          label: "Not Started",
          color: "badge-not-started",
          icon: Circle,
        };
    }
  };

  const handleQuickStep = async (delta: number) => {
    if (!groupId || !mediaId || !item) return;
    const current = myProgress?.currentUnit || 0;
    const next = Math.max(0, current + delta);
    if (item.totalUnits && next > item.totalUnits) return;

    try {
      setQuickUpdateLoading(true);
      await progressService.upsertProgress(groupId, mediaId, {
        currentUnit: next,
        note: myProgress?.note || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["media-item", groupId, mediaId] });
      success(`Progress updated to ${next}`);
    } catch (err: any) {
      toastError(err?.response?.data?.error || "Failed to update progress");
    } finally {
      setQuickUpdateLoading(false);
    }
  };

  const handleConfirmDeleteMedia = async () => {
    if (!groupId || !mediaId) return;
    try {
      setDeleteLoading(true);
      await mediaService.removeMediaItem(groupId, mediaId);
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      success("Media item removed");
      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      toastError(err?.response?.data?.error || "Failed to remove media item");
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 bg-[#111113] border border-zinc-800 rounded-xl text-center space-y-3">
        <h2 className="text-base font-semibold text-zinc-100">Item Not Found</h2>
        <p className="text-xs text-zinc-400">
          This media item may have been removed or does not exist.
        </p>
        <Link
          to={`/groups/${groupId}`}
          className="inline-block px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-medium transition"
        >
          Back to Club
        </Link>
      </div>
    );
  }

  const theme = getMediaTheme(item.type);
  const Icon = theme.icon;

  const sortedProgress = [...item.progress].sort((a, b) => {
    if ((b.percentage || 0) !== (a.percentage || 0)) {
      return (b.percentage || 0) - (a.percentage || 0);
    }
    return b.currentUnit - a.currentUnit;
  });

  const getRankBadgeClass = (index: number) => {
    if (index === 0) return "rank-gold border border-amber-500/30";
    if (index === 1) return "rank-silver border border-zinc-600/50";
    if (index === 2) return "rank-bronze border border-amber-700/40";
    return "rank-other border border-zinc-800";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-up">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/groups/${groupId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111113] hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-zinc-100 border border-zinc-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Club</span>
        </Link>

        <button
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={deleteLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Item</span>
        </button>
      </div>

      {/* Media Detail Card */}
      <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Poster */}
          <div className="w-44 sm:w-52 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 relative">
              {item.coverUrl && !imgError ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                  <Icon className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <span className="text-[11px] font-medium text-zinc-500">
                    No artwork
                  </span>
                </div>
              )}

              <div className="absolute top-2.5 left-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#09090B]/85 border ${theme.badgeColor}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.type}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Info & Personal Progress */}
          <div className="flex-1 flex flex-col justify-between space-y-5 w-full">
            <div className="space-y-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight leading-tight">
                {item.title}
              </h1>

              {item.creator && (
                <p className="text-sm text-zinc-400">
                  by <span className="text-zinc-200 font-medium">{item.creator}</span>
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1 flex-wrap font-mono tabular-nums">
                {item.totalUnits && (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-200 border border-zinc-800">
                    {item.totalUnits} {theme.unitName}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-sans">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400 font-sans">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  {item.progress.length} {getParticipantLabel(item.type, item.progress.length)}
                </span>
              </div>

              {item.description && (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1 line-clamp-4">
                  {item.description}
                </p>
              )}
            </div>

            {/* Personal Progress Box */}
            <div className="bg-[#09090B] border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Your Progress
                    </span>
                    {myProgress && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          getStatusBadge(myProgress.status).color
                        }`}
                      >
                        {getStatusBadge(myProgress.status).label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1 font-mono tabular-nums">
                    <span className="text-xl font-bold text-zinc-100">
                      {myProgress ? myProgress.currentUnit : 0}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {item.totalUnits
                        ? `/ ${item.totalUnits} ${theme.unitName.toLowerCase()}`
                        : "units"}
                    </span>
                    {myProgress?.percentage !== null && myProgress?.percentage !== undefined && (
                      <span className="text-xs font-semibold text-indigo-400">
                        ({myProgress.percentage}%)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsUpdateProgressOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>{myProgress ? "Edit Progress" : "Start Tracking"}</span>
                </button>
              </div>

              {item.totalUnits && (
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        myProgress?.percentage !== null && myProgress?.percentage !== undefined
                          ? Math.min(100, myProgress.percentage)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 text-[11px] mr-1">Quick step:</span>
                  <button
                    onClick={() => handleQuickStep(-1)}
                    disabled={quickUpdateLoading || !myProgress || myProgress.currentUnit <= 0}
                    className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 transition"
                    title="-1"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleQuickStep(1)}
                    disabled={
                      quickUpdateLoading ||
                      (item.totalUnits ? (myProgress?.currentUnit || 0) >= item.totalUnits : false)
                    }
                    className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 transition"
                    title="+1"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleQuickStep(10)}
                    disabled={
                      quickUpdateLoading ||
                      (item.totalUnits
                        ? (myProgress?.currentUnit || 0) + 10 > item.totalUnits
                        : false)
                    }
                    className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-300 border border-zinc-800 disabled:opacity-40 transition"
                  >
                    +10
                  </button>
                </div>

                {myProgress?.note && (
                  <div className="flex items-center gap-1.5 text-zinc-400 max-w-xs truncate italic text-[11px]">
                    <MessageSquare className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">"{myProgress.note}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-indigo-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Club Leaderboard</h2>
              <p className="text-xs text-zinc-500">
                Ranked by completion across club members
              </p>
            </div>
          </div>

          <span className="text-xs font-mono tabular-nums text-zinc-400 bg-[#09090B] px-2.5 py-1 rounded-md border border-zinc-800">
            {item.progress.length} {getParticipantLabel(item.type, item.progress.length)}
          </span>
        </div>

        {sortedProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedProgress.map((prog, index) => {
              const badge = getStatusBadge(prog.status);
              const BadgeIcon = badge.icon;
              const isMe = prog.userId === user?.id;

              return (
                <div
                  key={prog.userId}
                  className={`p-4 rounded-xl border transition-colors ${
                    isMe
                      ? "bg-indigo-500/[0.06] border-indigo-500/30"
                      : "bg-[#09090B] border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold tabular-nums shrink-0 ${getRankBadgeClass(
                          index,
                        )}`}
                      >
                        #{index + 1}
                      </span>

                      {prog.avatarUrl ? (
                        <img
                          src={prog.avatarUrl}
                          alt={prog.username}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-semibold text-[11px] text-zinc-200 shrink-0">
                          {prog.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-zinc-100 truncate">
                            @{prog.username}
                          </span>
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                          {new Date(prog.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 ${badge.color}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/60">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-zinc-500 font-sans text-[11px]">Progress</span>
                      <span className="font-semibold text-zinc-200">
                        {prog.currentUnit} {item.totalUnits ? `/ ${item.totalUnits}` : "units"}{" "}
                        {prog.percentage !== null && `(${prog.percentage}%)`}
                      </span>
                    </div>

                    {item.totalUnits && (
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${
                              prog.percentage !== null ? Math.min(100, prog.percentage) : 0
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {prog.note && (
                    <div className="mt-2.5 px-3 py-2 bg-zinc-900/40 rounded-lg border border-zinc-800/60 text-xs text-zinc-300 italic flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                      <span>"{prog.note}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-zinc-500 text-xs">
            No one has logged progress on this {item.type.toLowerCase()} yet.
          </div>
        )}
      </div>

      <UpdateProgressModal
        groupId={groupId!}
        mediaId={mediaId!}
        mediaTitle={item.title}
        totalUnits={item.totalUnits}
        initialUnit={myProgress?.currentUnit || 0}
        initialStatus={
          myProgress?.status === "finished"
            ? "FINISHED"
            : myProgress?.status === "in_progress"
            ? "IN_PROGRESS"
            : "NOT_STARTED"
        }
        initialNote={myProgress?.note}
        isOpen={isUpdateProgressOpen}
        onClose={() => setIsUpdateProgressOpen(false)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remove Media Item?"
        message="This will remove the item from this club and delete all member progress associated with it."
        confirmLabel="Remove Item"
        loading={deleteLoading}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDeleteMedia}
      />
    </div>
  );
};

export default MediaDetailPage;
