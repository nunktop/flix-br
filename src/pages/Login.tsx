import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, X, Check, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { login, register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const sharedUrl = window.location.origin.replace('ais-dev-', 'ais-pre-');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const isDevUrl = window.location.origin.includes('ais-dev-');

  const formatError = (err: any) => {
    if (!err) return 'Ocorreu um erro inesperado.';
    const code = err.code || '';
    let message = err.message || 'Ocorreu um erro inesperado.';
    
    // Handle Firestore JSON error
    try {
      const parsed = JSON.parse(message);
      if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
        return 'Erro de permissão no banco de dados. Verifique se você está logado com a conta correta.';
      }
    } catch (e) {
      // Not a JSON error
    }

    if (code === 'auth/operation-not-allowed') {
      return 'O login por e-mail/senha está desativado no Firebase. Por favor, use o botão "Entrar com Google" abaixo.';
    }

    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'E-mail ou senha incorretos.';
    }

    if (code === 'auth/email-already-in-use') {
      return 'Este e-mail já está em uso.';
    }

    if (code === 'auth/weak-password') {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (code === 'auth/invalid-email') {
      return 'E-mail inválido.';
    }

    if (code === 'auth/popup-closed-by-user') {
      return 'O login foi cancelado. Tente novamente.';
    }

    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
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
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) navigate('/');
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setLoading(false);
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
        
        {isDevUrl && (
          <div className="mb-6 p-4 bg-yellow-900/40 border border-yellow-700/50 rounded-lg text-xs text-yellow-500">
            <p className="font-bold mb-1 uppercase">Aviso de Desenvolvedor:</p>
            <p>Você está acessando o link de desenvolvimento. Se estiver no celular, use o link que começa com <strong>ais-pre-</strong> para evitar erros de acesso.</p>
          </div>
        )}

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
            disabled={loading}
            className="w-full py-4 bg-netflix-red text-white font-bold rounded hover:bg-red-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : (isRegister ? 'Cadastrar' : 'Entrar')}
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
            disabled={loading}
            className="w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            {loading ? 'Carregando...' : 'Entrar com Google'}
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
              {isRegister ? 'Já tenho conta' : 'Criar conta'}
            </button>
          </p>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <button 
              onClick={() => setShowMobileQR(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mx-auto"
            >
              <Smartphone size={16} />
              Acessar pelo Celular
            </button>
          </div>

          <p className="text-xs mt-4">Esta página é protegida pelo Google reCAPTCHA para garantir que você não é um robô. <span className="text-blue-500 hover:underline cursor-pointer">Saiba mais.</span></p>
        </div>
      </div>

      {/* Mobile Access Modal */}
      {showMobileQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-netflix-dark w-full max-w-md rounded-2xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-netflix-red"></div>
            
            <button 
              onClick={() => setShowMobileQR(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-netflix-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone size={24} className="text-netflix-red" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Acesso Mobile</h2>
              <p className="text-sm text-gray-400 mb-6">Escaneie para assistir no seu celular</p>

              <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-xl">
                <QRCodeSVG 
                  value={sharedUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-4 text-left">
                <div className="p-4 bg-black/40 rounded-lg border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Link de Visualização</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-900 p-2 rounded border border-gray-700 font-mono text-[10px] break-all text-netflix-red overflow-hidden">
                      {sharedUrl}
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className="p-2 bg-netflix-red rounded hover:bg-red-700 transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/10 rounded-lg border border-yellow-700/20">
                  <p className="text-[10px] text-yellow-500 font-bold mb-1 uppercase">Aviso Importante:</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Se encontrar erro 403, certifique-se de estar logado na sua conta Google no navegador do celular.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
