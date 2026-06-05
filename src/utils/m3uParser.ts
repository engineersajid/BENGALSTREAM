import { Channel } from "../types";

/**
 * Fetches an M3U playlist from a URL and parses it into structured Channel objects.
 * Uses robust line-by-line parsing with regex matching for extended metadata attributes.
 */
export async function parseM3UFromURL(url: string, countryCode: string = "all"): Promise<Channel[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second safety timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load M3U playlist: ${response.statusText}`);
    }

    const text = await response.text();
    return parseM3UText(text, countryCode);
  } catch (error) {
    console.error("M3U Fetch and Parse Error: ", error);
    return [];
  }
}

/**
 * Parses raw M3U text content.
 */
export function parseM3UText(text: string, defaultCountry: string = "all"): Channel[] {
  const channels: Channel[] = [];
  const lines = text.split(/\r?\n/);
  
  let currentInfo: {
    id?: string;
    name?: string;
    logo?: string;
    category?: string;
    language?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Line with EXTINF metadata attributes
    if (line.startsWith("#EXTINF:")) {
      currentInfo = {};

      // 1. Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/) || line.match(/logo="([^"]+)"/);
      if (logoMatch) {
        currentInfo.logo = logoMatch[1];
      }

      // 2. Extract tvg-id
      const idMatch = line.match(/tvg-id="([^"]+)"/) || line.match(/id="([^"]+)"/);
      if (idMatch) {
        currentInfo.id = idMatch[1];
      }

      // 3. Extract group-title as category
      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch) {
        currentInfo.category = groupMatch[1].trim().toLowerCase();
      }

      // 4. Extract tvg-language or language
      const langMatch = line.match(/tvg-language="([^"]+)"/) || line.match(/language="([^"]+)"/);
      if (langMatch) {
        currentInfo.language = langMatch[1];
      }

      // 5. Extract display name (after the final comma of the line)
      const commaIndex = line.lastIndexOf(",");
      if (commaIndex !== -1) {
        currentInfo.name = line.substring(commaIndex + 1).trim();
      }
    } 
    // Line with stream URL (not a comment, starting with http/https)
    else if (line.startsWith("http://") || line.startsWith("https://")) {
      if (currentInfo) {
        const id = currentInfo.id || `channel-${Math.random().toString(36).substring(2, 11)}`;
        const name = currentInfo.name || id.replace(/[_\-\.]/g, " ");
        const logo = currentInfo.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;
        
        // Dynamic category classification
        let category = "general";
        const groupNormalized = currentInfo.category?.toLowerCase() || "";
        
        if (groupNormalized.includes("news")) {
          category = "news";
        } else if (groupNormalized.includes("sport")) {
          category = "sports";
        } else if (groupNormalized.includes("music")) {
          category = "music";
        } else if (groupNormalized.includes("movi") || groupNormalized.includes("film") || groupNormalized.includes("cinem")) {
          category = "movies";
        } else if (groupNormalized.includes("kid") || groupNormalized.includes("toon") || groupNormalized.includes("anim")) {
          category = "cartoons";
        } else if (groupNormalized.includes("document") || groupNormalized.includes("edu") || groupNormalized.includes("sci")) {
          category = "documentary";
        } else if (groupNormalized.includes("relig") || groupNormalized.includes("mosq") || groupNormalized.includes("church") || groupNormalized.includes("islam")) {
          category = "religious";
        } else if (groupNormalized.includes("entert") || groupNormalized.includes("drama") || groupNormalized.includes("show") || groupNormalized.includes("series")) {
          category = "drama";
        }

        const country = defaultCountry !== "all" 
          ? defaultCountry.toLowerCase() 
          : extractCountryFromId(id);

        channels.push({
          id,
          name,
          logo,
          url: line,
          category,
          country,
          language: currentInfo.language || (defaultCountry === "bd" ? "Bengali" : "English")
        });
        
        // Reset current info block
        currentInfo = null;
      }
    }
  }

  // Remove exact duplicates by URL
  const seenUrls = new Set<string>();
  return channels.filter(channel => {
    if (seenUrls.has(channel.url)) return false;
    seenUrls.add(channel.url);
    return true;
  });
}

/**
 * Heuristics to estimate country code from the tvg-id string.
 * Example of tvg-id format: 'Aaryajanpath.in' or 'DeeptoTV.bd' or 'SomoyTV.bd'
 */
function extractCountryFromId(id: string): string {
  const dotIndex = id.lastIndexOf(".");
  if (dotIndex !== -1 && dotIndex < id.length - 1) {
    const code = id.substring(dotIndex + 1).toLowerCase();
    if (code.length === 2) {
      return code;
    }
  }
  return "us"; // Default US
}
