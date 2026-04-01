import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar, ChevronLeft } from 'lucide-react';
import { tmdbService, ORIGINAL_IMAGE_BASE_URL, IMAGE_BASE_URL } from '../services/tmdb';
import { Movie, Cast } from '../types';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { MovieRow } from '../components/MovieRow';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function MovieDetails() {
  const { type, id } = useParams<{ type: string, id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const { isPremium } = useAuth();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !type) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [details, credits, recs] = await Promise.all([
          tmdbService.getDetails(type as any, parseInt(id)),
          tmdbService.getCredits(type as any, parseInt(id)),
          tmdbService.getRecommendations(type as any, parseInt(id))
        ]);
        setMovie(details);
        setCast(credits.cast.slice(0, 10));
        setRecommendations(recs.results);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, type]);

  if (loading) {
    return (
      <div className="pt-24 px-4 md:px-12 animate-pulse">
        <div className="h-[60vh] bg-gray-900 rounded-xl mb-8" />
        <div className="h-8 w-64 bg-gray-900 rounded mb-4" />
        <div className="h-4 w-full bg-gray-900 rounded mb-2" />
        <div className="h-4 w-full bg-gray-900 rounded mb-2" />
      </div>
    );
  }

  if (!movie) return null;

  const favorite = isFavorite(movie.id);
  const releaseDate = movie.release_date || movie.first_air_date;
  const runtime = movie.runtime || (movie.episode_run_time ? movie.episode_run_time[0] : null);

  const handlePlay = () => {
    navigate(`/player/${type}/${id}`);
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full">
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

        <button 
          onClick={() => navigate(-1)}
          className="absolute top-24 left-4 md:left-12 z-30 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="absolute bottom-[10%] left-4 md:left-12 max-w-3xl z-20">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            {movie.title || movie.name}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm md:text-base text-gray-300">
            <div className="flex items-center gap-1 text-green-500 font-bold">
              <Star size={16} fill="currentColor" />
              {movie.vote_average?.toFixed(1)}
            </div>
            {releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(releaseDate).getFullYear()}
              </div>
            )}
            {runtime && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {runtime} min
              </div>
            )}
            <span className="border border-gray-600 px-2 py-0.5 rounded text-xs uppercase">
              {type === 'tv' ? 'Série' : 'Filme'}
            </span>
          </div>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-200 mb-8 line-clamp-4 md:line-clamp-none text-lg leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={handlePlay}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded font-bold hover:bg-white/80 transition-colors"
            >
              <Play size={24} fill="currentColor" /> Assistir Agora
            </button>
            <button 
              onClick={() => toggleFavorite(movie)}
              className="flex items-center gap-2 px-8 py-3 bg-gray-500/50 text-white rounded font-bold hover:bg-gray-500/40 transition-colors"
            >
              {favorite ? <Check size={24} /> : <Plus size={24} />}
              {favorite ? 'Na Minha Lista' : 'Minha Lista'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="px-4 md:px-12 mt-12">
        <h2 className="text-2xl font-bold mb-6">Elenco Principal</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {cast.map(person => (
            <div key={person.id} className="flex-none w-24 md:w-32 text-center">
              <div className="aspect-[2/3] mb-2 rounded-lg overflow-hidden bg-gray-800">
                {person.profile_path ? (
                  <img
                    src={`${IMAGE_BASE_URL}${person.profile_path}`}
                    alt={person.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    N/A
                  </div>
                )}
              </div>
              <p className="text-xs font-bold line-clamp-1">{person.name}</p>
              <p className="text-[10px] text-gray-500 line-clamp-1">{person.character}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-12">
        {recommendations.length > 0 && (
          <MovieRow title="Títulos Semelhantes" movies={recommendations} />
        )}
      </div>
    </div>
  );
}
