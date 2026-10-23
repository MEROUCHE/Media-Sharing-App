import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Film, Tv, Gamepad2, ArrowUpRight } from "lucide-react";
import type { MediaItemSummary } from "../../types/group.types";

interface MediaCardProps {
  groupId: string;
  item: MediaItemSummary;
}

export const MediaCard: React.FC<MediaCardProps> = ({ groupId, item }) => {
  const getTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case "book":
        return {
          icon: BookOpen,
          label: "Book",
          color: "bg-amber-950/70 text-amber-400 border-amber-800/40",
        };
      case "movie":
        return {
          icon: Film,
          label: "Movie",
          color: "bg-blue-950/70 text-blue-400 border-blue-800/40",
        };
      case "show":
        return {
          icon: Tv,
          label: "Show",
          color: "bg-purple-950/70 text-purple-400 border-purple-800/40",
        };
      case "game":
        return {
          icon: Gamepad2,
          label: "Game",
          color: "bg-emerald-950/70 text-emerald-400 border-emerald-800/40",
        };
      default:
        return {
          icon: Film,
          label: type,
          color: "bg-slate-800 text-slate-300 border-slate-700",
        };
    }
  };

  const badge = getTypeBadge(item.type);
  const Icon = badge.icon;

  const getUnitsLabel = (type: string, units?: number | null) => {
    if (!units) return null;
    switch (type?.toLowerCase()) {
      case "book":
        return `${units} pages`;
      case "movie":
        return `${units} mins`;
      case "show":
        return `${units} eps`;
      case "game":
        return `${units} units`;
      default:
        return `${units} units`;
    }
  };

  return (
    <Link
      to={`/groups/${groupId}/media/${item.id}`}
      className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5"
    >
      {/* Cover Image */}
      <div className="relative aspect-2/3 bg-slate-950 overflow-hidden">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-4">
            <Icon className="w-12 h-12 mb-2" />
            <span className="text-xs font-medium">No cover art</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border ${badge.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600/90 text-white rounded-lg text-xs font-semibold shadow-lg">
            Track Progress <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-indigo-400 transition">
            {item.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {item.creator || "Unknown creator"}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-2xs text-slate-500">
          <span>{getUnitsLabel(item.type, item.totalUnits) || "Flexible tracking"}</span>
          <span className="text-indigo-400 font-semibold group-hover:underline">
            Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MediaCard;
