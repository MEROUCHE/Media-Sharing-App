import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as groupService from "../services/group.service";
import MediaCard from "../components/cards/MediaCard";
import AddMediaModal from "../components/modals/AddMediaModal";
import EditGroupModal from "../components/modals/EditGroupModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { DetailPageSkeleton } from "../components/ui/Skeleton";
import {
  Users,
  Film,
  Globe,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  LogOut,
  Edit,
  UserX,
  Crown,
} from "lucide-react";

export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<"media" | "members">("media");
  const [selectedMediaType, setSelectedMediaType] = useState<string>("ALL");
  const [copiedCode, setCopiedCode] = useState(false);

  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", confirmLabel: "Confirm", onConfirm: () => {} });

  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group", id],
    queryFn: () => groupService.getGroupById(id!),
    enabled: !!id,
  });

  const isCreator = group && user && group.creatorId === user.id;
  const isMember = group?.members.some((m) => m.userId === user?.id);

  const handleCopyCode = () => {
    if (!group?.inviteCode) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRefreshCode = () => {
    setConfirmDialog({
      open: true,
      title: "Regenerate Invite Code?",
      message:
        "The previous invite code will stop working immediately. Anyone using the old code won't be able to join.",
      confirmLabel: "Regenerate",
      onConfirm: async () => {
        if (!id || !isCreator) return;
        try {
          setActionLoading(true);
          await groupService.refreshInviteCode(id);
          queryClient.invalidateQueries({ queryKey: ["group", id] });
          success("Invite code regenerated");
        } catch (err: any) {
          toastError(err?.response?.data?.error || "Failed to refresh code");
        } finally {
          setActionLoading(false);
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      },
    });
  };

  const handleJoin = async () => {
    if (!group?.inviteCode) return;
    try {
      setActionLoading(true);
      await groupService.joinGroupByCode(group.inviteCode);
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      success("Joined club");
    } catch (err: any) {
      toastError(err?.response?.data?.error || "Failed to join club");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    setConfirmDialog({
      open: true,
      title: "Leave Club?",
      message:
        "You will lose access to all media and progress in this club. You can rejoin later with an invite code.",
      confirmLabel: "Leave Club",
      onConfirm: async () => {
        if (!id) return;
        try {
          setActionLoading(true);
          await groupService.leaveGroup(id);
          queryClient.invalidateQueries({ queryKey: ["my-groups"] });
          navigate("/");
        } catch (err: any) {
          toastError(err?.response?.data?.error || "Failed to leave club");
          setActionLoading(false);
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      },
    });
  };

  const handleDeleteGroup = () => {
    setConfirmDialog({
      open: true,
      title: "Delete Club?",
      message:
        "This action is permanent. All media items, progress records, and memberships will be deleted.",
      confirmLabel: "Delete Club",
      onConfirm: async () => {
        if (!id || !isCreator) return;
        try {
          setActionLoading(true);
          await groupService.deleteGroup(id);
          queryClient.invalidateQueries({ queryKey: ["my-groups"] });
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          navigate("/");
        } catch (err: any) {
          toastError(err?.response?.data?.error || "Failed to delete club");
          setActionLoading(false);
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      },
    });
  };

  const handleKickMember = (targetUserId: string, username: string) => {
    setConfirmDialog({
      open: true,
      title: `Remove @${username}?`,
      message: `@${username} will be removed from this club and lose access to its library.`,
      confirmLabel: "Remove Member",
      onConfirm: async () => {
        if (!id || !isCreator) return;
        try {
          setActionLoading(true);
          await groupService.removeGroupMember(id, targetUserId);
          queryClient.invalidateQueries({ queryKey: ["group", id] });
          success(`@${username} removed`);
        } catch (err: any) {
          toastError(err?.response?.data?.error || "Failed to remove member");
        } finally {
          setActionLoading(false);
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      },
    });
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !group) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 bg-[#111113] border border-zinc-800 rounded-xl text-center space-y-3">
        <h2 className="text-base font-semibold text-zinc-100">Club Not Found</h2>
        <p className="text-xs text-zinc-400">
          This club does not exist or you don't have permission to view it.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-medium transition"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredMedia =
    selectedMediaType === "ALL"
      ? group.mediaItems
      : group.mediaItems.filter(
          (m) => m.type.toLowerCase() === selectedMediaType.toLowerCase(),
        );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-up">
      {/* Header Card */}
      <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  group.isPublic
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-zinc-800/80 text-zinc-300 border-zinc-700"
                }`}
              >
                {group.isPublic ? (
                  <>
                    <Globe className="w-3 h-3" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" /> Private
                  </>
                )}
              </span>

              {isCreator && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Crown className="w-3 h-3 text-amber-400" /> Owner
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              {group.name}
            </h1>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {group.description || "No description provided for this club."}
            </p>
          </div>

          {/* Right Controls: Invite Code & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <div className="bg-[#09090B] border border-zinc-800 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-4">
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-medium text-zinc-500">
                  Invite Code
                </span>
                <span className="font-mono text-sm font-semibold text-zinc-100 tracking-wider tabular-nums">
                  {group.inviteCode}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyCode}
                  title="Copy Invite Code"
                  className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {isCreator && (
                  <button
                    onClick={handleRefreshCode}
                    disabled={actionLoading}
                    title="Regenerate Invite Code"
                    className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isMember ? (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-xs rounded-lg transition"
                >
                  Join Club
                </button>
              ) : isCreator ? (
                <>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Club
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "media"
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-[#09090B] text-zinc-400 hover:text-zinc-100 border border-zinc-800"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Media ({group.mediaItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "members"
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-[#09090B] text-zinc-400 hover:text-zinc-100 border border-zinc-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({group.members.length})</span>
            </button>
          </div>

          {activeTab === "media" && isMember && (
            <button
              onClick={() => setIsAddMediaOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Media</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Tab */}
      {activeTab === "media" && (
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["ALL", "BOOK", "MOVIE", "SHOW", "GAME"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMediaType(type)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  selectedMediaType === type
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "bg-[#111113] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                }`}
              >
                {type === "ALL"
                  ? "All"
                  : type.charAt(0) + type.slice(1).toLowerCase() + "s"}
              </button>
            ))}
          </div>

          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <MediaCard key={item.id} groupId={id!} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-[#111113] border border-dashed border-zinc-800 rounded-xl p-10 text-center max-w-md mx-auto space-y-3">
              <Film className="w-7 h-7 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">No media items yet</h3>
                <p className="text-xs text-zinc-400">
                  {selectedMediaType === "ALL"
                    ? "Add a book, movie, show, or game to start tracking."
                    : `No ${selectedMediaType.toLowerCase()}s in this club yet.`}
                </p>
              </div>
              {isMember && (
                <button
                  onClick={() => setIsAddMediaOpen(true)}
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
                >
                  Add Media
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h3 className="text-sm font-semibold text-zinc-100">Members</h3>
            <span className="text-xs text-zinc-500 font-mono tabular-nums">
              {group.members.length} total
            </span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {group.members.map((member) => {
              const isOwner = member.userId === group.creatorId;
              const isSelf = member.userId === user?.id;

              return (
                <div
                  key={member.userId}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.username}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-semibold text-zinc-200 text-xs">
                        {member.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-100">
                          @{member.username}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            You
                          </span>
                        )}
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            <Crown className="w-2.5 h-2.5" /> Owner
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isCreator && !isSelf && (
                    <button
                      onClick={() => handleKickMember(member.userId, member.username)}
                      title="Remove member"
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddMediaModal
        groupId={id!}
        isOpen={isAddMediaOpen}
        onClose={() => setIsAddMediaOpen(false)}
      />
      <EditGroupModal
        groupId={id!}
        initialName={group.name}
        initialDescription={group.description}
        initialIsPublic={group.isPublic}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        loading={actionLoading}
        onCancel={() => setConfirmDialog((d) => ({ ...d, open: false }))}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};

export default GroupDetailPage;
