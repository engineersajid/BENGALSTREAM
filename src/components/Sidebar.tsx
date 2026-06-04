import { useState } from "react";
import { 
  Tv, Heart, Flame, Globe2, Compass, Check, Search, ShieldCheck, 
  ChevronRight, RefreshCw, Layers
} from "lucide-react";
import { Country, Category } from "../types";
import { POPULAR_CATEGORIES, CHOSEN_COUNTRIES } from "../data/staticChannels";

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  selectedCountry: string;
  onSelectCountry: (code: string) => void;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: (show: boolean) => void;
  activeLoadingCountry: string | null;
}

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
  selectedCountry,
  onSelectCountry,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  activeLoadingCountry
}: SidebarProps) {
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = CHOSEN_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-72 bg-[#0f0f0f] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col h-full overflow-y-auto custom-scrollbar">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Tv className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1">
              BENGAL <span className="text-red-500">STREAM</span>
            </span>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold">GLOBAL LIVE TV</p>
          </div>
        </div>
        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span> Ultra Fast
        </span>
      </div>

      <div className="p-4 flex flex-col gap-6 flex-grow">

        {/* HIGH PRIORITY QUICK ACCESS TAB - BANGLADESH STREAM ACCELERATOR */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold text-slate-500 tracking-wider font-mono uppercase flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-red-500 animate-pulse" /> Bengali Hub
            </span>
          </div>
          <button
            onClick={() => {
              onToggleFavoritesOnly(false);
              onSelectCountry("bd");
              onSelectCategory("all");
            }}
            className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all active:scale-95 cursor-pointer ${
              selectedCountry === "bd" && !showFavoritesOnly
                ? "bg-gradient-to-r from-red-950/20 via-[#161616] to-[#0c0c0c] border-red-500/35 shadow-md shadow-red-950/10 text-white"
                : "bg-white/5 border-white/5 hover:border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="Bangladesh flag">🇧🇩</span>
              <div>
                <p className="text-xs font-bold font-display">Bangladesh Channels</p>
                <p className="text-[10px] text-red-400/85 font-mono font-medium mt-0.5">High Speed Live Feeds</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${
              selectedCountry === "bd" ? "translate-x-1 text-red-400" : "text-slate-500"
            }`} />
          </button>
        </div>

        {/* FAVORITES VIEW TOGGLE */}
        <div>
          <button
            onClick={() => onToggleFavoritesOnly(!showFavoritesOnly)}
            className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all active:scale-95 cursor-pointer ${
              showFavoritesOnly
                ? "bg-red-950/20 border-red-500/30 text-red-200"
                : "bg-white/5 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-red-500" : ""}`} />
              </span>
              <div>
                <p className="text-xs font-bold font-display">My Bookmarks</p>
                <p className="text-[10px] text-slate-500 font-mono">{favoritesCount} Saved Channels</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              showFavoritesOnly ? "bg-red-600 text-white" : "bg-[#222] text-slate-400"
            }`}>
              {favoritesCount}
            </span>
          </button>
        </div>

        {/* CHANNELS BY CATEGORY LIST */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wider font-mono uppercase flex items-center gap-1.5 px-1.5 mb-1">
            <Layers className="h-3 w-3 text-slate-400" /> Categories
          </span>
          <div className="space-y-1">
            {POPULAR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id && !showFavoritesOnly;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onToggleFavoritesOnly(false);
                    onSelectCategory(cat.id);
                  }}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium font-display flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white/10 text-white border-l-2 border-red-600 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base select-none" role="img">{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-red-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* CHANNELS BY COUNTRY LIST */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between px-1.5 mb-2">
            <span className="text-[10px] font-extrabold text-slate-500 tracking-wider font-mono uppercase flex items-center gap-1.5">
              <Globe2 className="h-3 w-3 text-slate-400" /> Global Countries
            </span>
          </div>

          {/* Mini Country Search inside Sidebar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search Countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="w-full bg-[#161616] text-[#f1f1f1] placeholder-slate-500 text-xs px-8 py-2 rounded-lg border border-white/5 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          {/* Interactive flag tiles */}
          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {filteredCountries.map((country) => {
              const isSelected = selectedCountry === country.code && !showFavoritesOnly;
              const isLoading = activeLoadingCountry === country.code;
              return (
                <button
                  key={country.code}
                  onClick={() => {
                    onToggleFavoritesOnly(false);
                    onSelectCountry(country.code);
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col gap-1 transition-all active:scale-95 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-[#181818] border-red-500/45 text-white"
                      : "bg-[#121212] border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl" role="img" aria-label={country.name}>
                      {country.flag}
                    </span>
                    {isLoading && (
                      <RefreshCw className="h-3 w-3 text-red-500 animate-spin" />
                    )}
                    {isSelected && !isLoading && (
                      <Check className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold font-display truncate">
                    {country.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current server status box inline with Design HTML */}
        <div className="mt-8 pt-4 border-t border-white/5">
          <div className="bg-gradient-to-br from-red-600/10 to-transparent border border-red-600/20 rounded-xl p-4">
            <p className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider font-mono">Current Server Load</p>
            <p className="text-base font-extrabold font-display text-white">4,281 Live Channels</p>
            <p className="text-[9px] text-red-500 font-mono font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span> All Servers Online
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}
