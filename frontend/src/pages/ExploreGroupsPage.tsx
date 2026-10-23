import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as groupService from "../services/group.service";
import GroupCard from "../components/cards/GroupCard";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import JoinGroupModal from "../components/modals/JoinGroupModal";
import {
  Compass,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  KeyRound,
} from "lucide-react";

export const ExploreGroupsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  const {
    data: pagedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groups", debouncedSearch, page, limit],
    queryFn: () =>
      groupService.getAllGroups(
        debouncedSearch.trim() || undefined,
        page,
        limit,
      ),
  });

  const totalPages = pagedData ? Math.ceil(pagedData.total / limit) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-indigo-400" />
            Explore Public Groups
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover book clubs, movie watch parties, and gaming communities to join.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Join via Code</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search public groups by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-2xl transition"
        >
          Search
        </button>
      </form>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm">Searching public groups...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-rose-300 text-center">
          <p className="font-semibold">Failed to load public groups</p>
        </div>
      ) : pagedData && pagedData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pagedData.data.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Page <span className="font-semibold text-white">{page}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span> ({pagedData.total} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <h3 className="text-lg font-bold text-white">No Public Groups Found</h3>
          <p className="text-sm text-slate-400">
            {debouncedSearch
              ? `No groups found matching "${debouncedSearch}". Try another search query.`
              : "There are currently no public groups available. Be the first to create one!"}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition"
          >
            Create a Group
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default ExploreGroupsPage;
