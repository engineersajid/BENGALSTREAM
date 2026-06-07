import { useState, useMemo, useEffect } from "react";
import { 
  Search, Heart, Play, RefreshCw, Radio, Layers, EyeOff,
  ChevronDown, ArrowUpRight, HelpCircle, Grid, List, Sliders
} from "lucide-react";
import { Channel } from "../types";
import { getCountryFlag } from "../data/staticChannels";

interface ChannelGridProps {
  theme: any;
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isLoading: boolean;
  onResetToStatic: () => void;
  onOpenEditor: () => void;
}

export default function ChannelGrid({
  theme,
  channels,
  selectedChannel,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  isLoading,
  onResetToStatic,
  onOpenEditor
}: ChannelGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);

  // Reset page pagination length whenever the channel source shifts
  useEffect(() => {
    setVisibleCount(24);
  }, [channels, searchQuery]);

  // Handle case-insensitive real-time filtering
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const query = searchQuery.toLowerCase().trim();
    return channels.filter(channel => 
      channel.name.toLowerCase().includes(query) ||
      channel.id.toLowerCase().includes(query) ||
      (channel.category && channel.category.toLowerCase().includes(query)) ||
      (channel.language && channel.language.toLowerCase().includes(query))
    );
  }, [channels, searchQuery]);

  // Slice channels list to secure DOM performance
  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  const hasMore = filteredChannels.length > visibleCount;

  const loadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  // Helper to color category tags
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "news":
        return "bg-red-500/10 text-red-450 border-red-500/20";
      case "sports":
        return "bg-green-550/10 text-green-400 border-green-500/20";
      case "movies":
      case "cinema":
        return "bg-amber-500/10 text-amber-400 border-amber-500/15";
      case "music":
        return "bg-purple-500/10 text-purple-400 border-purple-500/15";
      case "entertainment":
        return "bg-blue-600/10 text-blue-400 border-blue-500/20";
      case "cartoons":
        return "bg-rose-500/10 text-rose-455 border-rose-500/15";
      case "drama":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/15";
      default:
        return "bg-white/5 text-slate-400 border-white/5";
    }
  };

  // View mode state (persisted in localStorage)
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    try {
      const saved = localStorage.getItem("bengalstream_view_mode");
      return (saved === "grid" || saved === "list") ? saved : "grid";
    } catch (e) {
      return "grid";
    }
  });

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem("bengalstream_view_mode", mode);
    } catch (e) {}
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Dynamic Search & Grid Toolbelt */}
      <div className={`flex flex-col md:flex-row gap-4 items-center justify-between ${theme.bgCard} p-4 rounded-xl border ${theme.borderClass}`}>
        
        {/* Real-time Search Box */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${theme.id === "bengal-light" ? "bg-slate-100 text-slate-800 placeholder-slate-400 border-slate-200" : "bg-[#121212]/35 text-[#f1f1f1] placeholder-slate-500 border-white/5"} text-xs sm:text-sm px-10 py-2.5 rounded-xl border focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-sans`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* View togglers and sync status */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3.5 w-full md:w-auto shrink-0 select-none">
          {/* TWO BETTER VIEW EXPERIENCE TOGGLE SWITCH */}
          <div className={`flex items-center ${theme.id === "bengal-light" ? "bg-slate-100 border-slate-200" : "bg-[#090909]/95 border-white/5"} p-1 border rounded-xl gap-1 shrink-0`}>
            <button
              onClick={() => toggleViewMode("grid")}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid"
                  ? `${theme.accentBg} text-white font-bold shadow-md`
                  : `${theme.id === "bengal-light" ? "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50" : "text-slate-400 hover:text-white hover:bg-white/5"}`
              }`}
              title="Visual Grid Cards"
            >
              <Grid className="h-4 w-4" />
              <span className="text-[11px] font-mono tracking-wider font-bold uppercase pl-0.5 pr-1 hidden sm:inline">Grid View</span>
            </button>
            <button
              onClick={() => toggleViewMode("list")}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "list"
                  ? `${theme.accentBg} text-white font-bold shadow-md`
                  : `${theme.id === "bengal-light" ? "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50" : "text-slate-400 hover:text-white hover:bg-white/5"}`
              }`}
              title="Compact Feed List"
            >
              <List className="h-4 w-4" />
              <span className="text-[11px] font-mono tracking-wider font-bold uppercase pl-0.5 pr-1 hidden sm:inline">Compact List</span>
            </button>
          </div>

          {/* DYNAMIC CHANNEL EDITOR ACCESS POINT */}
          <button
            onClick={onOpenEditor}
            className={`p-2 ${theme.id === "bengal-light" ? "bg-white border-slate-250 text-slate-700 hover:bg-slate-100" : "bg-[#0c0c0c]/98 border-white/5 hover:border-white/15 text-slate-300 hover:text-white"} rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-bold shadow-sm shrink-0`}
            title="Manage & Edit Custom Streams"
          >
            <Sliders className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider uppercase pl-0.5 pr-1">Channel Editor</span>
          </button>

          <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 font-medium">
            {isLoading && (
              <span className={`text-[10px] ${theme.accentText} bg-white/5 font-mono animate-pulse flex items-center gap-1.5 px-2 py-1 rounded border ${theme.borderClass}`}>
                <RefreshCw className="h-3 w-3 animate-spin" /> APIs Synced
              </span>
            )}
            <span>Found: <strong className={`${theme.id === "bengal-light" ? "text-slate-900" : "text-white"} font-extrabold`}>{filteredChannels.length}</strong></span>
          </div>

          {channels.length > 30 && (
            <button 
              onClick={onResetToStatic}
              className="p-2 bg-[#121212] hover:bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Reset feed to local fast list"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" /> <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Grid Viewport */}
      {isLoading && channels.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 ${theme.bgCard} border ${theme.borderClass} rounded-2xl gap-4`}>
          <div className="relative flex justify-center items-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme.accentText}`}></div>
            <Radio className={`absolute ${theme.accentText} h-5 w-5 animate-pulse`} />
          </div>
          <p className="text-sm font-medium font-display text-slate-350">Synchronizing Live M3U Stream Registry...</p>
        </div>
      ) : visibleChannels.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 text-center ${theme.bgCard} border ${theme.borderClass} rounded-2xl`}>
          <div className="bg-black/30 p-4 rounded-full mb-4 border border-white/5">
            <EyeOff className="h-8 w-8 text-slate-500" />
          </div>
          <h4 className="text-base font-bold text-slate-300 font-display mb-1">No Broadcasts Match This Search</h4>
          <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
            The filter or query returned an empty stream list. Try altering your keywords or swapping countries in the left panel.
          </p>
          <button 
            onClick={() => { setSearchQuery(""); onResetToStatic(); }}
            className={`px-4 py-2 ${theme.accentBg} ${theme.accentHover} text-white text-xs font-semibold rounded-lg shadow-lg active:scale-95 cursor-pointer`}
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {viewMode === "grid" ? (
            /* EXPERIENCE ONE: VISUAL CARDS GRID */
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {visibleChannels.map((channel) => {
                const isSelected = selectedChannel?.id === channel.id;
                const isFav = favorites.includes(channel.id);
                
                return (
                  <div
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    className={`group relative rounded-xl ${theme.bgCard} border transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden transform hover:-translate-y-1 ${
                      isSelected
                        ? `ring-2 ${theme.accentRing} border-transparent shadow-[0_10px_20px_rgba(239,68,68,0.2)]`
                        : `${theme.borderClass} ${theme.id === "bengal-light" ? "hover:border-slate-350 hover:bg-slate-100/60" : "hover:border-white/10 hover:bg-black/10"} hover:shadow-xl`
                    }`}
                  >
                    
                    {/* Card Image Platform */}
                    <div className="relative aspect-video w-full bg-[#030303]/90 flex items-center justify-center overflow-hidden p-3 group-hover:bg-[#101010]/30 transition-colors">
                      
                      {/* Live indicator tag */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#080808]/90 backdrop-blur-sm pl-1.5 pr-2 py-0.5 rounded-full border border-white/5 text-[9px] font-bold text-red-500 leading-none">
                        <span className="h-1 w-1 rounded-full bg-red-500 animate-ping"></span>
                        <span className="h-1 w-1 rounded-full bg-red-500 absolute"></span>
                        <span className="text-red-500 uppercase tracking-widest font-black pl-2">LIVE</span>
                      </div>

                      {/* Bookmark Heart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-[#080808]/90 backdrop-blur-sm border border-white/5 text-rose-550/80 hover:text-rose-550 active:scale-90 transition-all cursor-pointer"
                        title={isFav ? "Remove bookmarks" : "Save to bookmarks"}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                      </button>

                      {/* Unified Squircle Logo Frame (Channel Fab Icon) */}
                      <div className="w-16 h-16 rounded-xl bg-[#090909]/95 border border-white/10 p-1.5 flex items-center justify-center relative shadow-inner overflow-hidden select-none group-hover:border-red-550/30 transition-colors">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`;
                          }}
                          className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Hover Card Glow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className={`h-10 w-10 ${theme.accentBg} rounded-full flex items-center justify-center text-white shadow-lg scale-90 group-hover:scale-100 transition-all transform duration-300`}>
                          <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                        </div>
                      </div>

                    </div>

                    {/* Card Description / Info Deck */}
                    <div className="p-3 sm:p-4 flex flex-col gap-2 flex-grow justify-between">
                      
                      <div>
                        <h3 className={`text-xs sm:text-sm font-bold ${theme.id === "bengal-light" ? "text-slate-800" : "text-slate-100"} font-display line-clamp-1 group-hover:text-red-550 transition-colors`}>
                          {channel.name}
                        </h3>
                        {channel.language && (
                          <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mt-0.5">
                            Feed: {channel.language}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1 border-t border-white/5 pt-2 text-[10px]">
                        
                        {/* Category Tag */}
                        <span className={`px-2 py-0.5 rounded border text-[8px] uppercase font-mono font-bold tracking-wider ${getCategoryColor(channel.category)}`}>
                          {channel.category}
                        </span>

                        {/* Country code and dynamic flag indicator */}
                        <span className="flex items-center gap-1 font-mono text-slate-400 filter grayscale group-hover:grayscale-0 transition-all" title={channel.countryName || channel.country}>
                          <span className="text-sm select-none">{getCountryFlag(channel.country)}</span>
                          <span className="uppercase text-[9px] font-bold font-mono text-slate-500 group-hover:text-slate-300">
                            {channel.country}
                          </span>
                        </span>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* EXPERIENCE TWO: COMPACT LIST TIMELINE FEED */
            <div className="flex flex-col gap-2.5">
              {visibleChannels.map((channel) => {
                const isSelected = selectedChannel?.id === channel.id;
                const isFav = favorites.includes(channel.id);
                
                return (
                  <div
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    className={`group relative rounded-xl ${theme.bgCard} border transition-all duration-200 flex items-center justify-between p-3 cursor-pointer ${
                      isSelected
                        ? `ring-1 ${theme.accentRing} border-transparent ${theme.id === "bengal-light" ? "bg-slate-100" : "bg-[#111111]"} shadow-[0_4px_12px_rgba(239,68,68,0.15)]`
                        : `${theme.borderClass} ${theme.id === "bengal-light" ? "hover:border-slate-300 hover:bg-slate-100/65" : "hover:border-white/10 hover:bg-black/15"} shadow-sm`
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="w-11 h-11 rounded-lg bg-black/60 border border-white/5 p-1 flex items-center justify-center shrink-0 relative overflow-hidden">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`;
                          }}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-all duration-300"
                        />
                      </div>

                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-xs sm:text-sm font-bold ${theme.id === "bengal-light" ? "text-slate-800" : "text-slate-100"} font-display truncate group-hover:text-red-500 transition-colors`}>
                            {channel.name}
                          </h3>
                          <span className={`h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 ${isSelected ? "animate-pulse" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}></span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded border text-[8px] uppercase font-mono font-bold tracking-wider ${getCategoryColor(channel.category)}`}>
                            {channel.category}
                          </span>
                          {channel.language && (
                            <span className="text-[9px] text-slate-500 font-semibold font-mono truncate hidden sm:inline">
                              Feed: {channel.language}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <span className="flex items-center gap-1 font-mono text-slate-400" title={channel.countryName || channel.country}>
                        <span className="text-sm select-none">{getCountryFlag(channel.country)}</span>
                        <span className="uppercase text-[9px] font-bold font-mono text-slate-500 group-hover:text-slate-300 hidden sm:inline">
                          {channel.country}
                        </span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#0c0c0c]/90 hover:bg-black border border-white/5 text-rose-500 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
                        title={isFav ? "Remove bookmark" : "Bookmark Channel"}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                      </button>

                      <div className={`p-1.5 rounded-full ${isSelected ? theme.accentBg : "bg-white/5 group-hover:bg-red-600/10 text-slate-300"} transition-all group-hover:scale-105 shadow-sm hidden sm:flex`}>
                        <Play className={`h-3 w-3 font-semibold ${isSelected ? "fill-white text-white" : "group-hover:text-red-500 group-hover:fill-red-500/10 text-slate-400"} ml-[0.5px]`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-[#111111] hover:bg-white/5 hover:text-white border border-white/5 rounded-xl text-slate-350 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-black/20 cursor-pointer"
              >
                <ChevronDown className={`h-4 w-4 ${theme.accentText} animate-pulse`} /> Load More Live Channels ({filteredChannels.length - visibleCount} remaining)
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
