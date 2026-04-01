import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegister) {
        const success = await register(name, email, password);
        if (success) {
          navigate('/');
        } else {
          setError('Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          navigate('/');
        } else {
          setError('E-mail ou senha incorretos.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const success = await loginWithGoogle();
      if (success) navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-07583f8b5632/84701340-62ee-49ad-970a-0ebe8d297172/BR-pt-20220502-popsignuptwoweeks-perspective_alpha_website_large.jpg"
          className="w-full h-full object-cover opacity-50"
          alt="background"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-16 bg-black/75 rounded-md">
        <h1 className="text-3xl font-bold mb-8">{isRegister ? 'Criar Conta' : 'Entrar'}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-orange-500 text-white p-3 rounded text-sm">
              {error}
            </div>
          )}
          
          {isRegister && (
            <div>
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
                required
              />
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-4 bg-netflix-red text-white font-bold rounded hover:bg-red-700 transition-colors mt-4"
          >
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <span className="relative px-4 bg-black/75 text-gray-400 text-sm">OU</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Entrar com Google
          </button>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 accent-netflix-red" />
              Lembrar de mim
            </label>
            <a href="#" className="hover:underline">Precisa de ajuda?</a>
          </div>
        </form>
        
        <div className="mt-12 text-gray-400">
          <p>
            {isRegister ? 'Já tem uma conta?' : 'Novo por aqui?'} 
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-white hover:underline ml-1"
            >
              {isRegister ? 'Entrar agora.' : 'Assine agora.'}
            </button>
          </p>
          <p className="text-xs mt-4">Esta página é protegida pelo Google reCAPTCHA para garantir que você não é um robô. <span className="text-blue-500 hover:underline cursor-pointer">Saiba mais.</span></p>
        </div>
      </div>
    </div>
  );
}
