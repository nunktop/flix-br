import React from 'react';
import { useApp } from '../contexts/AppContext';
import { MovieCard } from '../components/MovieCard';

export function Favorites() {
  const { favorites } = useApp();

  return (
    <div className="pt-24 px-4 md:px-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">Minha Lista</h1>
      
      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {favorites.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          Você ainda não adicionou nada à sua lista.
        </div>
      )}
    </div>
  );
}
