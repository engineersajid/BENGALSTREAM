import { Channel, Country, Category } from "../types";

// Master categories list with matching visual icons and colors
export const POPULAR_CATEGORIES: Category[] = [
  { id: "all", name: "All Channels", emoji: "📺" },
  { id: "news", name: "News", emoji: "📰" },
  { id: "sports", name: "Sports", emoji: "⚽" },
  { id: "cartoons", name: "Cartoons", emoji: "🧙" },
  { id: "drama", name: "Drama Series", emoji: "🍿" },
  { id: "movies", name: "Movies", emoji: "🎬" },
  { id: "entertainment", name: "Entertainment", emoji: "🎭" },
  { id: "general", name: "General", emoji: "📡" },
  { id: "music", name: "Music", emoji: "🎵" },
  { id: "kids", name: "Kids", emoji: "🧸" },
  { id: "documentary", name: "Documentary", emoji: "🦕" },
  { id: "religious", name: "Religious", emoji: "🕌" }
];

// Curated list of high-priority countries with flag identifiers
export const CHOSEN_COUNTRIES: Country[] = [
  { code: "bd", name: "Bangladesh", flag: "🇧🇩" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "pk", name: "Pakistan", flag: "🇵🇰" },
  { code: "np", name: "Nepal", flag: "🇳🇵" },
  { code: "lk", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "my", name: "Malaysia", flag: "🇲🇾" },
  { code: "mv", name: "Maldives", flag: "🇲🇻" },
  { code: "bt", name: "Bhutan", flag: "🇧🇹" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "pt", name: "Portugal", flag: "🇵🇹" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "ch", name: "Switzerland", flag: "🇨🇭" },
  { code: "sa", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "ae", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "tr", name: "Turkey", flag: "🇹🇷" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "qa", name: "Qatar", flag: "🇶🇦" },
  { code: "kw", name: "Kuwait", flag: "🇰🇼" },
  { code: "id", name: "Indonesia", flag: "🇮🇩" },
  { code: "th", name: "Thailand", flag: "🇹🇭" },
  { code: "vn", name: "Vietnam", flag: "🇻🇳" },
  { code: "ph", name: "Philippines", flag: "🇵🇭" }
];

// Curated high-reliability premium fallback channels
export const STATIC_CHANNELS: Channel[] = [
  {
    id: "btv-world",
    name: "BTV World",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Btv_logo.png",
    url: "https://live.btv.gov.bd/hls/btv-world.m3u8",
    category: "general",
    country: "bd",
    countryName: "Bangladesh",
    language: "Bengali",
    isFeatured: true,
    alternateUrls: [
      "https://live.btv.gov.bd/hls/btv-world.m3u8",
      "https://live.btv.gov.bd/hls/btv-world_ld.m3u8"
    ]
  },
  {
    id: "shangshad-tv",
    name: "Sangshad Television",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/25/Sangshad_Television_logo.png",
    url: "https://live.btv.gov.bd/hls/sangshad-tv.m3u8",
    category: "general",
    country: "bd",
    countryName: "Bangladesh",
    language: "Bengali",
    isFeatured: true,
    alternateUrls: [
      "https://live.btv.gov.bd/hls/sangshad-tv.m3u8",
      "https://live.btv.gov.bd/hls/sangshad-tv_ld.m3u8"
    ]
  },
  {
    id: "dd-news",
    name: "DD News India",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/DD_News.svg",
    url: "https://ddnewslive.akamaized.net/hls/live/2011986/ddnews/master.m3u8",
    category: "news",
    country: "in",
    countryName: "India",
    language: "Hindi",
    isFeatured: true,
    alternateUrls: [
      "https://ddnewslive.akamaized.net/hls/live/2011986/ddnews/master.m3u8",
      "https://ddnewslive.akamaized.net/hls/live/2011986/ddnews/index.m3u8"
    ]
  },
  {
    id: "dd-india",
    name: "DD India English",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/DD_India.svg",
    url: "https://ddindialive.akamaized.net/hls/live/2012015/ddindia/master.m3u8",
    category: "news",
    country: "in",
    countryName: "India",
    language: "English",
    isFeatured: true,
    alternateUrls: [
      "https://ddindialive.akamaized.net/hls/live/2012015/ddindia/master.m3u8",
      "https://ddindialive.akamaized.net/hls/live/2012015/ddindia/index.m3u8"
    ]
  },
  {
    id: "dd-sports",
    name: "DD Sports Live",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b2/DD_Sports_logo_2022.svg",
    url: "https://ddsportslive.akamaized.net/hls/live/2012012/ddsports/master.m3u8",
    category: "sports",
    country: "in",
    countryName: "India",
    language: "Hindi",
    isFeatured: true,
    alternateUrls: [
      "https://ddsportslive.akamaized.net/hls/live/2012012/ddsports/master.m3u8",
      "https://ddsportslive.akamaized.net/hls/live/2012012/ddsports/index.m3u8"
    ]
  },
  {
    id: "sansad-tv",
    name: "Sansad TV Parliament",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/46/Sansad_TV_logo.png",
    url: "https://sansadservices.nic.in/hls/lslive/master.m3u8",
    category: "general",
    country: "in",
    countryName: "India",
    language: "English",
    isFeatured: false
  },
  {
    id: "dunya-news",
    name: "Dunya News Pakistan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Dunya_News_Logo.png",
    url: "https://live.dunyanews.tv/dunyanews/master.m3u8",
    category: "news",
    country: "pk",
    countryName: "Pakistan",
    language: "Urdu",
    isFeatured: true
  },
  {
    id: "hum-news",
    name: "Hum News Pakistan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/HUM_News_HD_logo.png",
    url: "https://humnews.akamaized.net/hls/live/2043032/humnews/master.m3u8",
    category: "news",
    country: "pk",
    countryName: "Pakistan",
    language: "Urdu",
    isFeatured: false
  },
  {
    id: "al-jazeera-eng",
    name: "Al Jazeera English",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Al_Jazeera_English_logo.svg",
    url: "https://live-hls-web-aje.getaj.net/AJE/03.m3u8",
    category: "news",
    country: "qa",
    countryName: "Qatar",
    language: "English",
    isFeatured: true,
    alternateUrls: [
      "https://live-hls-web-aje.getaj.net/AJE/03.m3u8",
      "https://live-hls-web-aje.getaj.net/AJE/01.m3u8",
      "https://live-hls-web-aje.getaj.net/AJE/02.m3u8"
    ]
  },
  {
    id: "sky-news-uk",
    name: "Sky News LIVE",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Sky_News_2020.svg",
    url: "https://skynews-live.akamaized.net/hls/live/2014023/skynews/master.m3u8",
    category: "news",
    country: "gb",
    countryName: "United Kingdom",
    language: "English",
    isFeatured: true,
    alternateUrls: [
      "https://skynews-live.akamaized.net/hls/live/2014023/skynews/master.m3u8",
      "https://skynews-live.akamaized.net/hls/live/2014023/skynews/index.m3u8"
    ]
  },
  {
    id: "redbull-tv",
    name: "Red Bull TV",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Red_Bull_TV_logo_%28201x%29.svg",
    url: "https://rbmn-live.akamaized.net/hls/live/2016507/sports/master.m3u8",
    category: "sports",
    country: "at",
    countryName: "Austria",
    language: "English",
    isFeatured: true
  },
  {
    id: "france24-eng",
    name: "France 24 English",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c7/France_24_logo.svg",
    url: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8",
    category: "news",
    country: "fr",
    countryName: "France",
    language: "English",
    isFeatured: false
  },
  {
    id: "nasa-tv",
    name: "NASA Public TV",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo_vertical_bar.svg",
    url: "https://ntv-ntv1.akamaized.net/hls/live/2016487/NASA-NTV1-HLS/master.m3u8",
    category: "documentary",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: true,
    alternateUrls: [
      "https://ntv-ntv1.akamaized.net/hls/live/2016487/NASA-NTV1-HLS/master.m3u8",
      "https://ntv-ntv1.akamaized.net/hls/live/2016487/NASA-NTV1-HLS/index.m3u8"
    ]
  },
  {
    id: "dw-english",
    name: "DW News English",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Deutsche_Welle_logo_2012.svg",
    url: "https://dwstream72-lh.akamaihd.net/i/dwtv_eng@305847/master.m3u8",
    category: "news",
    country: "de",
    countryName: "Germany",
    language: "English",
    isFeatured: false
  },
  {
    id: "trt-world",
    name: "TRT World News",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/TRT_World_logo_2024.svg",
    url: "https://tv-trtworld.medya.trt.com.tr/master.m3u8",
    category: "news",
    country: "tr",
    countryName: "Turkey",
    language: "English",
    isFeatured: false,
    alternateUrls: [
      "https://tv-trtworld.medya.trt.com.tr/master.m3u8",
      "https://trtworld.live.ascdn.com/trtworld/trtworld_1.m3u8"
    ]
  },
  {
    id: "nhk-world-japan",
    name: "NHK World Japan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/NHK_World_logo.svg",
    url: "https://nhkworld.akamaized.net/hls/live/2116228/nhkworld-eng_high/index.m3u8",
    category: "news",
    country: "jp",
    countryName: "Japan",
    language: "English",
    isFeatured: true,
    alternateUrls: [
      "https://nhkworld.akamaized.net/hls/live/2116228/nhkworld-eng_high/index.m3u8",
      "https://nhkworld.akamaized.net/hls/live/2116228/nhkworld-eng_mid/index.m3u8"
    ]
  },
  {
    id: "rai-news-24",
    name: "Rai News 24 Italia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/da/Rai_News_24_-_Logo_2022.svg",
    url: "https://rainews1-live.akamaized.net/hls/live/598370/rainews1/rainews24.m3u8",
    category: "news",
    country: "it",
    countryName: "Italy",
    language: "Italian",
    isFeatured: false
  },
  {
    id: "kids-disney-channel",
    name: "Disney Channel Hits & Animations",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Disney_Channel_logo.svg",
    url: "https://linear-121.pluto.tv/v1/channel/5cf1746270bdeb8ef5c07ba0/index.m3u8",
    category: "cartoons",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: true
  },
  {
    id: "kids-nickelodeon",
    name: "Nickelodeon TV Classics",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/Nickelodeon_2009_logo.svg",
    url: "https://linear-249.pluto.tv/v1/channel/5c8aa4da7fa62000085d5ca0/index.m3u8",
    category: "cartoons",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: true
  },
  {
    id: "kids-retro-toons",
    name: "Cartoon Network Classic Toons",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Cartoon_Network_2010_logo.svg",
    url: "https://linear-165.pluto.tv/v1/channel/5dcaeb3889dbf50009695d7e/index.m3u8",
    category: "cartoons",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: true
  },
  {
    id: "kids-classic-anime",
    name: "Retro Anime Arena (Classic Series)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Anime_Network_Logo.svg",
    url: "https://linear-246.pluto.tv/v1/channel/5fa01be7a1f5a5000784dddf/index.m3u8",
    category: "cartoons",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: false
  },
  {
    id: "drama-hum-tv",
    name: "Hum TV Drama Live",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Hum_TV_Logo.png",
    url: "https://stream.hum.tv/live/humtv/playlist.m3u8",
    category: "drama",
    country: "pk",
    countryName: "Pakistan",
    language: "Urdu",
    isFeatured: true,
    alternateUrls: [
      "https://stream.hum.tv/live/humtv/playlist.m3u8",
      "https://live.arabiantv.org/humtv.m3u8"
    ]
  },
  {
    id: "drama-geo-kahani",
    name: "Geo Kahani Drama Pakistan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Geo_Kahani_logo.png",
    url: "https://edge-mct-01.nayatel.com/live/geokahani/playlist.m3u8",
    category: "drama",
    country: "pk",
    countryName: "Pakistan",
    language: "Urdu",
    isFeatured: true,
    alternateUrls: [
      "https://edge-mct-01.nayatel.com/live/geokahani/playlist.m3u8",
      "https://live.arabiantv.org/geokahani.m3u8"
    ]
  },
  {
    id: "drama-ary-digital",
    name: "ARY Digital Premium Drama",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/ARY_Digital_logo.png",
    url: "https://edge-mct-01.nayatel.com/live/arydigital/playlist.m3u8",
    category: "drama",
    country: "pk",
    countryName: "Pakistan",
    language: "Urdu",
    isFeatured: true,
    alternateUrls: [
      "https://edge-mct-01.nayatel.com/live/arydigital/playlist.m3u8",
      "https://live.arabiantv.org/arydigital.m3u8"
    ]
  },
  {
    id: "drama-k-drama",
    name: "K-Drama Asian Series Central",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Pluto_TV_Logo.svg",
    url: "https://linear-380.pluto.tv/v1/channel/5eb2fc1a2a1b940007833de4/index.m3u8",
    category: "drama",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: false
  },
  {
    id: "drama-dr-who",
    name: "Classic Doctor Who Hub",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Doctor_Who_logo.svg",
    url: "https://linear-247.pluto.tv/v1/channel/5e836109f060f60007dca08f/index.m3u8",
    category: "drama",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: false
  },
  {
    id: "movies-spotlight-blockbusters",
    name: "Spotlight Blockbuster Cinema",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Cinema_film_strip.svg",
    url: "https://linear-109.pluto.tv/v1/channel/5500eccc989e22365a6f2cdb/index.m3u8",
    category: "movies",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: true
  },
  {
    id: "movies-classic-cinema",
    name: "Vintage Classic Movies Cinema",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Film_reel.svg",
    url: "https://linear-406.pluto.tv/v1/channel/5f85e4952d7e170007bad943/index.m3u8",
    category: "movies",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: false
  },
  {
    id: "movies-action-cult",
    name: "Adrenaline Action & Cult Cinema",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Aspect-ratio-16x9-symbol.svg",
    url: "https://linear-115.pluto.tv/v1/channel/5d094392f3922f28ae92daae/index.m3u8",
    category: "movies",
    country: "us",
    countryName: "United States",
    language: "English",
    isFeatured: false
  }
];

// Utility to match language code to name
export function getCountryFlag(code: string): string {
  const c = CHOSEN_COUNTRIES.find(country => country.code.toLowerCase() === code.toLowerCase());
  if (c && c.flag) return c.flag;
  
  // Standard unicode flags generation as backup
  try {
    const charCode0 = code.toUpperCase().charCodeAt(0) - 65 + 0x1F1E6;
    const charCode1 = code.toUpperCase().charCodeAt(1) - 65 + 0x1F1E6;
    return String.fromCodePoint(charCode0, charCode1);
  } catch {
    return "🌐";
  }
}
