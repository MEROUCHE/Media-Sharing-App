import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as mediaService from "../services/media.service";
import * as progressService from "../services/progress.service";
import UpdateProgressModal from "../components/modals/UpdateProgressModal";
import {
  ArrowLeft,
  BookOpen,
  Film,
  Tv,
  Gamepad2,
  BookmarkCheck,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quickUpdateLoading, setQuickUpdateLoading] = useState(false);

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

  // Dynamic participant label matching media type
  const getParticipantLabel = (type: string, count: number): string => {
    const norm = type?.toLowerCase();
    switch (norm) {
      case "book":
        return count === 1 ? "reader" : "readers";
      case "movie":
        return count === 1 ? "viewer" : "viewers";
      case "show":
        return count === 1 ? "watcher" : "watchers";
      case "game":
        return count === 1 ? "player" : "players";
      default:
        return count === 1 ? "member tracking" : "members tracking";
    }
  };

  const getMediaTheme = (type: string) => {
    switch (type?.toLowerCase()) {
      case "book":
        return {
          icon: BookOpen,
          badgeColor: "bg-amber-950/60 text-amber-400 border-amber-800/40",
          glowColor: "shadow-amber-500/10",
          unitName: "Pages",
          singleUnit: "page",
        };
      case "movie":
        return {
          icon: Film,
          badgeColor: "bg-sky-950/60 text-sky-400 border-sky-800/40",
          glowColor: "shadow-sky-500/10",
          unitName: "Minutes",
          singleUnit: "minute",
        };
      case "show":
        return {
          icon: Tv,
          badgeColor: "bg-purple-950/60 text-purple-400 border-purple-800/40",
          glowColor: "shadow-purple-500/10",
          unitName: "Episodes",
          singleUnit: "episode",
        };
      case "game":
        return {
          icon: Gamepad2,
          badgeColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
          glowColor: "shadow-emerald-500/10",
          unitName: "Units / Hours",
          singleUnit: "unit",
        };
      default:
        return {
          icon: Film,
          badgeColor: "bg-indigo-950/60 text-indigo-400 border-indigo-800/40",
          glowColor: "shadow-indigo-500/10",
          unitName: "Units",
          singleUnit: "unit",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "finished":
        return {
          label: "Completed",
          color: "bg-emerald-950/70 text-emerald-300 border-emerald-700/50",
          icon: CheckCircle,
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-indigo-950/70 text-indigo-300 border-indigo-700/50",
          icon: Clock,
        };
      default:
        return {
          label: "Not Started",
          color: "bg-slate-900 text-slate-400 border-slate-800",
          icon: Sparkles,
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
      success(`Updated progress to ${next} ${theme.unitName.toLowerCase()}`);
    } catch (err: any) {
      toastError(err?.response?.data?.error || "Failed to update progress");
    } finally {
      setQuickUpdateLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!groupId || !mediaId) return;
    if (
      !window.confirm(
        "Are you sure you want to remove this media item from the group? All member progress on it will be deleted.",
      )
    )
      return;

    try {
      setDeleteLoading(true);
      await mediaService.removeMediaItem(groupId, mediaId);
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      success("Media item removed successfully");
      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      toastError(err?.response?.data?.error || "Failed to remove media item");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium">Loading media details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-3xl text-center space-y-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Item Not Found</h2>
        <p className="text-sm text-slate-400">
          This media item may have been removed or does not exist.
        </p>
        <Link
          to={`/groups/${groupId}`}
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
        >
          Back to Group
        </Link>
      </div>
    );
  }

  const theme = getMediaTheme(item.type);
  const Icon = theme.icon;

  // Sort progress for leaderboard: highest percentage/unit first
  const sortedProgress = [...item.progress].sort((a, b) => {
    if ((b.percentage || 0) !== (a.percentage || 0)) {
      return (b.percentage || 0) - (a.percentage || 0);
    }
    return b.currentUnit - a.currentUnit;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/groups/${groupId}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Group</span>
        </Link>

        <button
          onClick={handleDeleteMedia}
          disabled={deleteLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 transition"
        >
          {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>Remove from Club</span>
        </button>
      </div>

      {/* Hero Media Showcase Card */}
      <div className={`glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl ${theme.glowColor}`}>
        {/* Ambient background blur */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Cover Poster with realistic styling */}
          <div className="w-full sm:w-56 md:w-64 shrink-0 mx-auto md:mx-0">
            <div className="aspect-2/3 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-4">
                  <Icon className="w-16 h-16 mb-2" />
                  <span className="text-xs font-medium">No artwork available</span>
                </div>
              )}

              {/* Type pill on poster */}
              <div className="absolute top-3 left-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border ${theme.badgeColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.type}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Media Info & Primary Personal Progress Box */}
          <div className="flex-1 flex flex-col justify-between space-y-6 w-full">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {item.title}
              </h1>

              {item.creator && (
                <p className="text-base sm:text-lg text-slate-300 font-medium">
                  by <span className="text-white font-semibold">{item.creator}</span>
                </p>
              )}

              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pt-1 flex-wrap">
                {item.totalUnits && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 font-semibold">
                    {item.totalUnits} {theme.unitName}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  {item.progress.length} {getParticipantLabel(item.type, item.progress.length)}
                </span>
              </div>

              {item.description && (
                <p className="text-sm text-slate-300/90 leading-relaxed pt-2 line-clamp-4">
                  {item.description}
                </p>
              )}
            </div>

            {/* Interactive Progress Card for the Current User */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                      Your Position
                    </span>
                    {myProgress && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold border ${
                          getStatusBadge(myProgress.status).color
                        }`}
                      >
                        {getStatusBadge(myProgress.status).label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-2xl font-extrabold text-white">
                      {myProgress ? myProgress.currentUnit : 0}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">
                      {item.totalUnits ? `/ ${item.totalUnits} ${theme.unitName.toLowerCase()}` : "units tracked"}
                    </span>
                    {myProgress?.percentage !== null && myProgress?.percentage !== undefined && (
                      <span className="text-sm font-bold text-indigo-400 ml-1">
                        ({myProgress.percentage}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsUpdateProgressOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>{myProgress ? "Edit Progress & Note" : "Start Tracking"}</span>
                  </button>
                </div>
              </div>

              {/* Visual Progress Bar */}
              {item.totalUnits && (
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-300"
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

              {/* Quick Stepper Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Quick step:</span>
                  <button
                    onClick={() => handleQuickStep(-1)}
                    disabled={quickUpdateLoading || !myProgress || myProgress.currentUnit <= 0}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-40 transition"
                    title="-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleQuickStep(1)}
                    disabled={
                      quickUpdateLoading ||
                      (item.totalUnits ? (myProgress?.currentUnit || 0) >= item.totalUnits : false)
                    }
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-40 transition"
                    title="+1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleQuickStep(10)}
                    disabled={
                      quickUpdateLoading ||
                      (item.totalUnits ? (myProgress?.currentUnit || 0) + 10 > item.totalUnits : false)
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 disabled:opacity-40 transition"
                  >
                    +10
                  </button>
                </div>

                {myProgress?.note && (
                  <div className="flex items-center gap-1.5 text-slate-400 max-w-xs truncate italic">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">"{myProgress.note}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Members Leaderboard Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Club Leaderboard</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time progress of all members tracking this {item.type.toLowerCase()}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
            {item.progress.length} {getParticipantLabel(item.type, item.progress.length)}
          </span>
        </div>

        {sortedProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedProgress.map((prog, index) => {
              const badge = getStatusBadge(prog.status);
              const BadgeIcon = badge.icon;
              const isMe = prog.userId === user?.id;

              return (
                <div
                  key={prog.userId}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                    isMe
                      ? "bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20"
                      : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          index === 0
                            ? "bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30"
                            : index === 1
                            ? "bg-slate-300 text-slate-950"
                            : index === 2
                            ? "bg-amber-700 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* Avatar */}
                      {prog.avatarUrl ? (
                        <img
                          src={prog.avatarUrl}
                          alt={prog.username}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                          {prog.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">
                            @{prog.username}
                          </span>
                          {isMe && (
                            <span className="text-3xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-2xs text-slate-500">
                          {new Date(prog.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold border ${badge.color}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>

                  {/* Position Bar & Percentage */}
                  <div className="space-y-1.5 mt-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Position</span>
                      <span className="font-bold text-white">
                        {prog.currentUnit} {item.totalUnits ? `/ ${item.totalUnits}` : "units"}{" "}
                        {prog.percentage !== null && `(${prog.percentage}%)`}
                      </span>
                    </div>

                    {item.totalUnits && (
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
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
                    <div className="mt-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs text-slate-300 italic flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>"{prog.note}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">
            No one has started tracking this {item.type.toLowerCase()} yet. Be the first to track your progress!
          </div>
        )}
      </div>

      {/* Modal */}
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
    </div>
  );
};

export default MediaDetailPage;
