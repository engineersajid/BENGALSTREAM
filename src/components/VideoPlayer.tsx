import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  RotateCcw, Sliders, Info, AlertTriangle, Radio, Activity,
  Tv, Eye, Settings
} from "lucide-react";
import { Channel, StreamStats } from "../types";

interface VideoPlayerProps {
  channel: Channel | null;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
}

export default function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Custom Controls HUD Toggle
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Statistics display
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<StreamStats | null>(null);

  // Active playing level resolution height tracker for Auto selector
  const [activeHeight, setActiveHeight] = useState<string>("Detecting...");

  // Quality Select lists
  const [qualityLevels, setQualityLevels] = useState<{ index: number; name: string }[]>([]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState<number>(-1);

  // Restart a stream when it hangs or encounters a fatal network error
  const handleReload = () => {
    if (!channel) return;
    setHasError(false);
    setIsLoading(true);
    setErrorMessage("");
    setErrorCount(0);
    initializePlayer();
  };

  // Initialize HLS player or native HLS player (for Safari)
  const initializePlayer = () => {
    const video = videoRef.current;
    if (!video || !channel) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    // Reset quality states
    setQualityLevels([]);
    setCurrentQualityIndex(-1);
    setActiveHeight("Detecting...");

    // Destruct any previous player instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Set initial stats
    setStats({
      url: channel.url,
      format: channel.url.includes(".m3u8") ? "HLS (HTTP Live Streaming)" : "MPEG-DASH / MP4",
      protocol: channel.url.startsWith("https") ? "HTTPS Live Secure" : "HTTP Plaintext",
      resolution: "Detecting...",
      fps: 0,
      latency: 0
    });

    const updateStatsFromHls = (hlsInstance: Hls) => {
      hlsInstance.on(Hls.Events.LEVEL_LOADED, (_, data) => {
        const details = data.details;
        setStats(prev => {
          if (!prev) return null;
          return {
            ...prev,
            latency: Math.round((details.targetduration || 5) * 1.5 * 10) / 10
          };
        });
      });

      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const activeLevel = hlsInstance.levels[data.level];
        if (activeLevel) {
          const height = activeLevel.height;
          const isAuto = hlsInstance.loadLevel === -1;
          const label = height ? `${height}p` : `Profile ${data.level + 1}`;
          setActiveHeight(label);
          setStats(prev => {
            if (!prev) return null;
            return {
              ...prev,
              resolution: height ? `${height}p${isAuto ? " (Auto)" : ""}` : `Profile ${data.level + 1}${isAuto ? " (Auto)" : ""}`
            };
          });
        }
      });

      hlsInstance.on(Hls.Events.FRAG_BUFFERED, (_, data) => {
        setStats(prev => {
          if (!prev) return null;
          return {
            ...prev,
            fps: data.stats?.loading?.start ? Math.round(1000 / (data.stats.loading.end - data.stats.loading.start)) : 30
          };
        });
      });
    };

    // If stream is HLS and Hls.js is supported
    if (channel.url.toLowerCase().includes(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        lowLatencyMode: true,
        backBufferLength: 10,
        // Error handling settings
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 4
      });

      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Find the index of the highest resolution / bitrate level to set as startLevel (High-Quality Auto Boot)
        let highestLevelIndex = -1;
        if (hls.levels && hls.levels.length > 0) {
          let maxResolution = -1;
          let maxBitrate = -1;
          hls.levels.forEach((lvl, index) => {
            const height = lvl.height || 0;
            const bitrate = lvl.bitrate || 0;
            if (height > maxResolution || (height === maxResolution && bitrate > maxBitrate)) {
              maxResolution = height;
              maxBitrate = bitrate;
              highestLevelIndex = index;
            }
          });
        }

        if (highestLevelIndex !== -1) {
          // Tell Hls.js to begin loading at the highest available level index
          hls.startLevel = highestLevelIndex;
        }

        // Collect parsed quality levels from manifest
        if (hls.levels && hls.levels.length > 0) {
          const parsedLevels = hls.levels.map((lvl, index) => {
            const height = lvl.height || 0;
            const bitrate = lvl.bitrate || 0;
            return {
              index,
              height,
              bitrate,
              name: height ? `${height}p` : `Profile ${index + 1}`
            };
          });
          
          // Sort descending so higher resolution is at the top of the menu selector
          parsedLevels.sort((a, b) => {
            if (b.height !== a.height) {
              return b.height - a.height;
            }
            return b.bitrate - a.bitrate;
          });
          setQualityLevels(parsedLevels);
        } else {
          setQualityLevels([]);
        }
        setCurrentQualityIndex(hls.currentLevel);

        video.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            setHasError(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      });

      // Handle Errors
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.warn("HLS.js player error:", data);
        
        if (data.fatal) {
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Fatal network error identified, attempting automatic recovery...");
              hls.startLoad();
              setErrorCount(prev => {
                const updated = prev + 1;
                if (updated > 3) {
                  setHasError(true);
                  setErrorMessage("Network connection timed out or is forbidden. The broadcast provider might be temporarily down or geo-blocked.");
                }
                return updated;
              });
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Fatal media payload error, running recovery...");
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setErrorMessage("Unable to decode stream format. The channel's live broadcast may currently be offline.");
              hls.destroy();
              break;
          }
        }
      });

      updateStatsFromHls(hls);
    } 
    // If browser supports HLS natively (Safari / iOS Chrome / iOS Safari)
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      video.addEventListener("loadedmetadata", () => {
        video.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            setHasError(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      });

      video.addEventListener("error", () => {
        setIsLoading(false);
        setHasError(true);
        setErrorMessage("Native video playback system was unable to load this channel's Live M3U8 feed.");
      });
    } 
    // Fallback: Standard Source Attachment
    else {
      video.src = channel.url;
      video.addEventListener("error", () => {
        setIsLoading(false);
        setHasError(true);
        setErrorMessage("Format incompatible. HLS streams require extensions or modern browser decoding engines.");
      });
    }
  };

  useEffect(() => {
    initializePlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // Sync volume state to video ref
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Toggle Play / Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error(err));
    }
  };

  // Handle Quality Override Options
  const handleQualityChange = (index: number) => {
    setCurrentQualityIndex(index);
    if (hlsRef.current) {
      if (index === -1) {
        hlsRef.current.currentLevel = -1;
        hlsRef.current.loadLevel = -1;
        setStats(prev => prev ? { ...prev, resolution: "Detecting... (Auto)" } : null);
      } else {
        hlsRef.current.currentLevel = index;
        hlsRef.current.loadLevel = index;
        const lvl = hlsRef.current.levels[index];
        if (lvl) {
          const height = lvl.height || lvl.width || "Custom";
          setStats(prev => prev ? { ...prev, resolution: `${height}p` } : null);
          setActiveHeight(`${height}p`);
        }
      }
    }
  };

  // Auto-hide HUD controls on mouse stop
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showStats) {
        setShowControls(false);
      }
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showStats]);

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Premium Screen Container */}
      <div 
        id="tv-viewport-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && !showStats && setShowControls(false)}
        className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/5 group"
      >
        {/* Core HTML5 Video Element */}
        <video 
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onClick={togglePlay}
        />

        {/* Loading / Spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]/95 z-20 gap-4 transition-opacity duration-300">
            <div className="relative flex justify-center items-center">
              {/* Spinning Ring */}
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
              {/* Static Pulsing center */}
              <Tv className="absolute text-red-500 h-6 w-6 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-slate-100 font-bold select-none font-display text-sm tracking-wide">Tuner Decoding Broadcast...</p>
              {channel && (
                <p className="text-xs text-slate-400 mt-1">Connecting to {channel.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Error State Card Overlay */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]/95 z-20 p-6 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
              <AlertTriangle className="text-red-500 h-10 w-10 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-display mb-2">Stream Offline / Blocked</h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              {errorMessage || "The live broadcast provider might be temporarily down, overloaded, or restricts connections outside their local region."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleReload}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-705 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-red-900/35 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reconnect Broadcast
              </button>
            </div>
          </div>
        )}

        {/* Idle Splash Screen if No Channel Selected */}
        {!channel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f] z-20 p-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <div className="relative mb-6">
              <div className="h-20 w-20 bg-gradient-to-tr from-red-500/5 to-red-600/10 rounded-full flex items-center justify-center border border-white/5 animate-pulse">
                <Tv className="h-8 w-8 text-red-500" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-red-600 p-1 rounded-full shadow-lg border border-red-500">
                <Radio className="h-3.5 w-3.5 text-white animate-ping absolute" />
                <Radio className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-200 font-display mb-2">Live TV Stream Deck</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Choose a broadcast channel from the listings grid or select your favorite countries in the left drawer to begin high-speed streaming.
            </p>
            <span className="text-xs bg-[#121212] text-red-500 px-3 py-1.5 rounded-full border border-white/5 font-mono tracking-wider font-bold">
              IPTV GLOBAL LINK ACTIVE
            </span>
          </div>
        )}

        {/* Premium Streaming Controls HUD Overlay */}
        {channel && showControls && !hasError && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/25 to-black/60 z-10 transition-opacity duration-300 pointer-events-none select-none">
            
            {/* Top Bar Details */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`; }}
                  className="w-10 h-10 rounded-lg object-contain bg-[#080808]/90 p-1 border border-white/5 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white font-display drop-shadow">
                      {channel.name}
                    </h2>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 drop-shadow mt-0.5">
                    <span className="bg-[#121212]/90 backdrop-blur px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider font-mono text-red-400 border border-white/5 animate-pulse">
                      {channel.category}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{channel.language || "Multi-Language"}</span>
                  </div>
                </div>
              </div>

              {/* Status Tools */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowStats(!showStats)}
                  className={`p-2 rounded-lg backdrop-blur flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    showStats ? "bg-red-650 text-white" : "bg-[#121212]/90 text-slate-300 hover:text-white"
                  }`}
                  title="Advanced Stream Metadata"
                >
                  <Activity className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleReload}
                  className="p-2 rounded-lg bg-[#121212]/90 text-slate-300 hover:text-white backdrop-blur flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  title="Force Feed Refresh"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Diagnostics Panel overlay */}
            {showStats && stats && (
              <div className="absolute right-4 bottom-20 w-80 bg-[#080808]/95 border border-white/10 backdrop-blur p-4 rounded-xl text-slate-300 font-mono text-[10px] z-30 drop-shadow-2xl shadow-black pointer-events-auto">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <span className="text-xs font-bold font-display text-slate-100 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-red-500" /> STREAM METRICS
                  </span>
                  <span className="bg-red-600/15 text-red-500 font-bold px-1.5 py-0.5 rounded text-[9px]">
                    ONLINE
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">FORMAT:</span>
                    <span className="text-slate-200 text-right">{stats.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">COMPILER:</span>
                    <span className="text-slate-200">Hls.js Engine</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PROTOCOL:</span>
                    <span className="text-slate-200">{stats.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RESOLUTION:</span>
                    <span className="text-red-500 font-bold">{stats.resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DECODE LATENCY:</span>
                    <span className="text-slate-200">{stats.latency ? `${stats.latency} seconds` : "Real-time"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#121212]/90 border border-white/5 p-1.5 rounded mt-2">
                    <span className="text-slate-400">ACTIVE SOURCE:</span>
                    <span className="text-[9px] text-slate-400 hover:text-slate-200 select-all truncate ml-2 max-w-[150px]" title={stats.url}>
                      {stats.url}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Controls HUD Strip */}
            <div className="w-full p-4 sm:p-6 flex flex-col gap-3 pointer-events-auto">
              
              {/* Media Controller Row */}
              <div className="flex items-center justify-between">
                
                {/* Left controls */}
                <div className="flex items-center gap-4">
                  {/* Play / Pause Toggle Button */}
                  <button 
                    onClick={togglePlay}
                    className="p-3 bg-red-600 hover:bg-red-750 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-white text-white" /> : <Play className="h-5 w-5 fill-white text-white ml-0.5" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2 group/volume relative">
                    <button 
                      onClick={toggleMute}
                      className="p-2 bg-[#121212]/90 hover:bg-[#181818] text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-16 md:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {/* Resolution Quality Control Dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#121212]/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-white/5 text-xs text-slate-300">
                    <Settings className="h-3.5 w-3.5 text-slate-400 group-hover:rotate-12 transition-transform" />
                    <select
                      value={currentQualityIndex}
                      onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                      className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer text-xs font-bold pr-1 font-sans select-none"
                      title="Select Stream Quality"
                    >
                      <option value="-1" className="bg-[#0c0c0c] text-slate-200 font-sans font-semibold">
                        Auto {activeHeight && activeHeight !== "Detecting..." ? `(${activeHeight})` : ""}
                      </option>
                      {qualityLevels.map((lvl) => (
                        <option key={lvl.index} value={lvl.index} className="bg-[#0c0c0c] text-slate-200 font-sans font-semibold">
                          {lvl.name}
                        </option>
                      ))}
                      {qualityLevels.length === 0 && (
                        <option value="-1" className="bg-[#0c0c0c] text-slate-400 font-sans font-semibold" disabled>
                          Adaptive Feed
                        </option>
                      )}
                    </select>
                  </div>

                  <span className="hidden sm:flex text-xs text-white/80 font-mono bg-[#121212]/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-white/5 items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-red-500 animate-pulse" /> LIVE STREAM
                  </span>
                  
                  {/* Fullscreen Button */}
                  <button 
                    onClick={toggleFullscreen}
                    className="p-2.5 bg-[#121212]/90 hover:bg-[#181818] text-white rounded-lg flex items-center justify-center transition-all cursor-pointer border border-white/5"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* Helpful Warning Banner below Player */}
      {channel && (
        <div className="bg-[#0f0f0f] border border-white/5 p-3 sm:p-4 rounded-xl flex items-start gap-3 shadow-md">
          <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed font-sans">
            <span className="font-bold text-white">Stream Notice:</span> Public IPTV stream links can occasionally experience server stress or geographical broadcasting blockades. If the buffering hangs or fails, use the <span className="font-bold text-red-400 flex inline-items items-center gap-0.5 inline hover:underline cursor-pointer" onClick={handleReload}><RotateCcw className="h-3 w-3 inline" /> Reconnect</span> toolbar utility or try selecting another channel from the grid list.
          </div>
        </div>
      )}
    </div>
  );
}
