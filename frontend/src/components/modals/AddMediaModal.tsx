import React, { useState } from "react";
import {
  X,
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExternalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [totalUnits, setTotalUnits] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

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
        setSearchError("No results found. Try another search term or add manually.");
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
      // Fetch full details if item has externalId
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
      // Fallback to basic search result
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
        return "Hours / Completion Units";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
              <Plus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Media to Group</h2>
              <p className="text-xs text-slate-400">Search online to auto-fill or enter manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Type Tabs */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex gap-2">
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
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Tabs: Search vs Manual */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 pt-3 gap-6 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`pb-3 font-medium transition flex items-center gap-2 border-b-2 ${
              activeTab === "search"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Online (OpenLibrary / TMDB / RAWG)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`pb-3 font-medium transition flex items-center gap-2 border-b-2 ${
              activeTab === "manual"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Review & Customize</span>
            {title && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === "search" ? (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={`Search ${mediaType.toLowerCase()}s by title or creator...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-2 disabled:opacity-50 transition"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </button>
              </form>

              {searchError && (
                <div className="p-3 text-sm text-amber-300 bg-amber-950/30 border border-amber-800/50 rounded-xl">
                  {searchError}
                </div>
              )}

              {/* Search Results */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {searchResults.map((result, idx) => (
                  <div
                    key={result.externalId || idx}
                    onClick={() => handleSelectResult(result)}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    {result.coverUrl ? (
                      <img
                        src={result.coverUrl}
                        alt={result.title || "Cover"}
                        className="w-12 h-16 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                        <Film className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition">
                        {result.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {result.creator || "Unknown creator"}
                      </p>
                      {result.totalUnits && (
                        <p className="text-xs text-slate-500 mt-1">
                          {result.totalUnits} {getUnitsLabel(mediaType).toLowerCase()}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Manual / Review Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 text-sm text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
                  {submitError}
                </div>
              )}

              <div className="flex gap-4">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Preview"
                    className="w-24 h-32 object-cover rounded-xl border border-slate-800 bg-slate-950 shrink-0 shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-24 h-32 rounded-xl border border-dashed border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-600 text-xs shrink-0 p-2 text-center">
                    <Film className="w-6 h-6 mb-1 text-slate-600" />
                    No cover preview
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dune"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {getCreatorLabel(mediaType)}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Frank Herbert"
                        value={creator}
                        onChange={(e) => setCreator(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
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
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description / Synopsis (optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="Brief synopsis or why you want the club to experience this..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("search")}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Back to Search
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Add to Group
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMediaModal;
