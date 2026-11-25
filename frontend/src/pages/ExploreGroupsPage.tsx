import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as groupService from "../services/group.service";
import GroupCard from "../components/cards/GroupCard";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import JoinGroupModal from "../components/modals/JoinGroupModal";
import { GroupCardSkeleton } from "../components/ui/Skeleton";
import {
  Compass,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2 tracking-tight">
            <Compass className="w-5 h-5 text-indigo-400" />
            Explore Public Clubs
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Discover book clubs, film watch groups, and gaming communities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111113] hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-800 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Join via Code</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Club</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search public clubs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#111113] border border-zinc-800/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs transition"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition"
        >
          Search
        </button>
      </form>

      {/* Grid / Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <GroupCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-center text-xs font-medium">
          Failed to load public clubs.
        </div>
      ) : pagedData && pagedData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedData.data.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-5 border-t border-zinc-800/80">
              <span className="text-xs text-zinc-400 font-mono tabular-nums">
                Page <span className="font-semibold text-zinc-100">{page}</span> /{" "}
                <span className="font-semibold text-zinc-100">{totalPages}</span> ({pagedData.total} clubs)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111113] text-zinc-300 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111113] text-zinc-300 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#111113] border border-dashed border-zinc-800 rounded-xl p-10 text-center max-w-md mx-auto space-y-3">
          <h3 className="text-sm font-semibold text-zinc-100">No Public Clubs Found</h3>
          <p className="text-xs text-zinc-400">
            {debouncedSearch
              ? `No clubs matched "${debouncedSearch}".`
              : "No public clubs exist yet. Be the first to create one!"}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-lg text-xs transition"
          >
            Create Club
          </button>
        </div>
      )}

      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default ExploreGroupsPage;
