import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as groupService from "../services/group.service";
import GroupCard from "../components/cards/GroupCard";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import JoinGroupModal from "../components/modals/JoinGroupModal";
import { GroupCardSkeleton } from "../components/ui/Skeleton";
import {
  Users,
  Plus,
  KeyRound,
  FolderOpen,
  Film,
  Crown,
  Search,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<"ALL" | "OWNED" | "JOINED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: myGroups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-groups"],
    queryFn: groupService.getMyGroups,
  });

  const totalMedia = myGroups?.reduce((acc, g) => acc + g.mediaItemCount, 0) || 0;

  const filteredGroups = myGroups?.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === "OWNED") return group.creatorId === user?.id;
    if (filterMode === "JOINED") return group.creatorId !== user?.id;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-up">
      {/* Header Bar */}
      <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Workspace</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-200 font-medium">@{user?.username}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            Your Media Clubs
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Track books, movies, shows, and games alongside friends in shared clubs.
          </p>

          <div className="flex items-center gap-3 pt-1 flex-wrap text-xs text-zinc-400 font-mono tabular-nums">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#09090B] rounded-lg border border-zinc-800/80">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-zinc-100">{myGroups?.length || 0}</span>
              <span className="text-zinc-500 font-sans">Clubs</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#09090B] rounded-lg border border-zinc-800/80">
              <Film className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-zinc-100">{totalMedia}</span>
              <span className="text-zinc-500 font-sans">Items tracked</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#09090B] hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-800 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Enter Code</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Club</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterMode === "ALL"
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-[#111113] text-zinc-400 hover:text-zinc-100 border border-zinc-800/80"
              }`}
            >
              All ({myGroups?.length || 0})
            </button>
            <button
              onClick={() => setFilterMode("OWNED")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterMode === "OWNED"
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-[#111113] text-zinc-400 hover:text-zinc-100 border border-zinc-800/80"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Created by Me</span>
            </button>
            <button
              onClick={() => setFilterMode("JOINED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterMode === "JOINED"
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-[#111113] text-zinc-400 hover:text-zinc-100 border border-zinc-800/80"
              }`}
            >
              Joined
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#111113] border border-zinc-800/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Grid / Skeletons / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <GroupCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-center space-y-1">
            <p className="text-sm font-medium">Failed to load clubs</p>
            <p className="text-xs text-rose-400/80">
              Please verify the backend server is running and try refreshing.
            </p>
          </div>
        ) : filteredGroups && filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} isMember={true} />
            ))}
          </div>
        ) : (
          <div className="bg-[#111113] border border-dashed border-zinc-800 rounded-xl p-10 text-center max-w-md mx-auto space-y-4">
            <div className="inline-flex p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-100">
                {searchQuery ? "No matching clubs" : "No clubs yet"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {searchQuery
                  ? "Try clearing your search filter."
                  : "Create your own club or explore public clubs to start tracking."}
              </p>
            </div>
            <div className="pt-1 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-lg text-xs transition"
              >
                Create Club
              </button>
              <Link
                to="/explore"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium rounded-lg text-xs transition"
              >
                Explore Public
              </Link>
            </div>
          </div>
        )}
      </div>

      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default DashboardPage;
