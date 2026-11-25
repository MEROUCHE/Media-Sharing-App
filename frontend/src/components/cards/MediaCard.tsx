import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Film, Tv, Gamepad2 } from "lucide-react";
import type { MediaItemSummary } from "../../types/group.types";

interface MediaCardProps {
  groupId: string;
  item: MediaItemSummary;
}

export const MediaCard: React.FC<MediaCardProps> = ({ groupId, item }) => {
  const [imgError, setImgError] = useState(false);

  const getTypeMeta = (type: string) => {
    switch (type?.toLowerCase()) {
      case "book":
        return {
          icon: BookOpen,
          label: "Book",
          color: "bg-amber-500/15 text-amber-300 border-amber-500/25",
        };
      case "movie":
        return {
          icon: Film,
          label: "Movie",
          color: "bg-sky-500/15 text-sky-300 border-sky-500/25",
        };
      case "show":
        return {
          icon: Tv,
          label: "Show",
          color: "bg-violet-500/15 text-violet-300 border-violet-500/25",
        };
      case "game":
        return {
          icon: Gamepad2,
          label: "Game",
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        };
      default:
        return {
          icon: Film,
          label: type,
          color: "bg-zinc-800 text-zinc-300 border-zinc-700",
        };
    }
  };

  const badge = getTypeMeta(item.type);
  const Icon = badge.icon;

  const getUnitsLabel = (type: string, units?: number | null) => {
    if (!units) return null;
    switch (type?.toLowerCase()) {
      case "book":
        return `${units}p`;
      case "movie":
        return `${units}m`;
      case "show":
        return `${units} ep`;
      case "game":
        return `${units}u`;
      default:
        return `${units}u`;
    }
  };

  return (
    <Link
      to={`/groups/${groupId}/media/${item.id}`}
      className="group bg-[#111113] border border-zinc-800/80 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col transition-colors duration-150"
    >
      {/* Consistent 2:3 Poster Aspect */}
      <div className="relative aspect-[2/3] bg-zinc-950 overflow-hidden">
        {item.coverUrl && !imgError ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-zinc-600 p-4 text-center">
            <Icon className="w-8 h-8 mb-2 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-zinc-500 line-clamp-2">
              {item.title}
            </span>
          </div>
        )}

        {/* Compact Type Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#09090B]/85 border ${badge.color}`}
          >
            <Icon className="w-3 h-3" />
            <span>{badge.label}</span>
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
        <div>
          <h4 className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-1 group-hover:text-white transition">
            {item.title}
          </h4>
          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
            {item.creator || "Unknown creator"}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono tabular-nums">
          <span>{getUnitsLabel(item.type, item.totalUnits) || "Flexible"}</span>
          <span className="text-indigo-400 font-sans font-medium opacity-80 group-hover:opacity-100">
            Track →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MediaCard;
