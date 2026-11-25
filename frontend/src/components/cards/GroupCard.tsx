import React from "react";
import { Link } from "react-router-dom";
import { Users, Film, Lock, Globe, ArrowUpRight } from "lucide-react";
import type { GroupSummary } from "../../types/group.types";

interface GroupCardProps {
  group: GroupSummary;
  isMember?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, isMember = false }) => {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="group bg-[#111113] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between transition-colors duration-150"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-base text-zinc-100 group-hover:text-white transition truncate">
            {group.name}
          </h3>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 border ${
              group.isPublic
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-zinc-800/80 text-zinc-400 border-zinc-700/80"
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
        </div>

        <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2.25rem] leading-relaxed mb-4">
          {group.description || "No description provided for this club."}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-zinc-400 pt-3 border-t border-zinc-800/60 tabular-nums font-mono">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              {group.mediaItemCount} {group.mediaItemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/40">
          <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
            by <span className="text-zinc-300 font-medium">@{group.creatorUsername}</span>
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition">
            <span>{isMember ? "Open" : "Preview"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
