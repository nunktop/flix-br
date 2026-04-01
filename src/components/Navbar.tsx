import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Filmes', path: '/movies' },
    { name: 'Séries', path: '/series' },
    { name: 'Categorias', path: '/categories' },
    { name: 'Favoritos', path: '/favorites' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-colors duration-300 px-4 md:px-12 py-4 flex items-center justify-between",
      isScrolled ? "bg-netflix-black" : "bg-gradient-to-b from-black/80 to-transparent"
    )}>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-netflix-red text-2xl md:text-3xl font-bold tracking-tighter">
          FLIX BR
        </Link>
        
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm transition-colors hover:text-netflix-gray",
                location.pathname === link.path ? "text-white font-bold" : "text-gray-300"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button onClick={() => navigate('/search')} className="text-white hover:text-gray-300 transition-colors">
          <Search size={20} />
        </button>
        <button className="hidden md:block text-white hover:text-gray-300 transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="group relative">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-netflix-red rounded flex items-center justify-center text-white font-bold text-xs">
              {user?.name[0].toUpperCase()}
            </div>
          </div>
          
          <div className="absolute right-0 top-full mt-2 w-56 bg-black/90 border border-gray-800 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
            <div className="px-4 py-2 border-b border-gray-800">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Plano {user?.plan === 'premium' ? 'Premium' : 'Grátis'}</p>
            </div>
            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 transition-colors">
              <User size={16} /> Perfil
            </Link>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 transition-colors text-left"
            >
              <LogOut size={16} /> Sair do Flix BR
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
