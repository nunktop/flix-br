import React, { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { Movie, Genre } from '../types';
import { cn } from '../lib/utils';

export function Categories() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await tmdbService.getGenres();
      setGenres(res.genres);
      if (res.genres.length > 0) setSelectedGenre(res.genres[0].id);
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;
    const fetchByGenre = async () => {
      setLoading(true);
      try {
        const res = await tmdbService.getDiscover('movie', selectedGenre);
        setMovies(res.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchByGenre();
  }, [selectedGenre]);

  return (
    <div className="pt-24 px-4 md:px-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">Categorias</h1>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedGenre === genre.id 
                ? "bg-netflix-red text-white" 
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-video-netflix bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
