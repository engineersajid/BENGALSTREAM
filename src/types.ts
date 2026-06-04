export interface Channel {
  id: string;          // tvg-id or dynamic unique id
  name: string;        // Channel display name
  logo: string;        // URL to channel logo
  url: string;         // Stream URL (.m3u8, etc.)
  category: string;    // Parsed category (e.g. News, Sports, Entertainment)
  country: string;     // Country code (ISO 2-letter, e.g. bd, us, in)
  countryName?: string;// Human readable country name
  language?: string;   // Language name or code (e.g. Bengali)
  isFeatured?: boolean;// Highlighted as popular
  isFavorite?: boolean;// Locally favorited channel
}

export interface Country {
  code: string;        // 2-letter lowercase code
  name: string;        // Human readable name
  flag?: string;       // Unicode flag character or indicator
}

export interface Category {
  id: string;          // Lowercase identifier
  name: string;        // Capitalized display name
  emoji?: string;      // Related icon or emoji
}

export interface StreamStats {
  url: string;
  format: string;
  latency?: number;
  fps?: number;
  resolution?: string;
  protocol?: string;
}
