const API_KEY = '3b215855a4f169f976bbf143c4558d17';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const ORIGINAL_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

async function fetchFromTMDb(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'pt-BR',
    ...params,
  });
  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch from TMDb');
  return response.json();
}

export const tmdbService = {
  getTrending: (type: 'all' | 'movie' | 'tv' = 'all') => fetchFromTMDb(`/trending/${type}/week`),
  getPopular: (type: 'movie' | 'tv' = 'movie') => fetchFromTMDb(`/${type}/popular`),
  getTopRated: (type: 'movie' | 'tv' = 'movie') => fetchFromTMDb(`/${type}/top_rated`),
  getGenres: (type: 'movie' | 'tv' = 'movie') => fetchFromTMDb(`/genre/${type}/list`),
  getDiscover: (type: 'movie' | 'tv', genreId?: number) => 
    fetchFromTMDb(`/discover/${type}`, genreId ? { with_genres: genreId.toString() } : {}),
  search: (query: string) => fetchFromTMDb('/search/multi', { query }),
  getDetails: (type: 'movie' | 'tv', id: number) => fetchFromTMDb(`/${type}/${id}`),
  getVideos: (type: 'movie' | 'tv', id: number) => fetchFromTMDb(`/${type}/${id}/videos`),
  getCredits: (type: 'movie' | 'tv', id: number) => fetchFromTMDb(`/${type}/${id}/credits`),
  getRecommendations: (type: 'movie' | 'tv', id: number) => fetchFromTMDb(`/${type}/${id}/recommendations`),
};
