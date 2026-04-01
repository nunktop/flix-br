export type UserPlan = 'free' | 'premium';
export interface Genre {
  id: number;
  name: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: number;
}

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
  runtime?: number;
  episode_run_time?: number[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface ContentProgress {
  id: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  timestamp: number;
}
