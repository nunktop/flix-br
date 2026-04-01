import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, ShieldCheck, LogOut, User as UserIcon, Star } from 'lucide-react';

export function Profile() {
  const { user, logout, updateUserPlan, isPremium } = useAuth();

  const handleUpgrade = () => {
    // Simulated payment approval
    if (window.confirm('Simular pagamento aprovado?')) {
      updateUserPlan(user!.id, 'premium');
    }
  };

  return (
    <div className="pt-24 px-4 md:px-12 pb-20 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Conta</h1>

      <div className="grid gap-6">
        {/* User Info */}
        <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-netflix-red rounded-lg flex items-center justify-center text-2xl font-bold">
              {user?.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        {/* Subscription */}
        <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-netflix-red" />
              <h2 className="text-xl font-bold">Assinatura</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isPremium ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
              Plano {user?.plan === 'premium' ? 'Premium' : 'Grátis'}
            </span>
          </div>

          {!isPremium ? (
            <div className="bg-black/40 p-6 rounded-lg border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Vire Premium hoje!</h3>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Star size={14} className="text-yellow-500" /> Acesso ilimitado a todos os filmes e séries</li>
                <li className="flex items-center gap-2"><Star size={14} className="text-yellow-500" /> Continuar assistindo de onde parou</li>
                <li className="flex items-center gap-2"><Star size={14} className="text-yellow-500" /> Qualidade Ultra HD</li>
              </ul>
              <button 
                onClick={handleUpgrade}
                className="w-full py-3 bg-netflix-red rounded font-bold hover:bg-red-700 transition-all"
              >
                Assinar Premium - R$ 29,90/mês
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-500">
              <ShieldCheck size={20} />
              <p className="font-medium">Sua assinatura está ativa e protegida.</p>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Configurações</h2>
          <div className="space-y-4">
            <button className="w-full text-left py-2 text-gray-400 hover:text-white transition-colors border-b border-gray-800">Alterar senha</button>
            <button className="w-full text-left py-2 text-gray-400 hover:text-white transition-colors border-b border-gray-800">Gerenciar perfis</button>
            <button className="w-full text-left py-2 text-gray-400 hover:text-white transition-colors">Privacidade e segurança</button>
          </div>
        </div>
      </div>
    </div>
  );
}
