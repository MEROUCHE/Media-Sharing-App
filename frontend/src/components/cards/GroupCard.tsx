import React from "react";
import { Link } from "react-router-dom";
import { Users, Film, Lock, Globe, ArrowRight } from "lucide-react";
import type { GroupSummary } from "../../types/group.types";

interface GroupCardProps {
  group: GroupSummary;
  isMember?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, isMember = false }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition truncate">
            {group.name}
          </h3>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
              group.isPublic
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
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

        <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] mb-4">
          {group.description || "No description provided for this group."}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400 py-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-500" />
            <span>
              {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Film className="w-4 h-4 text-slate-500" />
            <span>
              {group.mediaItemCount} {group.mediaItemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
          <span className="text-2xs text-slate-500 truncate max-w-[140px]">
            Created by <span className="text-slate-400 font-medium">@{group.creatorUsername}</span>
          </span>

          <Link
            to={`/groups/${group.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>{isMember ? "View Group" : "View & Join"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
