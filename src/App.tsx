import React, { useState, useEffect, useMemo, useRef } from "react";
import { Menu, X, Tv, Heart, Radio, RefreshCw, Sparkles, HelpCircle, AlertCircle, Play, ChevronDown, Facebook, Linkedin, Github, Youtube, GripHorizontal } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChannelGrid from "./components/ChannelGrid";
import VideoPlayer from "./components/VideoPlayer";
import FeaturedHero from "./components/FeaturedHero";
import { parseM3UFromURL } from "./utils/m3uParser";
import { STATIC_CHANNELS } from "./data/staticChannels";
import { Channel } from "./types";

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  bgPage: string;
  bgSidebar: string;
  bgCard: string;
  borderClass: string;
  textPrimary: string;
  textMuted: string;
  accentText: string;
  accentBg: string;
  accentRing: string;
  accentHover: string;
  accentBorder: string;
  accentLightBg: string;
  gradientFrom: string;
}

export const THEMES: Theme[] = [
  {
    id: "bengal-dark",
    name: "Bengal Crimson (Default)",
    emoji: "🔴",
    bgPage: "bg-[#080808]",
    bgSidebar: "bg-[#0d0d0d]",
    bgCard: "bg-[#0f0f0f]",
    borderClass: "border-white/5",
    textPrimary: "text-slate-100",
    textMuted: "text-slate-500",
    accentText: "text-red-500",
    accentBg: "bg-red-650",
    accentRing: "ring-red-650",
    accentHover: "hover:bg-red-750",
    accentBorder: "border-red-500/15",
    accentLightBg: "bg-red-550/10",
    gradientFrom: "from-red-950/15",
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon",
    emoji: "🟣",
    bgPage: "bg-[#040409]",
    bgSidebar: "bg-[#070714]",
    bgCard: "bg-[#0a0a1a]",
    borderClass: "border-fuchsia-950/45",
    textPrimary: "text-slate-200",
    textMuted: "text-slate-500",
    accentText: "text-fuchsia-500",
    accentBg: "bg-fuchsia-600",
    accentRing: "ring-fuchsia-600",
    accentHover: "hover:bg-fuchsia-700",
    accentBorder: "border-fuchsia-500/15",
    accentLightBg: "bg-fuchsia-550/10",
    gradientFrom: "from-fuchsia-950/15",
  },
  {
    id: "ocean",
    name: "Deep Ocean Teal",
    emoji: "🔵",
    bgPage: "bg-[#01080b]",
    bgSidebar: "bg-[#041116]",
    bgCard: "bg-[#06171f]",
    borderClass: "border-cyan-950/30",
    textPrimary: "text-slate-100",
    textMuted: "text-slate-500",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-600",
    accentRing: "ring-cyan-600",
    accentHover: "hover:bg-cyan-700",
    accentBorder: "border-cyan-500/25",
    accentLightBg: "bg-cyan-550/10",
    gradientFrom: "from-cyan-950/25",
  },
  {
    id: "sunset",
    name: "Sunset Ember",
    emoji: "🟠",
    bgPage: "bg-[#0a0503]",
    bgSidebar: "bg-[#110906]",
    bgCard: "bg-[#170e0a]",
    borderClass: "border-orange-950/35",
    textPrimary: "text-slate-100",
    textMuted: "text-slate-500",
    accentText: "text-orange-500",
    accentBg: "bg-orange-600",
    accentRing: "ring-orange-600",
    accentHover: "hover:bg-orange-700",
    accentBorder: "border-orange-500/25",
    accentLightBg: "bg-orange-550/10",
    gradientFrom: "from-orange-950/20",
  },
  {
    id: "bengal-light",
    name: "Classic Light",
    emoji: "⚪",
    bgPage: "bg-slate-50",
    bgSidebar: "bg-slate-100",
    bgCard: "bg-white",
    borderClass: "border-slate-200",
    textPrimary: "text-slate-800",
    textMuted: "text-slate-500",
    accentText: "text-red-600",
    accentBg: "bg-red-600",
    accentRing: "ring-red-600/40",
    accentHover: "hover:bg-red-750",
    accentBorder: "border-red-600/15",
    accentLightBg: "bg-red-500/10",
    gradientFrom: "from-red-200/10",
  }
];

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Custom design themes state managers
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem("bengalstream_theme") || "bengal-dark";
  });

  const activeTheme = useMemo(() => {
    return THEMES.find(t => t.id === themeId) || THEMES[0];
  }, [themeId]);

  const handleSetTheme = (id: string) => {
    setThemeId(id);
    localStorage.setItem("bengalstream_theme", id);
  };

  // Selection filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("bd"); // Defaulting to Bangladesh for premium content priority
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Page load and network states
  const [isLoading, setIsLoading] = useState(false);
  const [activeLoadingCountry, setActiveLoadingCountry] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Picture-in-Picture floating player controls
  const [isFloating, setIsFloating] = useState(false);
  const playerAnchorRef = useRef<HTMLDivElement>(null);

  // Draggable PiP positioning state & handlers
  const [pipPosition, setPipPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem("bengalstream_pip_pos");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const isDraggingRef = useRef(false);
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });

  const clampPosition = (x: number, y: number, width: number, height: number) => {
    const margin = 12;
    const minX = margin;
    const maxX = Math.max(margin, window.innerWidth - width - margin);
    const minY = margin;
    const maxY = Math.max(margin, window.innerHeight - height - margin);
    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary mouse button/touch
    
    // Do not initiate drag if they clicked on interactive widgets/buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) {
      return;
    }

    const el = document.getElementById("active-video-player-deck");
    if (!el) return;

    el.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;

    const rect = el.getBoundingClientRect();
    
    // If pipPosition wasn't already set, we initialize it to its current rendered position
    if (!pipPosition) {
      setPipPosition({
        x: rect.left,
        y: rect.top
      });
    }

    dragStartOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const el = document.getElementById("active-video-player-deck");
    if (!el) return;

    const width = el.offsetWidth;
    const height = el.offsetHeight;

    const rawX = e.clientX - dragStartOffsetRef.current.x;
    const rawY = e.clientY - dragStartOffsetRef.current.y;

    const clamped = clampPosition(rawX, rawY, width, height);
    setPipPosition(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      const el = document.getElementById("active-video-player-deck");
      if (el) {
        el.releasePointerCapture(e.pointerId);
      }
      isDraggingRef.current = false;
      if (pipPosition) {
        localStorage.setItem("bengalstream_pip_pos", JSON.stringify(pipPosition));
      }
    }
  };

  // Clamping check on window resizing
  useEffect(() => {
    const handleResize = () => {
      if (pipPosition) {
        const el = document.getElementById("active-video-player-deck");
        if (el) {
          const width = el.offsetWidth;
          const height = el.offsetHeight;
          const clamped = clampPosition(pipPosition.x, pipPosition.y, width, height);
          if (clamped.x !== pipPosition.x || clamped.y !== pipPosition.y) {
            setPipPosition(clamped);
          }
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pipPosition]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (playerAnchorRef.current) {
            const rect = playerAnchorRef.current.getBoundingClientRect();
            // Become floating when the layout anchor top has scrolled -150px off-screen
            const scrolledPastAnchor = rect.top < -150;
            
            // Proximity check: disable floating when scrolled near the footer (approx bottom 380px)
            const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
            const isNearFooter = distanceFromBottom < 380;
            
            setIsFloating(scrolledPastAnchor && !isNearFooter);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize favorites from browser LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("bengalstream_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error("Local Favorites recovery failed: ", err);
      }
    }
  }, []);

  // Sync favorites state back to LocalStorage
  const handleToggleFavorite = (id: string) => {
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("bengalstream_favorites", JSON.stringify(updated));
  };

  /**
   * Action: Dynamic Dynamic Playlist Loader
   * Loads M3U playlists dynamically of specific Countries or Categories over IPTV-org
   */
  const loadDynamicPlaylist = async (type: "country" | "category", identifier: string) => {
    // PRE-POPULATE IMMEDIATELY from static channels to prevent empty visual lockouts
    if (type === "country") {
      const filtered = STATIC_CHANNELS.filter(c => c.country.toLowerCase() === identifier.toLowerCase());
      setChannels(filtered.length > 0 ? filtered : STATIC_CHANNELS);
    } else {
      const filtered = STATIC_CHANNELS.filter(c => c.category.toLowerCase() === identifier.toLowerCase());
      setChannels(filtered.length > 0 ? filtered : STATIC_CHANNELS);
    }

    setIsLoading(true);
    let playlistUrl = "";

    if (type === "country") {
      setActiveLoadingCountry(identifier);
      playlistUrl = `https://iptv-org.github.io/iptv/countries/${identifier.toLowerCase()}.m3u`;
    } else if (type === "category") {
      let catId = identifier.toLowerCase();
      if (catId === "cartoons") catId = "animation";
      else if (catId === "drama") catId = "series";
      playlistUrl = `https://iptv-org.github.io/iptv/categories/${catId}.m3u`;
    }

    try {
      const parsedChannels = await parseM3UFromURL(playlistUrl, type === "country" ? identifier : "all");
      
      if (parsedChannels && parsedChannels.length > 0) {
        // Merge with high quality fallbacks if available to provide the best index list
        const staticBackups = STATIC_CHANNELS.filter(c => c.country === identifier.toLowerCase());
        if (staticBackups.length > 0) {
          const combined = mergeChannels(staticBackups, parsedChannels);
          setChannels(combined);
        } else {
          setChannels(parsedChannels);
        }
      } else {
        // If fetch returns empty (due to network block or parsing limits), fall back cleanly
        console.warn(`Dynamic fetch returned empty for ${identifier}. Reverting to relevant static subset.`);
        fallbackLocalSubset(type, identifier);
      }
    } catch (err) {
      console.error("Dynamic loading crashed: ", err);
      fallbackLocalSubset(type, identifier);
    } finally {
      setIsLoading(false);
      setActiveLoadingCountry(null);
    }
  };

  // Safe merge logic to keep duplicates out
  const mergeChannels = (primary: Channel[], secondary: Channel[]) => {
    const urls = new Set(primary.map(c => c.url.toLowerCase()));
    const final = [...primary];
    secondary.forEach(ch => {
      if (!urls.has(ch.url.toLowerCase())) {
        final.push(ch);
      }
    });
    return final;
  };

  // Local fallback router when dynamic live calls fail
  const fallbackLocalSubset = (type: "country" | "category", identifier: string) => {
    if (type === "country") {
      const filtered = STATIC_CHANNELS.filter(c => c.country.toLowerCase() === identifier.toLowerCase());
      setChannels(filtered.length > 0 ? filtered : STATIC_CHANNELS);
    } else {
      const filtered = STATIC_CHANNELS.filter(c => c.category.toLowerCase() === identifier.toLowerCase());
      setChannels(filtered.length > 0 ? filtered : STATIC_CHANNELS);
    }
  };

  /**
   * Core Mount Lifecycle Loader
   */
  useEffect(() => {
    // Initial mount: load preferred Bangladesh playlist
    loadDynamicPlaylist("country", "bd");
    
    // Choose our first fallback as selected default playback channel
    const bdChannel = STATIC_CHANNELS.find(c => c.id === "btv-world");
    if (bdChannel) {
      setSelectedChannel(bdChannel);
    }
  }, []);

  // Handle Country selection triggering
  const handleSelectCountry = (code: string) => {
    setSelectedCountry(code);
    setSelectedCategory("all");
    loadDynamicPlaylist("country", code);
    setMobileMenuOpen(false);
  };

  // Handle Category selection triggering
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedCountry("all");
    
    if (categoryId === "all") {
      // Revert to default list
      setChannels(STATIC_CHANNELS);
    } else {
      loadDynamicPlaylist("category", categoryId);
    }
    setMobileMenuOpen(false);
  };

  // Reset to robust premium static subset
  const handleResetToStatic = () => {
    setChannels(STATIC_CHANNELS);
    setSelectedCategory("all");
    setSelectedCountry("all");
  };

  // Computes which channels should render based on active favorites state
  const computedChannels = useMemo(() => {
    if (showFavoritesOnly) {
      // Find matches in either the currently loaded dynamic list or fallback static list
      const allPossible = mergeChannels(STATIC_CHANNELS, channels);
      return allPossible.filter(c => favorites.includes(c.id));
    }
    return channels;
  }, [channels, showFavoritesOnly, favorites]);

  // Extract a popular subset list of static/featured elements for Hero sections
  const featuredList = useMemo(() => {
    return STATIC_CHANNELS.filter(c => c.isFeatured);
  }, []);

  return (
    <div className={`min-h-screen ${activeTheme.bgPage} ${activeTheme.textPrimary} font-sans flex flex-col antialiased transition-colors duration-300`}>
      
      {/* Mobile Sticky Toolbar Header */}
      <header className={`lg:hidden flex items-center justify-between p-4 ${activeTheme.bgSidebar} border-b ${activeTheme.borderClass} z-30 relative`}>
        <div 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 select-none active:scale-[0.98] transition-all"
          title="Reload Home"
        >
          <div className={`h-8 w-8 ${activeTheme.accentBg} rounded-lg flex items-center justify-center`}>
            <Tv className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-display font-black text-sm tracking-tight text-white uppercase flex items-center gap-1">
            BENGAL <span className={activeTheme.accentText}>STREAM</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <span className={`text-[10px] ${activeTheme.accentText} font-mono animate-pulse mr-2 flex items-center gap-1`}>
              <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Fetching...
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-[#121212]/50 border border-white/5 text-slate-300 hover:text-white rounded-lg active:scale-95 transition-all outline-none"
            title="Toggle Menu Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Primary Layout Wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* SIDEBAR FILTER NAVIGATION DRAWER - Desktop Always Visible, Mobile overlay */}
        <div className={`
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          fixed lg:relative inset-y-0 left-0 w-full lg:w-auto h-[calc(100vh-60px)] lg:h-auto z-40 lg:z-10
          transition-transform duration-300 ease-in-out lg:flex
        `}>
          <Sidebar 
            theme={activeTheme}
            onChangeTheme={handleSetTheme}
            themesList={THEMES}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
            favoritesCount={favorites.length}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={setShowFavoritesOnly}
            activeLoadingCountry={activeLoadingCountry}
          />
        </div>

        {/* Dynamic Mobile overlay backdrop drawer trigger */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden mt-[60px]"
          />
        )}

        {/* MAIN TV TERMINAL CONTENT REGION */}
        <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full overflow-visible">
          
          <div className="flex flex-col gap-6 sm:gap-8 w-full">
            
            {/* TOP GRAPHICAL HERO CONTAINER */}
            <section id="hero-banner-billboard" className="w-full">
              <FeaturedHero 
                theme={activeTheme}
                channel={selectedChannel}
                onPlayChannel={(chan) => {
                  setSelectedChannel(chan);
                  document.getElementById("active-video-player-deck")?.scrollIntoView({ behavior: "smooth" });
                }}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                featuredList={featuredList}
              />
            </section>

            {/* STICKY LIVE BROADCAST TERMINAL */}
            {selectedChannel && (
              <>
                {/* Layout Anchor used to preserve height and detect scroll offset */}
                <div ref={playerAnchorRef} className="w-full h-[1px]" />
                
                <section 
                  id="active-video-player-deck" 
                  className={isFloating 
                    ? `fixed bottom-28 right-4 sm:bottom-32 sm:right-6 md:right-8 w-[320px] sm:w-[380px] max-w-[92vw] z-40 bg-[#0c0c0c]/98 sm:${activeTheme.bgCard} border ${activeTheme.borderClass} rounded-2xl p-3 shadow-2xl shadow-black/100 animate-in fade-in slide-in-from-bottom-6 cursor-grab active:cursor-grabbing`
                    : `bg-[#080808]/95 sm:${activeTheme.bgCard} border-b sm:border ${activeTheme.borderClass} sm:rounded-2xl p-0 sm:p-5 shadow-2xl shadow-black/95 w-full mx-auto`
                  }
                  style={isFloating && pipPosition ? {
                    position: "fixed",
                    left: `${pipPosition.x}px`,
                    top: `${pipPosition.y}px`,
                    bottom: "auto",
                    right: "auto",
                    touchAction: "none"
                  } : isFloating ? {
                    touchAction: "none"
                  } : undefined}
                  onPointerDown={isFloating ? handlePointerDown : undefined}
                  onPointerMove={isFloating ? handlePointerMove : undefined}
                  onPointerUp={isFloating ? handlePointerUp : undefined}
                >
                  {isFloating && (
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 px-1 select-none">
                      <div className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing">
                        <GripHorizontal className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest font-mono text-red-500 animate-pulse">
                            Live Tuner PiP
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">Drag to move</span>
                        <button 
                          onClick={() => setSelectedChannel(null)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                          title="Close Player"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {!isFloating && (
                    <div className="hidden sm:flex items-center gap-2 mb-4">
                      <Radio className={`h-4.5 w-4.5 ${activeTheme.accentText} animate-pulse`} />
                      <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">
                        Live Broadcast Terminal
                      </h2>
                    </div>
                  )}
                  
                  <VideoPlayer theme={activeTheme} channel={selectedChannel} isFloating={isFloating} />

                  {isFloating && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-3 px-1 select-none">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={selectedChannel.logo} 
                          alt={selectedChannel.name} 
                          onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedChannel.name)}`; }}
                          className="w-8 h-8 rounded-lg object-contain bg-black/80 p-1 border border-white/10 shrink-0 shadow-sm"
                        />
                        <div className="min-w-0 flex flex-col">
                          <span className="text-[11px] font-bold text-white truncate font-display">
                            {selectedChannel.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 truncate uppercase mt-0.5">
                            {selectedChannel.category || "General"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => {
                            playerAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-[9px] bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-white border border-red-500/15 hover:border-red-500/35 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95"
                          title="Expand Player to Main View"
                        >
                          <Tv className="h-3 w-3" />
                          <span>Expand</span>
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* SPECIALIZED ENTERTAINMENT LOUNGES CARD DECK */}
            <section id="specialized-entertainment-lounges" className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className={`h-4.5 w-4.5 ${activeTheme.accentText}`} />
                <h2 className="text-xs font-black uppercase tracking-wider font-mono text-slate-400">
                  Premium Curated Lounges
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* CARTOONS LOUNGE */}
                <div
                  onClick={() => {
                    setShowFavoritesOnly(false);
                    handleSelectCategory("cartoons");
                    const ch = STATIC_CHANNELS.find(c => c.id === "kids-disney-channel");
                    if (ch) setSelectedChannel(ch);
                    document.getElementById("active-video-player-deck")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative rounded-2xl bg-gradient-to-br from-rose-950/20 via-[#0d0d0d] to-[#040404] border flex flex-col justify-between p-5 min-h-[145px] hover:border-rose-500/35 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-rose-950/5 cursor-pointer overflow-hidden ${
                    selectedCategory === "cartoons"
                      ? "border-rose-500/40 ring-2 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.12)]"
                      : "border-white/5"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-all duration-500"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                      <span className="text-2xl select-none">🧙</span>
                    </div>
                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-455 border border-rose-500/15">
                      4 PREMIUM NODES
                    </span>
                  </div>

                  <div className="mt-4 relative z-10 flex flex-col gap-1">
                    <h3 className="font-display font-extrabold text-sm text-slate-100 group-hover:text-rose-400 transition-colors">
                      Cartoon Video Arena
                    </h3>
                    <p className="text-[10px] text-slate-450 leading-normal line-clamp-2">
                      Classic 24/7 cartoons, Disney streams, and retro masterpieces to spark imagination.
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-rose-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>⚡ ENTER NOW</span>
                    </div>
                  </div>
                </div>

                {/* DRAMA LOUNGE */}
                <div
                  onClick={() => {
                    setShowFavoritesOnly(false);
                    handleSelectCategory("drama");
                    const ch = STATIC_CHANNELS.find(c => c.id === "drama-hum-tv");
                    if (ch) setSelectedChannel(ch);
                    document.getElementById("active-video-player-deck")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative rounded-2xl bg-gradient-to-br from-indigo-950/20 via-[#0d0d0d] to-[#040404] border flex flex-col justify-between p-5 min-h-[145px] hover:border-indigo-500/35 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-indigo-950/5 cursor-pointer overflow-hidden ${
                    selectedCategory === "drama"
                      ? "border-indigo-500/40 ring-2 ring-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.12)]"
                      : "border-white/5"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all duration-500"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                      <span className="text-2xl select-none">🍿</span>
                    </div>
                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/15">
                      5 PREMIUM NODES
                    </span>
                  </div>

                  <div className="mt-4 relative z-10 flex flex-col gap-1">
                    <h3 className="font-display font-extrabold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors">
                      Premium Drama Hub
                    </h3>
                    <p className="text-[10px] text-slate-450 leading-normal line-clamp-2">
                      Binge iconic drama series, PAK drama networks, and high-suspense stories.
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-indigo-455 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>⚡ ENTER NOW</span>
                    </div>
                  </div>
                </div>

                {/* MOVIES LOUNGE */}
                <div
                  onClick={() => {
                    setShowFavoritesOnly(false);
                    handleSelectCategory("movies");
                    const ch = STATIC_CHANNELS.find(c => c.id === "movies-spotlight-blockbusters");
                    if (ch) setSelectedChannel(ch);
                    document.getElementById("active-video-player-deck")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative rounded-2xl bg-gradient-to-br from-amber-955/20 via-[#0d0d0d] to-[#040404] border flex flex-col justify-between p-5 min-h-[145px] hover:border-amber-500/35 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-amber-950/5 cursor-pointer overflow-hidden ${
                    selectedCategory === "movies"
                      ? "border-amber-500/40 ring-2 ring-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                      : "border-white/5"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                      <span className="text-2xl select-none">🎬</span>
                    </div>
                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-amber-955/40 text-amber-400 border border-amber-500/15">
                      13 LIVE NODES
                    </span>
                  </div>

                  <div className="mt-4 relative z-10 flex flex-col gap-1">
                    <h3 className="font-display font-extrabold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">
                      Blockbuster Movies
                    </h3>
                    <p className="text-[10px] text-slate-450 leading-normal line-clamp-2">
                      Hollywood blockbusters, Action thrillers, and global curated cinematic streams.
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-amber-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>⚡ ENTER NOW</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* CHANNELS GRID CATALOGUE CARD */}
            <section id="channels-catalogue-bento" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-4.5 w-4.5 ${activeTheme.accentText}`} />
                  <h2 className="text-sm sm:text-base font-bold text-white font-display">
                    {showFavoritesOnly ? "Your Bookmarked Channels" : "Live Stream Channel Listings"}
                  </h2>
                </div>
                {showFavoritesOnly && (
                  <button 
                    onClick={() => setShowFavoritesOnly(false)}
                    className={`text-xs ${activeTheme.accentText} hover:opacity-80 font-bold hover:underline cursor-pointer`}
                  >
                    Show All Available Channels
                  </button>
                )}
              </div>
              
              <ChannelGrid 
                theme={activeTheme}
                channels={computedChannels}
                selectedChannel={selectedChannel}
                onSelectChannel={(chan) => {
                  setSelectedChannel(chan);
                  document.getElementById("active-video-player-deck")?.scrollIntoView({ behavior: "smooth" });
                }}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                isLoading={isLoading}
                onResetToStatic={handleResetToStatic}
              />
            </section>

          </div>
        </main>

      </div>

      {/* Global Bottom Credit / Status line */}
      <footer className={`${activeTheme.bgSidebar} border-t ${activeTheme.borderClass} py-6 px-6 text-slate-500 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 transition-colors`}>
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-mono text-xs text-slate-400">
            © 2026 BENGAL STREAM TV. Developed with precision for Sajid.
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            Active access terminals and media channels online.
          </p>
        </div>

        {/* FOUR PREMIUM BRANDED SOCIAL BADGES */}
        <div className="flex flex-wrap items-center gap-3 justify-center select-none">
          {/* YouTube Icon */}
          <a
            href="https://www.youtube.com/@ExplorerMotivation"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-[#FF0000] border border-red-500/15 hover:border-red-500/35 p-3 md:px-4 md:py-2.5 rounded-2xl text-xs font-bold font-mono tracking-wide transition-all shadow-md active:scale-[0.98]"
            title="Explorer Motivation on YouTube"
          >
            <Youtube className="h-5 w-5 text-[#FF0000] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-slate-300 group-hover:text-white transition-colors font-display font-medium">Explorer Motivation</span>
          </a>

          {/* Facebook Icon */}
          <a
            href="https://www.facebook.com/programmer.sajid"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/15 hover:border-[#1877F2]/35 p-3 md:px-4 md:py-2.5 rounded-2xl text-xs font-bold font-mono tracking-wide transition-all shadow-md active:scale-[0.98]"
            title="Sajid's Facebook Profile"
          >
            <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-slate-300 group-hover:text-white transition-colors font-display font-medium">Facebook</span>
          </a>

          {/* LinkedIn Icon */}
          <a
            href="https://linkedin.com/in/developersajid"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center gap-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/15 hover:border-[#0A66C2]/35 p-3 md:px-4 md:py-2.5 rounded-2xl text-xs font-bold font-mono tracking-wide transition-all shadow-md active:scale-[0.98]"
            title="Sajid's LinkedIn Connect"
          >
            <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-slate-300 group-hover:text-white transition-colors font-display font-medium">LinkedIn</span>
          </a>

          {/* GitHub Icon */}
          <a
            href="https://github.com/engineersajid/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20 p-3 md:px-4 md:py-2.5 rounded-2xl text-xs font-bold font-mono tracking-wide transition-all shadow-md active:scale-[0.98]"
            title="Sajid's GitHub"
          >
            <Github className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-slate-300 group-hover:text-white transition-colors font-display font-medium">GitHub</span>
          </a>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${activeTheme.accentBg} animate-pulse`}></span> HLS DEC ENGINE: READY
          </span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer flex items-center gap-1">
            <HelpCircle className={`h-3 w-3 ${activeTheme.accentText}`} /> System Guide
          </span>
        </div>
      </footer>

    </div>
  );
}
