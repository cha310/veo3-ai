export interface Video {
  id: string;
  creator: string;
  videoUrl: string;
  category: string;
  embedUrl?: string;
}

export type VideoCategory = 'all' | 'animation' | 'product' | 'movie' | 'talk show' | 'other';