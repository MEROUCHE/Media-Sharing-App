import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as groupService from "../services/group.service";
import GroupCard from "../components/cards/GroupCard";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import JoinGroupModal from "../components/modals/JoinGroupModal";
import {
  Users,
  PlusCircle,
  KeyRound,
  Loader2,
  FolderOpen,
  Sparkles,
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
      (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === "OWNED") return group.creatorId === user?.id;
    if (filterMode === "JOINED") return group.creatorId !== user?.id;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/50 p-6 sm:p-10 shadow-2xl glow-indigo">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Media Tracker & Social Clubs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hello, {user?.username}! 👋
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Track books you read, movies and series you watch, and games you conquer alongside your friends in shared media clubs.
            </p>

            {/* Quick Stat Pills */}
            <div className="flex items-center gap-4 pt-2 flex-wrap text-xs text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 rounded-xl border border-white/5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">{myGroups?.length || 0}</span>
                <span className="text-slate-400">Clubs</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 rounded-xl border border-white/5">
                <Film className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white">{totalMedia}</span>
                <span className="text-slate-400">Items Tracked</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700/80 transition shadow-sm active:scale-95"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Enter Invite Code</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Club</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Clubs Filter & Search */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterMode === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Clubs ({myGroups?.length || 0})
            </button>
            <button
              onClick={() => setFilterMode("OWNED")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterMode === "OWNED"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Created by Me</span>
            </button>
            <button
              onClick={() => setFilterMode("JOINED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterMode === "JOINED"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Joined
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter your clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Group Cards Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Loading your clubs...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-950/20 border border-rose-900/40 rounded-3xl text-rose-300 text-center space-y-2">
            <p className="font-bold">Failed to connect to backend</p>
            <p className="text-xs text-rose-400">Please verify Spring Boot is running on port 8080.</p>
          </div>
        ) : filteredGroups && filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} isMember={true} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="glass-panel border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="inline-flex p-4 bg-slate-800/60 rounded-2xl text-indigo-400">
              <FolderOpen className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {searchQuery ? "No matching clubs found" : "No Media Clubs Joined Yet"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search filter or clear the query."
                  : "You are not a member of any media group yet. Start by creating a club or exploring public ones."}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Create a Club
              </button>
              <Link
                to="/explore"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Explore Public Clubs
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default DashboardPage;
