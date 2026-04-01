import React, { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';

export function Series() {
  const [series, setSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await tmdbService.getDiscover('tv');
        setSeries(res.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  return (
    <div className="pt-24 px-4 md:px-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">Séries</h1>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
            <div key={i} className="aspect-video-netflix bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {series.map(item => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
}
