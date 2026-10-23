import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as groupService from "../services/group.service";
import MediaCard from "../components/cards/MediaCard";
import AddMediaModal from "../components/modals/AddMediaModal";
import EditGroupModal from "../components/modals/EditGroupModal";
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
  Loader2,
  UserX,
  Crown,
  AlertTriangle,
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

  // Modals state
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirmation dialog state
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
      message: "The previous invite code will stop working immediately. Anyone with the old code won't be able to join.",
      confirmLabel: "Regenerate",
      onConfirm: async () => {
        if (!id || !isCreator) return;
        try {
          setActionLoading(true);
          await groupService.refreshInviteCode(id);
          queryClient.invalidateQueries({ queryKey: ["group", id] });
          success("Invite code regenerated successfully!");
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
      success("You've joined the group!");
    } catch (err: any) {
      toastError(err?.response?.data?.error || "Failed to join group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    setConfirmDialog({
      open: true,
      title: "Leave Group?",
      message: "You will lose access to all media and progress in this group. You can rejoin later with the invite code.",
      confirmLabel: "Leave Group",
      onConfirm: async () => {
        if (!id) return;
        try {
          setActionLoading(true);
          await groupService.leaveGroup(id);
          queryClient.invalidateQueries({ queryKey: ["my-groups"] });
          navigate("/");
        } catch (err: any) {
          toastError(err?.response?.data?.error || "Failed to leave group");
          setActionLoading(false);
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      },
    });
  };

  const handleDeleteGroup = () => {
    setConfirmDialog({
      open: true,
      title: "Delete Group?",
      message: "This action is permanent. All media tracking, progress records, and memberships will be deleted forever.",
      confirmLabel: "Delete Group",
      onConfirm: async () => {
        if (!id || !isCreator) return;
        try {
          setActionLoading(true);
          await groupService.deleteGroup(id);
          queryClient.invalidateQueries({ queryKey: ["my-groups"] });
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          navigate("/");
        } catch (err: any) {
          toastError(err?.response?.data?.error || "Failed to delete group");
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
      message: `@${username} will be removed from this group and lose access to all its content.`,
      confirmLabel: "Remove Member",
      onConfirm: async () => {
        if (!id || !isCreator) return;
        try {
          await groupService.removeGroupMember(id, targetUserId);
          queryClient.invalidateQueries({ queryKey: ["group", id] });
          success(`@${username} has been removed from the group.`);
        } catch (err: any) {
          toastError(err?.response?.data?.error || "Failed to remove member");
        } finally {
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm">Loading group details...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Group Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested group does not exist or you don't have permission to view it.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
        >
          Return to Dashboard
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  group.isPublic
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                    : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                }`}
              >
                {group.isPublic ? (
                  <>
                    <Globe className="w-3.5 h-3.5" /> Public Group
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Private Group
                  </>
                )}
              </span>

              {isCreator && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> You own this group
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {group.name}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {group.description || "No description provided for this group."}
            </p>
          </div>

          {/* Right Action Box: Invite Code & Membership Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* Invite code block */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-500">
                  Invite Code
                </span>
                <span className="font-mono text-base font-bold text-amber-400 tracking-wider">
                  {group.inviteCode}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  title="Copy Invite Code"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {isCreator && (
                  <button
                    onClick={handleRefreshCode}
                    disabled={actionLoading}
                    title="Regenerate Invite Code"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Member Action buttons */}
            <div className="flex items-center gap-2">
              {!isMember ? (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-sm transition"
                >
                  Join Group
                </button>
              ) : isCreator ? (
                <>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-xl transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Group
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "media"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Media Items ({group.mediaItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "members"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members ({group.members.length})</span>
            </button>
          </div>

          {activeTab === "media" && isMember && (
            <button
              onClick={() => setIsAddMediaOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Media Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Media Items List */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Media Type Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {["ALL", "BOOK", "MOVIE", "SHOW", "GAME"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMediaType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedMediaType === type
                    ? "bg-slate-200 text-slate-900"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {type === "ALL" ? "All Items" : type.charAt(0) + type.slice(1).toLowerCase() + "s"}
              </button>
            ))}
          </div>

          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredMedia.map((item) => (
                <MediaCard key={item.id} groupId={id!} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
              <Film className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No media items yet</h3>
                <p className="text-xs text-slate-400">
                  {selectedMediaType === "ALL"
                    ? "Be the first member to add a book, movie, or game to this club."
                    : `No ${selectedMediaType.toLowerCase()} items found in this group.`}
                </p>
              </div>
              {isMember && (
                <button
                  onClick={() => setIsAddMediaOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Add Media
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Group Members List */}
      {activeTab === "members" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Group Members</h3>
            <span className="text-xs text-slate-400">{group.members.length} enrolled</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {group.members.map((member) => {
              const isOwner = member.userId === group.creatorId;
              const isSelf = member.userId === user?.id;

              return (
                <div
                  key={member.userId}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
                        {member.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          @{member.username}
                        </span>
                        {isSelf && (
                          <span className="text-3xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            You
                          </span>
                        )}
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 text-3xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40 font-semibold">
                            <Crown className="w-3 h-3" /> Owner
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Kick member button (only owner can kick, cannot kick self) */}
                  {isCreator && !isSelf && (
                    <button
                      onClick={() => handleKickMember(member.userId, member.username)}
                      title="Remove member"
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition"
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

      {/* Modals */}
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

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;
