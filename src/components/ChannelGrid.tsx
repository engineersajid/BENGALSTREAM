import { useState, useMemo, useEffect } from "react";
import { 
  Search, Heart, Play, RefreshCw, Radio, Layers, EyeOff,
  ChevronDown, ArrowUpRight, HelpCircle
} from "lucide-react";
import { Channel } from "../types";
import { getCountryFlag } from "../data/staticChannels";

interface ChannelGridProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isLoading: boolean;
  onResetToStatic: () => void;
}

export default function ChannelGrid({
  channels,
  selectedChannel,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  isLoading,
  onResetToStatic
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
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "sports":
        return "bg-red-650/15 text-red-500 border-red-500/30";
      case "movies":
      case "cinema":
        return "bg-amber-500/10 text-amber-400 border-amber-500/15";
      case "music":
        return "bg-purple-500/10 text-purple-400 border-purple-500/15";
      case "entertainment":
        return "bg-red-600/10 text-red-400 border-red-500/20";
      default:
        return "bg-white/5 text-slate-400 border-white/5";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Dynamic Search & Grid Toolbelt */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0f0f0f] p-4 rounded-xl border border-white/5">
        
        {/* Real-time Search Box */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search channels by name, category, or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] text-[#f1f1f1] placeholder-slate-500 text-xs sm:text-sm px-10 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-505 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Channels counter and static recovery button */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            Found: <strong className="text-white font-bold">{filteredChannels.length}</strong> broadcasts
          </span>
          {channels.length > 50 && (
            <button 
              onClick={onResetToStatic}
              className="p-2 bg-[#121212] hover:bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Reset feed to local fast list"
            >
              <RefreshCw className="h-3 w-3" /> <span className="hidden md:inline">Reset Feed</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Grid Viewport */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f0f0f] border border-white/5 rounded-2xl gap-4">
          <div className="relative flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <Radio className="absolute text-red-500 h-5 w-5 animate-pulse" />
          </div>
          <p className="text-sm font-medium font-display text-slate-300">Synchronizing Live M3U Stream Registry...</p>
        </div>
      ) : visibleChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0f0f0f] border border-white/5 rounded-2xl">
          <div className="bg-[#121212] p-4 rounded-full mb-4">
            <EyeOff className="h-8 w-8 text-slate-650" />
          </div>
          <h4 className="text-base font-bold text-slate-300 font-display mb-1">No Broadcasts Match This Search</h4>
          <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
            The filter or query returned an empty stream list. Try altering your keywords or swapping countries in the left panel.
          </p>
          <button 
            onClick={() => { setSearchQuery(""); onResetToStatic(); }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-lg active:scale-95 cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {visibleChannels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              const isFav = favorites.includes(channel.id);
              
              return (
                <div
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  className={`group relative rounded-xl bg-[#0f0f0f]/90 border transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden transform hover:-translate-y-1 ${
                    isSelected
                      ? "ring-2 ring-red-650 border-transparent shadow-[0_10px_20px_rgba(220,38,38,0.25)]"
                      : "border-white/5 hover:border-white/10 hover:bg-[#121212] hover:shadow-xl shadow-black/40"
                  }`}
                >
                  
                  {/* Card Image Platform */}
                  <div className="relative aspect-video w-full bg-[#080808] flex items-center justify-center overflow-hidden p-4 group-hover:bg-[#121212] transition-colors">
                    
                    {/* Live indicator tag */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-[#080808]/90 backdrop-blur-sm pl-1.5 pr-2 py-0.5 rounded-full border border-white/5 text-[9px] font-bold text-red-500 leading-none">
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
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-[#080808]/90 backdrop-blur-sm border border-white/5 text-rose-500/80 hover:text-rose-500 active:scale-90 transition-all cursor-pointer"
                      title={isFav ? "Remove bookmarks" : "Save to bookmarks"}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-red-600 text-red-650" : "text-slate-400"}`} />
                    </button>

                    {/* Logo Image */}
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`;
                      }}
                      className="max-h-14 max-w-[80%] object-contain select-none transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Hover Card Glow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg scale-90 group-hover:scale-100 transition-all transform duration-300">
                        <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                  </div>

                  {/* Card Description / Info Deck */}
                  <div className="p-3 sm:p-4 flex flex-col gap-2 flex-grow justify-between">
                    
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-display line-clamp-1 group-hover:text-red-550 transition-colors">
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
                      <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider ${getCategoryColor(channel.category)}`}>
                        {channel.category}
                      </span>

                      {/* Country code and dynamic flag indicator */}
                      <span className="flex items-center gap-1 font-mono text-slate-400 filter grayscale group-hover:grayscale-0 transition-all" title={channel.countryName || channel.country}>
                        <span className="text-base select-none">{getCountryFlag(channel.country)}</span>
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

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-[#121212] hover:bg-white/5 hover:text-white border border-white/5 rounded-xl text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-black/20 cursor-pointer"
              >
                <ChevronDown className="h-4 w-4 text-red-500 animate-pulse" /> Load More Live Channels ({filteredChannels.length - visibleCount} remaining)
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
