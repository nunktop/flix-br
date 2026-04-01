import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Buscar', path: '/search', icon: Search },
    { name: 'Favoritos', path: '/favorites', icon: Heart },
    { name: 'Perfil', path: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-netflix-black/95 border-t border-gray-800 px-6 py-3 flex items-center justify-between z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-white" : "text-gray-500"
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] uppercase font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
