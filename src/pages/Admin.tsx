import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Pin, RefreshCcw, Users, LayoutDashboard, Film, CreditCard, ArrowUpCircle, ArrowDownCircle, X, QrCode, Smartphone, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { tmdbService, IMAGE_BASE_URL } from '../services/tmdb';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';
import { cn } from '../lib/utils';

export function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'subscriptions' | 'account' | 'mobile'>('dashboard');
  const [tmdbId, setTmdbId] = useState('');
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [copied, setCopied] = useState(false);
  
  // User creation state
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', plan: 'free' as 'free' | 'premium' });
  
  // User editing state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  
  const { 
    manualContent, 
    addManualContent, 
    removeManualContent, 
    pinnedContentId, 
    setPinnedContent,
    resetAllData 
  } = useApp();

  const { user, users, updateUserPlan, updateUserDetails, createUser, deleteUser } = useAuth();

  const sharedUrl = window.location.origin.replace('ais-dev-', 'ais-pre-');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Admin account update state
  const [adminDetails, setAdminDetails] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    password: user?.password || '' 
  });

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbId) return;

    setLoading(true);
    try {
      const data = await tmdbService.getDetails(contentType, parseInt(tmdbId));
      addManualContent({ ...data, media_type: contentType });
      setMessage({ text: 'Conteúdo adicionado com sucesso!', type: 'success' });
      setTmdbId('');
    } catch (error) {
      setMessage({ text: 'Erro ao buscar conteúdo. Verifique o ID.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage({ text: 'Preencha todos os campos.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const success = await createUser(newUser.name, newUser.email, newUser.password, 'user', newUser.plan);
      if (success) {
        setMessage({ text: 'Usuário criado com sucesso!', type: 'success' });
        setNewUser({ name: '', email: '', password: '', plan: 'free' });
      } else {
        setMessage({ text: 'Erro ao criar usuário. Verifique se o email já existe.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erro ao criar usuário no banco de dados.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleUpdateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    updateUserDetails(user.id, adminDetails);
    setMessage({ text: 'Dados atualizados com sucesso!', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    updateUserDetails(editingUser.id, editingUser);
    setMessage({ text: 'Usuário atualizado com sucesso!', type: 'success' });
    setEditingUser(null);
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const stats = {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.plan === 'premium').length,
    totalContent: manualContent.length + 50, // Simulated base content
  };

  return (
    <div className="pt-24 px-4 md:px-12 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        
        <div className="flex bg-netflix-dark p-1 rounded-lg border border-gray-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'content', label: 'Conteúdo', icon: Film },
            { id: 'subscriptions', label: 'Assinaturas', icon: CreditCard },
            { id: 'mobile', label: 'Acesso Mobile', icon: Smartphone },
            { id: 'account', label: 'Minha Conta', icon: LayoutDashboard },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-netflix-red text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total de Usuários</p>
            <h3 className="text-4xl font-bold">{stats.totalUsers}</h3>
          </div>
          <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Assinantes</p>
            <h3 className="text-4xl font-bold text-green-500">{stats.premiumUsers}</h3>
          </div>
          <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total de Conteúdo</p>
            <h3 className="text-4xl font-bold text-netflix-red">{stats.totalContent}</h3>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
          <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-netflix-red" /> Criar Novo Usuário
            </h2>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Nome</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nome do usuário"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Senha</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Senha"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newUser.plan}
                  onChange={(e) => setNewUser({ ...newUser, plan: e.target.value as any })}
                  className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none text-sm"
                >
                  <option value="free">Plano Free</option>
                  <option value="premium">Plano Premium</option>
                </select>
                <button className="px-6 py-2 bg-netflix-red rounded font-bold hover:bg-red-700 transition-all text-sm">
                  Criar
                </button>
              </div>
            </form>
            {message.text && activeTab === 'users' && <p className={cn("mt-4 text-sm", message.type === 'success' ? "text-green-500" : "text-red-500")}>{message.text}</p>}
          </div>

          <div className="bg-netflix-dark rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome / Email</th>
                  <th className="px-6 py-4 font-medium">Plano</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        u.plan === 'premium' ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
                      )}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {u.role !== 'admin' && (
                          <>
                            {u.plan === 'free' ? (
                              <button 
                                onClick={() => updateUserPlan(u.id, 'premium')}
                                className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Upgrade para Premium"
                              >
                                <ArrowUpCircle size={18} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => updateUserPlan(u.id, 'free')}
                                className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                                title="Downgrade para Grátis"
                              >
                                <ArrowDownCircle size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => setEditingUser(u)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Editar Usuário"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => { if(window.confirm(`Excluir usuário ${u.name}?`)) deleteUser(u.id) }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Excluir Usuário"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {u.role === 'admin' && <span className="text-[10px] text-gray-500 uppercase font-bold px-2">Admin</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-netflix-dark w-full max-w-md rounded-xl border border-gray-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Editar Usuário</h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Nome</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Senha</label>
                <input
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Plano</label>
                <select
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value as any })}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 border border-gray-700 rounded font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button className="flex-1 py-3 bg-netflix-red rounded font-bold hover:bg-red-700 transition-all">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'mobile' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-netflix-dark p-8 rounded-xl border border-gray-800 text-center shadow-2xl">
            <div className="w-16 h-16 bg-netflix-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone size={32} className="text-netflix-red" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Acesso Mobile</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Assista seus filmes e séries favoritos em qualquer lugar. Escaneie o código abaixo para abrir a versão otimizada para celular.
            </p>
            
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-netflix-red to-red-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-6 rounded-2xl inline-block mb-8 shadow-2xl transform transition-transform hover:scale-105 duration-300">
                <QRCodeSVG 
                  value={sharedUrl} 
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-5 bg-black/40 rounded-xl border border-gray-800">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Copy size={16} className="text-netflix-red" /> Link Direto
                </h4>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-900 p-3 rounded border border-gray-700 font-mono text-[10px] break-all text-netflix-red overflow-hidden">
                    {sharedUrl}
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className="p-3 bg-netflix-red rounded-lg hover:bg-red-700 transition-colors shrink-0"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="p-5 bg-yellow-900/10 rounded-xl border border-yellow-700/20">
                <h4 className="font-bold mb-3 text-yellow-500 flex items-center gap-2">
                  <X size={16} /> Erro 403?
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Se aparecer "403 Forbidden", certifique-se de estar logado no Google no seu celular com a conta: <br/>
                  <strong className="text-yellow-500/80">{user?.email}</strong>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 flex flex-wrap justify-center gap-8 text-gray-500 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Otimizado para iOS & Android
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-netflix-red rounded-full"></div>
                Suporte a PWA (Instalável)
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="max-w-xl mx-auto bg-netflix-dark p-8 rounded-xl border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users size={24} className="text-netflix-red" /> Meus Dados de Acesso
          </h2>
          <p className="text-gray-400 text-sm mb-8">Altere suas credenciais de acesso ao painel administrativo.</p>
          
          <form onSubmit={handleUpdateAdmin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Nome de Exibição</label>
              <input
                type="text"
                value={adminDetails.name}
                onChange={(e) => setAdminDetails({ ...adminDetails, name: e.target.value })}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Email de Login</label>
              <input
                type="email"
                value={adminDetails.email}
                onChange={(e) => setAdminDetails({ ...adminDetails, email: e.target.value })}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Nova Senha</label>
              <input
                type="password"
                value={adminDetails.password}
                onChange={(e) => setAdminDetails({ ...adminDetails, password: e.target.value })}
                placeholder="Mantenha ou altere sua senha"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
              />
            </div>
            
            <button className="w-full py-3 bg-netflix-red rounded font-bold hover:bg-red-700 transition-all">
              Salvar Alterações
            </button>
            
            {message.text && activeTab === 'account' && (
              <p className={cn("text-center text-sm", message.type === 'success' ? "text-green-500" : "text-red-500")}>
                {message.text}
              </p>
            )}
          </form>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-netflix-red" /> Adicionar Conteúdo
              </h2>
              <form onSubmit={handleAddContent} className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContentType('movie')}
                    className={cn("flex-1 py-2 rounded border text-sm font-bold transition-all", contentType === 'movie' ? "bg-netflix-red border-netflix-red" : "border-gray-700 text-gray-400")}
                  >
                    Filme
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('tv')}
                    className={cn("flex-1 py-2 rounded border text-sm font-bold transition-all", contentType === 'tv' ? "bg-netflix-red border-netflix-red" : "border-gray-700 text-gray-400")}
                  >
                    Série
                  </button>
                </div>
                <input
                  type="text"
                  value={tmdbId}
                  onChange={(e) => setTmdbId(e.target.value)}
                  placeholder="ID TMDb (ex: 550)"
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:border-netflix-red outline-none"
                />
                <button disabled={loading} className="w-full py-3 bg-netflix-red rounded font-bold hover:bg-red-700 transition-all disabled:opacity-50">
                  {loading ? 'Buscando...' : 'Adicionar ao Catálogo'}
                </button>
                {message.text && <p className={cn("text-center text-sm", message.type === 'success' ? "text-green-500" : "text-red-500")}>{message.text}</p>}
              </form>
            </div>

            <div className="bg-netflix-dark p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <RefreshCcw size={20} className="text-netflix-red" /> Sistema
              </h2>
              <p className="text-sm text-gray-400 mb-6">Limpe todos os dados locais salvos (usuários, favoritos, progresso).</p>
              <button
                onClick={() => { if(window.confirm('Resetar tudo?')) { resetAllData(); window.location.reload(); } }}
                className="w-full py-3 border border-red-600 text-red-600 rounded font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                Resetar Sistema Completo
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-6">Conteúdo Manual</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {manualContent.map(item => (
                <div key={item.id} className="bg-netflix-dark p-4 rounded-xl border border-gray-800 flex gap-4">
                  <img src={`${IMAGE_BASE_URL}${item.poster_path}`} className="w-16 h-24 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm line-clamp-1">{item.title || item.name}</h3>
                      <p className="text-[10px] text-gray-500 uppercase">{item.media_type === 'tv' ? 'Série' : 'Filme'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setPinnedContent(pinnedContentId === item.id ? null : item.id)} className={cn("p-2 rounded transition-all", pinnedContentId === item.id ? "bg-netflix-red text-white" : "bg-gray-800 text-gray-400 hover:text-white")}>
                        <Pin size={16} />
                      </button>
                      <button onClick={() => removeManualContent(item.id)} className="p-2 bg-gray-800 text-gray-400 hover:text-red-500 rounded transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="bg-netflix-dark p-8 rounded-xl border border-gray-800 text-center max-w-2xl mx-auto">
          <CreditCard size={48} className="mx-auto mb-4 text-netflix-red" />
          <h2 className="text-2xl font-bold mb-2">Gerenciar Assinaturas</h2>
          <p className="text-gray-400 mb-8">Gerencie planos e simule aprovações de pagamento manualmente para testes.</p>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-black/40 rounded-lg border border-gray-800 flex items-center justify-between">
              <div className="text-left">
                <p className="font-bold">Upgrade em Massa</p>
                <p className="text-xs text-gray-500">Transformar todos os usuários em Premium</p>
              </div>
              <button 
                onClick={() => users.forEach(u => updateUserPlan(u.id, 'premium'))}
                className="px-4 py-2 bg-green-600 rounded text-sm font-bold hover:bg-green-700 transition-all"
              >
                Executar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
