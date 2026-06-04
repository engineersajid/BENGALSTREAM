import { useState, useEffect, useMemo } from "react";
import { Menu, X, Tv, Heart, Radio, RefreshCw, Sparkles, HelpCircle, AlertCircle } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChannelGrid from "./components/ChannelGrid";
import VideoPlayer from "./components/VideoPlayer";
import FeaturedHero from "./components/FeaturedHero";
import { parseM3UFromURL } from "./utils/m3uParser";
import { STATIC_CHANNELS } from "./data/staticChannels";
import { Channel } from "./types";

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Selection filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("bd"); // Defaulting to Bangladesh for premium content priority
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Page load and network states
  const [isLoading, setIsLoading] = useState(false);
  const [activeLoadingCountry, setActiveLoadingCountry] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setIsLoading(true);
    let playlistUrl = "";

    if (type === "country") {
      setActiveLoadingCountry(identifier);
      playlistUrl = `https://iptv-org.github.io/iptv/countries/${identifier.toLowerCase()}.m3u`;
    } else if (type === "category") {
      playlistUrl = `https://iptv-org.github.io/iptv/categories/${identifier.toLowerCase()}.m3u`;
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
    <div className="min-h-screen bg-[#080808] text-slate-100 font-sans flex flex-col antialiased">
      
      {/* Mobile Sticky Toolbar Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#0d0d0d] border-b border-white/5 z-30 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-red-650 rounded-lg flex items-center justify-center">
            <Tv className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-display font-black text-sm tracking-tight text-white uppercase">
            BENGAL <span className="text-red-500">STREAM</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[10px] text-red-500 font-mono animate-pulse mr-2 flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Fetching...
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-[#121212] border border-white/5 text-slate-300 hover:text-white rounded-lg active:scale-95 transition-all outline-none"
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full overflow-hidden">
          
          {/* TOP GRAPHICAL HERO CONTAINER */}
          <section id="hero-banner-billboard">
            <FeaturedHero 
              channel={selectedChannel}
              onPlayChannel={(chan) => {
                setSelectedChannel(chan);
                // Smooth scroll view back to active deck
                document.getElementById("tv-viewport-container")?.scrollIntoView({ behavior: "smooth" });
              }}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              featuredList={featuredList}
            />
          </section>

          {/* ACTIVE VIDEO FEED DECK CARD */}
          {selectedChannel && (
            <section id="active-video-player-deck" className="bg-[#0c0c0c]/90 p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">
                  Active Decoder Broadcast Terminal
                </h2>
              </div>
              <VideoPlayer channel={selectedChannel} />
            </section>
          )}

          {/* CHANNELS GRID CATALOGUE CARD */}
          <section id="channels-catalogue-bento">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-red-500" />
                <h2 className="text-md sm:text-lg font-bold text-white font-display">
                  {showFavoritesOnly ? "Your Bookmarked Channels" : "Live Stream Channel Listings"}
                </h2>
              </div>
              {showFavoritesOnly && (
                <button 
                  onClick={() => setShowFavoritesOnly(false)}
                  className="text-xs text-red-550 hover:text-red-400 font-bold hover:underline cursor-pointer"
                >
                  Show All Available Channels
                </button>
              )}
            </div>
            
            <ChannelGrid 
              channels={computedChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              isLoading={isLoading}
              onResetToStatic={handleResetToStatic}
            />
          </section>

        </main>

      </div>

      {/* Global Bottom Credit / Status line */}
      <footer className="bg-[#0b0b0b] border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <p className="font-mono">
          © 2026 BENGAL STREAM TV. Powered by public IPTV coordinates. All access systems open.
        </p>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span> HLS DEC ENGINE: READY
          </span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-red-500" /> System Guide
          </span>
        </div>
      </footer>

    </div>
  );
}
