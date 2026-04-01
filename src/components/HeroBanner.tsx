import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { Movie } from '../types';
import { ORIGINAL_IMAGE_BASE_URL } from '../services/tmdb';

interface HeroBannerProps {
  movie: Movie;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  const navigate = useNavigate();

  const handlePlay = () => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/player/${type}/${movie.id}`);
  };

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full">
      <div className="absolute inset-0">
        <img
          src={`${ORIGINAL_IMAGE_BASE_URL}${movie.backdrop_path}`}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t-netflix" />
        <div className="absolute inset-0 bg-gradient-to-b-netflix" />
      </div>

      <div className="absolute bottom-[15%] left-4 md:left-12 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow-lg">
          {movie.title || movie.name}
        </h1>
        <p className="text-sm md:text-lg text-gray-200 mb-6 line-clamp-3 text-shadow-lg">
          {movie.overview}
        </p>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePlay}
            className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 bg-white text-black rounded font-bold hover:bg-white/80 transition-colors"
          >
            <Play size={24} fill="currentColor" /> Assistir
          </button>
          <button className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 bg-gray-500/50 text-white rounded font-bold hover:bg-gray-500/40 transition-colors">
            <Info size={24} /> Mais Informações
          </button>
        </div>
      </div>
    </div>
  );
}
