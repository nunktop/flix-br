import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info, Volume2, VolumeX } from 'lucide-react';
import { Movie } from '../types';
import { useApp } from '../contexts/AppContext';
import { tmdbService, IMAGE_BASE_URL, ORIGINAL_IMAGE_BASE_URL } from '../services/tmdb';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MovieCardProps {
  movie: Movie;
  isLarge?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, isLarge }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  
  const favorite = isFavorite(movie.id);
  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');

  useEffect(() => {
    if (isHovered && !trailerKey) {
      const fetchTrailer = async () => {
        try {
          const res = await tmdbService.getVideos(mediaType as any, movie.id);
          const trailer = res.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          if (trailer) setTrailerKey(trailer.key);
        } catch (error) {
          console.error('Error fetching trailer:', error);
        }
      };
      fetchTrailer();
    }

    if (isHovered) {
      hoverTimer.current = setTimeout(() => {
        setShowTrailer(true);
      }, 800);
    } else {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setShowTrailer(false);
    }

    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, [isHovered, movie.id, mediaType, trailerKey]);

  const handleClick = () => {
    navigate(`/details/${mediaType}/${movie.id}`);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/player/${mediaType}/${movie.id}`);
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.15, 
        zIndex: 50,
        transition: { duration: 0.3 }
      }}
      className={cn(
        "relative flex-none cursor-pointer group transition-all duration-300",
        isLarge ? "w-40 md:w-64" : "w-32 md:w-48 lg:w-56"
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] md:aspect-video overflow-hidden rounded-md shadow-lg bg-netflix-dark">
        <img
          src={`${isLarge ? ORIGINAL_IMAGE_BASE_URL : IMAGE_BASE_URL}${isLarge ? movie.poster_path : (movie.backdrop_path || movie.poster_path)}`}
          alt={movie.title || movie.name}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            showTrailer && trailerKey ? "opacity-0" : "opacity-100"
          )}
          referrerPolicy="no-referrer"
        />

        <AnimatePresence>
          {showTrailer && trailerKey && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1`}
                className="w-full h-full pointer-events-none scale-[1.5]"
                allow="autoplay; encrypted-media"
                title="Trailer Preview"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 flex flex-col justify-end p-3 z-20",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <h3 className="text-xs md:text-sm font-bold truncate mb-2 drop-shadow-md">
            {movie.title || movie.name}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
              onClick={handlePlay}
            >
              <Play size={14} fill="currentColor" />
            </button>
            <button 
              className="w-8 h-8 bg-gray-800/80 rounded-full flex items-center justify-center text-white border border-gray-600 hover:border-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(movie);
              }}
            >
              {favorite ? <Check size={14} className="text-green-500" /> : <Plus size={14} />}
            </button>
            <div className="ml-auto flex items-center gap-2">
               <span className="text-[10px] font-bold border border-gray-500 px-1 rounded text-gray-300">
                 {movie.vote_average?.toFixed(1)}
               </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
