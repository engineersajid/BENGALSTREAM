import { Play, Flame, Heart, Compass, AlertCircle, Info, Radio, Star } from "lucide-react";
import { Channel } from "../types";

interface FeaturedHeroProps {
  theme: any;
  channel: Channel | null;
  onPlayChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  featuredList: Channel[];
}

export default function FeaturedHero({
  theme,
  channel,
  onPlayChannel,
  favorites,
  onToggleFavorite,
  featuredList
}: FeaturedHeroProps) {
  const isFav = channel ? favorites.includes(channel.id) : false;

  return (
    <div className={`relative rounded-2xl overflow-hidden ${theme.bgCard} border ${theme.borderClass} shadow-2xl`}>
      
      {/* Background Ambience & Grid Gradient */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-br ${theme.gradientFrom} to-transparent opacity-50`}></div>
      
      {/* Animated absolute decor */}
      <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full ${theme.accentLightBg} blur-3xl opacity-20 animate-pulse`}></div>
      <div className={`absolute -bottom-24 -right-24 h-96 w-96 rounded-full ${theme.accentLightBg} blur-3xl opacity-20 animate-pulse`}></div>

      {channel ? (
        /* CURRENT BROADCAST DETAILS HERO */
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            
            {/* Pulsing featured avatar logo */}
            <div className="relative group shrink-0">
              <div className={`absolute -inset-1.5 bg-gradient-to-tr ${theme.accentBg === "bg-[#111]" ? "from-slate-650" : theme.accentBg} rounded-2xl blur opacity-30 mt-0.5 animate-pulse`}></div>
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl ${theme.id === "bengal-light" ? "bg-slate-50 border-slate-200" : "bg-[#080808] border-white/5"} border p-3 shadow-2xl flex items-center justify-center`}>
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`; }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className={`absolute -bottom-1.5 right-1.5 ${theme.accentBg} text-[10px] text-white font-black px-2 py-0.5 rounded-sm border ${theme.accentBorder} font-display flex items-center gap-1 shadow-md`}>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span> 1080P
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className={`${theme.accentLightBg} ${theme.accentText} text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${theme.accentBorder} uppercase tracking-widest font-mono`}>
                  Currently Airing
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono border ${theme.id === "bengal-light" ? "bg-slate-100 text-slate-800 border-slate-255" : "bg-white/5 text-white border-white/10"}`}>
                  Free Access
                </span>
              </div>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold ${theme.id === "bengal-light" ? "text-slate-900" : "text-white"} font-display tracking-tight leading-tight`}>
                {channel.name}
              </h1>
              <p className={`text-sm ${theme.id === "bengal-light" ? "text-slate-600" : "text-slate-405"} mt-2 max-w-xl leading-relaxed font-sans`}>
                Stream this channel live now. Operating over public IPTV node {channel.id}. 
                {channel.language && ` Optimized audio and video track tailored for ${channel.language} receivers.`}
              </p>
              
              <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start mt-4 text-xs font-sans">
                <span className={`${theme.id === "bengal-light" ? "bg-slate-100/60 text-slate-700 border-slate-200" : "bg-black/30 text-slate-300 border-white/5"} border px-3 py-1.5 rounded-lg`}>
                  Category: <strong className={`${theme.accentText} capitalize`}>{channel.category}</strong>
                </span>
                <span className={`${theme.id === "bengal-light" ? "bg-slate-100/60 text-slate-700 border-slate-200" : "bg-black/30 text-slate-300 border-white/5"} border px-3 py-1.5 rounded-lg`}>
                  Country: <strong className={`${theme.id === "bengal-light" ? "text-slate-800" : "text-white"} uppercase`}>{channel.country}</strong>
                </span>
                {channel.language && (
                  <span className={`${theme.id === "bengal-light" ? "bg-slate-100/60 text-slate-700 border-slate-200" : "bg-black/30 text-slate-300 border-white/5"} border px-3 py-1.5 rounded-lg`}>
                    Language: <strong className={`${theme.id === "bengal-light" ? "text-slate-800" : "text-white"} opacity-85`}>{channel.language}</strong>
                  </span>
                )}
              </div>
            </div>

          </div>

          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => onToggleFavorite(channel.id)}
              className={`px-5 py-3 rounded-xl font-bold font-display text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                isFav 
                  ? `${theme.accentLightBg} ${theme.accentBorder} ${theme.accentText} hover:bg-black/40`
                  : `${theme.id === "bengal-light" ? "bg-slate-100 hover:bg-slate-200 border-slate-250 hover:border-slate-350 text-slate-700 hover:text-slate-900" : "bg-black/30 hover:border-white/10 border-white/5 text-slate-300 hover:text-white"}`
              }`}
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} /> {isFav ? "Favorited" : "Save Channel"}
            </button>
            <button
              onClick={() => onPlayChannel(channel)}
              className={`px-6 py-3 ${theme.accentBg} ${theme.accentHover} text-white font-bold font-display text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95`}
            >
              <Radio className="h-4 w-4 animate-pulse" /> Re-tune Broadcaster
            </button>
          </div>

        </div>
      ) : (
        /* STANDARD PROMOTIONAL LANDING HERO */
        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-mono">
              <Star className="h-3 w-3 fill-red-500 animate-pulse" /> HIGH FIDELITY STREAM PLATFORM
            </div>
            
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${theme.id === "bengal-light" ? "text-slate-900" : "text-white"} font-display tracking-tight leading-none mb-3`}>
              Unlimited Live TV <br className="hidden sm:inline" />
              Streaming in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">High Speed</span>
            </h1>
            
            <p className={`text-xs sm:text-sm ${theme.id === "bengal-light" ? "text-slate-650" : "text-slate-450"} leading-relaxed mb-6 font-sans`}>
              Access over thousands of public IPTV-org television broadcasts directly on your web browser. Styled with custom diagnostics, live telemetry indicators, automatic reconnection feeds, and dedicated <strong>Bangladesh Live Hubs</strong>.
            </p>

            {/* Quick anchors to popular featured channels */}
            <div className="space-y-2 text-left">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Popular Bengali Stations</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {featuredList.slice(0, 3).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onPlayChannel(f)}
                    className={`px-3 py-1.5 ${theme.id === "bengal-light" ? "bg-slate-50 hover:bg-slate-100 hover:text-red-600 text-slate-700 border-slate-200" : "bg-[#121212] hover:bg-white/5 hover:text-red-400 text-slate-300 border-white/5"} text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer`}
                  >
                    <span className="text-sm select-none">🇧🇩</span> {f.name} <Play className="h-2.5 w-2.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid Promo on Right */}
          <div className="w-full lg:max-w-md grid grid-cols-2 gap-4 shrink-0">
            <div className={`${theme.id === "bengal-light" ? "bg-slate-50 border-slate-205 text-slate-800" : "bg-[#121212] border-white/5"} border p-4 rounded-xl`}>
              <span className="text-2xl">🇧🇩</span>
              <p className={`text-lg font-bold font-display ${theme.id === "bengal-light" ? "text-slate-900" : "text-white"} mt-2`}>Bangladesh</p>
              <p className="text-[10px] text-slate-550 font-mono mt-0.5">High Speed Bengali Feeds</p>
            </div>
            <div className={`${theme.id === "bengal-light" ? "bg-slate-50 border-slate-205 text-slate-800" : "bg-[#121212] border-white/5"} border p-4 rounded-xl`}>
              <span className="text-2xl">⚡</span>
              <p className={`text-lg font-bold font-display ${theme.id === "bengal-light" ? "text-slate-900" : "text-white"} mt-2`}>0ms Delay</p>
              <p className="text-[10px] text-slate-550 font-mono mt-0.5">Native Browser Decode</p>
            </div>
            <div className={`${theme.id === "bengal-light" ? "bg-slate-50 border-slate-205 text-slate-800" : "bg-[#121212] border-white/5"} border p-4 rounded-xl`}>
              <span className="text-2xl font-bold text-red-500">IPTV</span>
              <p className={`text-lg font-bold font-display ${theme.id === "bengal-light" ? "text-slate-900" : "text-white"} mt-1`}>Global APIs</p>
              <p className="text-[10px] text-slate-550 font-mono mt-0.5">Dynamic GitHub syncing</p>
            </div>
            <div className={`${theme.id === "bengal-light" ? "bg-slate-50 border-slate-205 text-slate-800" : "bg-[#121212] border-white/5"} border p-4 rounded-xl`}>
              <span className="text-2xl animate-pulse">📡</span>
              <p className={`text-lg font-bold font-display ${theme.id === "bengal-light" ? "text-slate-900" : "text-white"} mt-2`}>Stable Player</p>
              <p className="text-[10px] text-slate-550 font-mono mt-0.5">Integrated Hls.js fallback</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
