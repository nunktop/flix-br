import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Movie } from '../types';
import { tmdbService, ORIGINAL_IMAGE_BASE_URL } from '../services/tmdb';
import { motion, AnimatePresence } from 'motion/react';

interface HeroCarouselProps {
  movies: Movie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const navigate = useNavigate();
  const trailerTimer = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 15000); // Increased time for trailer
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    const currentMovie = movies[currentIndex];
    const mediaType = currentMovie.media_type || (currentMovie.first_air_date ? 'tv' : 'movie');
    
    setTrailerKey(null);
    setShowTrailer(false);

    const fetchTrailer = async () => {
      try {
        const res = await tmdbService.getVideos(mediaType as any, currentMovie.id);
        const trailer = res.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
          setTrailerKey(trailer.key);
          trailerTimer.current = setTimeout(() => {
            setShowTrailer(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching hero trailer:', error);
      }
    };

    fetchTrailer();

    return () => {
      if (trailerTimer.current) clearTimeout(trailerTimer.current);
    };
  }, [currentIndex, movies]);

  const handlePlay = (movie: Movie) => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/player/${type}/${movie.id}`);
  };

  const handleInfo = (movie: Movie) => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/details/${type}/${movie.id}`);
  };

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 }
          }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <img
              src={`${ORIGINAL_IMAGE_BASE_URL}${currentMovie.backdrop_path}`}
              alt={currentMovie.title || currentMovie.name}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${showTrailer ? 'opacity-0' : 'opacity-100'}`}
              referrerPolicy="no-referrer"
            />
            
            {showTrailer && trailerKey && (
              <div className="absolute inset-0 z-0">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1&iv_load_policy=3`}
                  className="w-full h-full pointer-events-none scale-[1.35] md:scale-[1.15]"
                  allow="autoplay; encrypted-media"
                  title="Hero Trailer"
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t-netflix z-10" />
            <div className="absolute inset-0 bg-gradient-to-b-netflix z-10" />
          </div>

          <div className="absolute bottom-[20%] left-4 md:left-12 max-w-2xl z-20">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={`title-${currentIndex}`}
              className="text-4xl md:text-7xl font-bold mb-4 text-shadow-lg"
            >
              {currentMovie.title || currentMovie.name}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={`desc-${currentIndex}`}
              className="text-sm md:text-lg text-gray-200 mb-6 line-clamp-3 text-shadow-lg max-w-xl"
            >
              {currentMovie.overview}
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={`actions-${currentIndex}`}
              className="flex items-center gap-4"
            >
              <button 
                onClick={() => handlePlay(currentMovie)}
                className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 bg-white text-black rounded font-bold hover:bg-white/80 transition-colors"
              >
                <Play size={24} fill="currentColor" /> Assistir
              </button>
              <button 
                onClick={() => handleInfo(currentMovie)}
                className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 bg-gray-500/50 text-white rounded font-bold hover:bg-gray-500/40 transition-colors"
              >
                <Info size={24} /> Mais Informações
              </button>
              
              {showTrailer && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-2 rounded-full border border-gray-500 hover:bg-white/10 transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-10 right-12 z-30 flex gap-2">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-1 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-netflix-red' : 'w-4 bg-gray-500'}`}
          />
        ))}
      </div>
    </div>
  );
}
