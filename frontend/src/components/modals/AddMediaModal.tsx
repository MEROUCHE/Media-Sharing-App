import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Film,
  Tv,
  Gamepad2,
  Plus,
  Loader2,
  Check,
} from "lucide-react";
import type { MediaType, ExternalSearchResult } from "../../types/media.types";
import * as mediaService from "../../services/media.service";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../ui/Modal";

interface AddMediaModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AddMediaModal: React.FC<AddMediaModalProps> = ({
  groupId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"search" | "manual">("search");
  const [mediaType, setMediaType] = useState<MediaType>("BOOK");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExternalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [totalUnits, setTotalUnits] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setSearchError(null);
      const results = await mediaService.searchExternalMedia(
        searchQuery.trim(),
        mediaType.toLowerCase(),
      );
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError("No results found. Try another query or add manually.");
      }
    } catch (err: any) {
      setSearchError(err?.response?.data?.error || "Failed to search external media");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = async (item: ExternalSearchResult) => {
    try {
      setIsSearching(true);
      if (item.externalId) {
        const details = await mediaService.getExternalMediaDetails(
          item.externalId,
          mediaType.toLowerCase(),
        );
        setTitle(details.title || item.title || "");
        setCreator(details.creator || item.creator || "");
        setCoverUrl(details.coverUrl || item.coverUrl || "");
        setTotalUnits(details.totalUnits ?? item.totalUnits ?? "");
        setDescription(details.description || item.description || "");
      } else {
        setTitle(item.title || "");
        setCreator(item.creator || "");
        setCoverUrl(item.coverUrl || "");
        setTotalUnits(item.totalUnits ?? "");
        setDescription(item.description || "");
      }
      setActiveTab("manual");
    } catch {
      setTitle(item.title || "");
      setCreator(item.creator || "");
      setCoverUrl(item.coverUrl || "");
      setTotalUnits(item.totalUnits ?? "");
      setDescription(item.description || "");
      setActiveTab("manual");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await mediaService.addMediaItem(groupId, {
        type: mediaType,
        title: title.trim(),
        creator: creator.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        totalUnits: totalUnits === "" ? undefined : Number(totalUnits),
        description: description.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-media", groupId] });

      onClose();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error || "Failed to add media item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUnitsLabel = (type: MediaType) => {
    switch (type) {
      case "BOOK":
        return "Total Pages";
      case "MOVIE":
        return "Runtime (minutes)";
      case "SHOW":
        return "Total Episodes";
      case "GAME":
        return "Hours / Units";
    }
  };

  const getCreatorLabel = (type: MediaType) => {
    switch (type) {
      case "BOOK":
        return "Author";
      case "MOVIE":
        return "Director";
      case "SHOW":
        return "Creator / Network";
      case "GAME":
        return "Developer / Studio";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Media to Club"
      subtitle="Search OpenLibrary, TMDB, or RAWG — or enter details manually"
      maxWidthClass="max-w-2xl"
      icon={<Plus className="w-4 h-4 text-indigo-400" />}
    >
      {/* Media Type Selector */}
      <div className="px-5 py-3 bg-[#09090B] border-b border-zinc-800/80 flex gap-1.5">
        {(
          [
            { type: "BOOK", label: "Book", icon: BookOpen },
            { type: "MOVIE", label: "Movie", icon: Film },
            { type: "SHOW", label: "Show", icon: Tv },
            { type: "GAME", label: "Game", icon: Gamepad2 },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = mediaType === t.type;
          return (
            <button
              key={t.type}
              type="button"
              onClick={() => {
                setMediaType(t.type);
                setSearchResults([]);
                setSearchError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                active
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-zinc-800/80 px-5 pt-2.5 gap-5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`pb-2.5 font-medium transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "search"
              ? "border-indigo-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Online</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`pb-2.5 font-medium transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "manual"
              ? "border-indigo-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span>Review & Manual Entry</span>
          {title && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>
      </div>

      <div className="p-5">
        {activeTab === "search" ? (
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  placeholder={`Search ${mediaType.toLowerCase()}s by title...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </button>
            </form>

            {searchError && (
              <div className="p-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                {searchError}
              </div>
            )}

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {searchResults.map((result, idx) => (
                <div
                  key={result.externalId || idx}
                  onClick={() => handleSelectResult(result)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#09090B] border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80 cursor-pointer transition group"
                >
                  {result.coverUrl ? (
                    <img
                      src={result.coverUrl}
                      alt={result.title || "Cover"}
                      className="w-10 h-14 object-cover rounded bg-zinc-900 border border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-600">
                      <Film className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-100 truncate">
                      {result.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {result.creator || "Unknown creator"}
                    </p>
                    {result.totalUnits && (
                      <p className="text-[11px] text-zinc-500 font-mono tabular-nums mt-0.5">
                        {result.totalUnits} {getUnitsLabel(mediaType).toLowerCase()}
                      </p>
                    )}
                  </div>

                  <span className="px-2.5 py-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-md group-hover:bg-indigo-500 group-hover:text-white transition">
                    Select
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                {submitError}
              </div>
            )}

            <div className="flex gap-4">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Preview"
                  className="w-20 h-28 object-cover rounded-lg border border-zinc-800 bg-[#09090B] shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-20 h-28 rounded-lg border border-dashed border-zinc-800 bg-[#09090B] flex flex-col items-center justify-center text-zinc-600 text-[11px] shrink-0 p-2 text-center">
                  <Film className="w-5 h-5 mb-1 text-zinc-600" />
                  No cover
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dune"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      {getCreatorLabel(mediaType)}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Frank Herbert"
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      {getUnitsLabel(mediaType)}
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 412"
                      value={totalUnits}
                      onChange={(e) =>
                        setTotalUnits(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Synopsis (optional)
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="Brief synopsis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
              >
                Back to Search
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Add to Club
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AddMediaModal;
