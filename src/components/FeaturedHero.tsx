import { Play, Flame, Heart, Compass, AlertCircle, Info, Radio, Star } from "lucide-react";
import { Channel } from "../types";

interface FeaturedHeroProps {
  channel: Channel | null;
  onPlayChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  featuredList: Channel[];
}

export default function FeaturedHero({
  channel,
  onPlayChannel,
  favorites,
  onToggleFavorite,
  featuredList
}: FeaturedHeroProps) {
  const isFav = channel ? favorites.includes(channel.id) : false;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#0f0f0f] border border-white/5 shadow-2xl">
      
      {/* Background Ambience & Grid Gradient */}
      <div className="absolute inset-0 z-0 bg-radial-gradient from-red-950/15 via-[#0c0c0c] to-[#080808] opacity-90"></div>
      
      {/* Animated absolute decor */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-red-650/5 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-red-800/5 blur-3xl animate-pulse"></div>

      {channel ? (
        /* CURRENT BROADCAST DETAILS HERO */
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            
            {/* Pulsing featured avatar logo */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-red-650 to-red-800 rounded-2xl blur opacity-30 mt-0.5 animate-pulse"></div>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#080808] border border-white/5 p-3 shadow-2xl flex items-center justify-center">
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`; }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1.5 right-1.5 bg-red-600 text-[10px] text-white font-black px-2 py-0.5 rounded-sm border border-red-500 font-display flex items-center gap-1 shadow-md shadow-red-600/50">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span> 1080P
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="bg-red-600/10 text-red-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest font-mono">
                  Currently Airing
                </span>
                <span className="bg-white/5 text-white border border-white/10 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
                  Free Access
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
                {channel.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed font-sans">
                Stream this channel live now. Operating over public IPTV node {channel.id}. 
                {channel.language && ` Optimized audio and video track tailored for ${channel.language} receivers.`}
              </p>
              
              <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start mt-4 text-xs font-sans">
                <span className="bg-[#121212] text-slate-300 px-3 py-1.5 rounded-lg border border-white/5">
                  Category: <strong className="text-red-500 capitalize">{channel.category}</strong>
                </span>
                <span className="bg-[#121212] text-slate-300 px-3 py-1.5 rounded-lg border border-white/5">
                  Country: <strong className="text-white uppercase">{channel.country}</strong>
                </span>
                {channel.language && (
                  <span className="bg-[#121212] text-slate-300 px-3 py-1.5 rounded-lg border border-white/5">
                    Language: <strong className="text-red-400">{channel.language}</strong>
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
                  ? "bg-red-950/20 border-red-500/30 text-red-300 hover:bg-red-950/40"
                  : "bg-[#121212] hover:border-white/10 border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} /> {isFav ? "Favorited" : "Save Channel"}
            </button>
            <button
              onClick={() => onPlayChannel(channel)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold font-display text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/10 transition-all cursor-pointer active:scale-95"
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
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight leading-none mb-3">
              Unlimited Live TV <br className="hidden sm:inline" />
              Streaming in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">High Speed</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-450 leading-relaxed mb-6 font-sans">
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
                    className="px-3 py-1.5 bg-[#121212] hover:bg-white/5 hover:text-red-400 text-slate-300 text-xs font-semibold rounded-lg border border-white/5 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="text-sm select-none">🇧🇩</span> {f.name} <Play className="h-2.5 w-2.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid Promo on Right */}
          <div className="w-full lg:max-w-md grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
              <span className="text-2xl">🇧🇩</span>
              <p className="text-lg font-bold font-display text-white mt-2">Bangladesh</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">High Speed Bengali Feeds</p>
            </div>
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
              <span className="text-2xl">⚡</span>
              <p className="text-lg font-bold font-display text-white mt-2">0ms Delay</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Native Browser Decode</p>
            </div>
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
              <span className="text-2xl font-bold text-red-500">IPTV</span>
              <p className="text-lg font-bold font-display text-white mt-1">Global APIs</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Dynamic GitHub syncing</p>
            </div>
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
              <span className="text-2xl animate-pulse">📡</span>
              <p className="text-lg font-bold font-display text-white mt-2">Stable Player</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Integrated Hls.js fallback</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
