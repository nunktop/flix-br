import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

export function Player() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const { saveProgress, progress } = useApp();
  const { isPremium } = useAuth();

  useEffect(() => {
    if (!id || !type) return;
    
    // Check access
    if (!isPremium) {
      navigate('/profile');
      return;
    }

    const fetchDetails = async () => {
      const res = await tmdbService.getDetails(type, parseInt(id));
      setContent(res);
      
      // Load saved progress
      const saved = progress.find(p => p.id === parseInt(id));
      if (saved && saved.type === 'tv') {
        setSeason(saved.season || 1);
        setEpisode(saved.episode || 1);
      }
    };
    fetchDetails();
  }, [id, type]);

  useEffect(() => {
    if (!id || !type) return;
    saveProgress({
      id: parseInt(id),
      type,
      season: type === 'tv' ? season : undefined,
      episode: type === 'tv' ? episode : undefined,
      timestamp: Date.now()
    });
  }, [season, episode]);

  const embedUrl = type === 'movie'
    ? `https://myembed.biz/filme/${id}`
    : `https://myembed.biz/serie/${id}/${season}/${episode}`;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-netflix-red transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="font-bold hidden md:inline">Voltar</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-lg md:text-xl font-bold truncate max-w-[200px] md:max-w-md">
            {content?.title || content?.name}
          </h1>
          {type === 'tv' && (
            <p className="text-xs text-gray-400">
              Temporada {season}, Episódio {episode}
            </p>
          )}
        </div>
        
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="flex-1 relative">
        <iframe
          src={embedUrl}
          className="w-full h-full border-none"
          allowFullScreen
          title="Video Player"
        />
      </div>

      {type === 'tv' && (
        <div className="bg-netflix-black p-4 flex items-center justify-center gap-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Temporada</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={season <= 1}
                onClick={() => { setSeason(s => s - 1); setEpisode(1); }}
                className="p-1 hover:bg-gray-800 rounded disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="w-8 text-center">{season}</span>
              <button 
                onClick={() => { setSeason(s => s + 1); setEpisode(1); }}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Episódio</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={episode <= 1}
                onClick={() => setEpisode(e => e - 1)}
                className="p-1 hover:bg-gray-800 rounded disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="w-8 text-center">{episode}</span>
              <button 
                onClick={() => setEpisode(e => e + 1)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
