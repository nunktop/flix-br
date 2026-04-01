import React from 'react';
import { MovieCard } from './MovieCard';
import { Movie } from '../types';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLarge?: boolean;
}

export function MovieRow({ title, movies, isLarge }: MovieRowProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-8 px-4 md:px-12">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-white/90">{title}</h2>
      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 no-scrollbar">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} isLarge={isLarge} />
        ))}
      </div>
    </div>
  );
}
