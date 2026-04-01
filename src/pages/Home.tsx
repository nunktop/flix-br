import React, { useState, useEffect, useCallback } from 'react';
import { tmdbService } from '../services/tmdb';
import { HeroCarousel } from '../components/HeroCarousel';
import { MovieRow } from '../components/MovieRow';
import { MovieRowSkeleton } from '../components/Skeleton';
import { Movie, ContentProgress } from '../types';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularSeries, setPopularSeries] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { manualContent, pinnedContentId, progress } = useApp();
  const { isPremium } = useAuth();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [trendingRes, popularMoviesRes, popularSeriesRes, topRatedRes] = await Promise.all([
        tmdbService.getTrending(),
        tmdbService.getPopular('movie'),
        tmdbService.getPopular('tv'),
        tmdbService.getTopRated('movie'),
      ]);

      setTrending(trendingRes.results);
      setPopularMovies(popularMoviesRes.results);
      setPopularSeries(popularSeriesRes.results);
      setTopRated(topRatedRes.results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get top 5 trending movies for the carousel
  const carouselMovies = trending.slice(0, 5);
  
  // If there's a pinned movie, put it first in the carousel
  const pinnedMovie = pinnedContentId ? manualContent.find(m => m.id === pinnedContentId) : null;
  const finalCarouselMovies = pinnedMovie 
    ? [pinnedMovie, ...carouselMovies.filter(m => m.id !== pinnedMovie.id)].slice(0, 5)
    : carouselMovies;

  // Continue watching logic
  const [continueWatchingMovies, setContinueWatchingMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (!isPremium || progress.length === 0) return;
    
    const fetchProgressMovies = async () => {
      const movies = await Promise.all(
        progress.map(p => tmdbService.getDetails(p.type, p.id))
      );
      setContinueWatchingMovies(movies);
    };
    fetchProgressMovies();
  }, [isPremium, progress]);

  if (loading) {
    return (
      <div className="pt-20">
        <div className="h-[70vh] bg-gray-900 animate-pulse mb-8" />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {finalCarouselMovies.length > 0 && <HeroCarousel movies={finalCarouselMovies} />}
      
      <div className="relative z-10 -mt-20 md:-mt-32">
        <div className="flex justify-end px-4 md:px-12 mb-4">
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className={cn(
              "flex items-center gap-2 px-3 py-1 bg-black/40 border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white transition-all",
              refreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
            {refreshing ? 'Atualizando...' : 'Sincronizar Catálogo'}
          </button>
        </div>

        {isPremium && continueWatchingMovies.length > 0 && (
          <MovieRow title="Continuar Assistindo" movies={continueWatchingMovies} />
        )}
        {manualContent.length > 0 && (
          <MovieRow title="Adicionados Recentemente" movies={manualContent} />
        )}
        <MovieRow title="Em Alta" movies={trending} />
        <MovieRow title="Filmes Populares" movies={popularMovies} />
        <MovieRow title="Séries Populares" movies={popularSeries} />
        <MovieRow title="Top Avaliados" movies={topRated} />
      </div>
    </div>
  );
}
