export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Episode {
  title: string;
  videoUrl: string;
  episodeNumber: number;
  duration?: number;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  genre: string[];
  releaseYear?: number;
  isFeatured?: boolean;
  isSeries?: boolean;
  episodes?: Episode[];
  views?: number;
  createdAt?: string;
}

export interface WatchEntry {
  movieId: Movie | string;
  progress: number;
  duration: number;
  episodeIndex: number | null;
  updatedAt: string;
  movie?: Movie;
}
