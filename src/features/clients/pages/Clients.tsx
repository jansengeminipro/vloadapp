import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MoreVertical, ChevronRight, Plus, X, Send, User, Copy, Eye, EyeOff } from 'lucide-react';
import { Client } from '@/shared/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';

const Clients: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Invitation Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Create User Modal State
  const [modalTab, setModalTab] = useState<'invite' | 'create'>('invite');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('trainer_id', user?.id)
        .eq('role', 'student');

      if (error) throw error;

      // Map DB fields to Client type if necessary (snake_case to camelCase)
      // Our types are mostly aligned but let's ensure
      const mappedClients: Client[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || 'Sem nome',
        email: p.email,
        avatarUrl: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'User')}&background=random`,
        status: 'active',
        lastWorkout: '-', // This would need a separate query or join
        nextWorkout: '-',
        birthDate: p.birth_date,
        weight: p.weight,
        height: p.height
      }));

      setClients(mappedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteClient = () => {
    if (!inviteEmail || !inviteName) {
      alert('Nome e Email são obrigatórios para o convite.');
      return;
    }

    const link = `${window.location.origin}/?ref=${user?.id}&name=${encodeURIComponent(inviteName)}&email=${encodeURIComponent(inviteEmail)}`;
    setGeneratedLink(link);
  };

  const handleCreateUser = async () => {
    if (!inviteEmail || !inviteName || !tempPassword) {
      alert('Todos os campos são obrigatórios.');
      return;
    }

    if (!user?.id) {
      alert('Erro: ID do treinador não encontrado. Tente fazer login novamente.');
      return;
    }

    try {
      setIsCreating(true);
      console.log('Sending request to create-user...', {
        email: inviteEmail,
        full_name: inviteName,
        trainer_id: user.id
      });

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: inviteEmail,
          password: tempPassword,
          full_name: inviteName,
          trainer_id: user.id
        }
      });

      if (error) {
        // Updated error handling to extract message robustly from Edge Function response
        let errorMessage = error.message;
        try {
          // Check if error object has the response context
          if (error && typeof error === 'object' && 'context' in error) {
            const response = (error as any).context as Response;
            if (response && typeof response.text === 'function') {
              const textBody = await response.text();
              try {
                const jsonBody = JSON.parse(textBody);
                if (jsonBody && jsonBody.error) errorMessage = jsonBody.error;
                else errorMessage = textBody; // Fallback to text if JSON has no error field
              } catch {
                errorMessage = textBody; // Fallback to raw text if not JSON
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse error body', e);
        }

        // Translate common Supabase Auth errors
        if (errorMessage?.includes('period of time')) errorMessage = 'Muitas tentativas. Tente novamente em alguns segundos.';
        if (errorMessage?.includes('already registered')) errorMessage = 'Este email já está cadastrado.';
        if (errorMessage?.includes('weak_password')) errorMessage = 'A senha deve ter pelo menos 6 caracteres.';

        throw new Error(errorMessage || 'Erro desconhecido ao chamar a função.');
      }

      console.log('User created:', data);

      alert(`Usuário criado com sucesso!\n\nEmail: ${inviteEmail}\nSenha: ${tempPassword}\n\nEnvie estas credenciais para o aluno.`);
      setShowModal(false);
      setInviteEmail('');
      setInviteName('');
      setTempPassword('');
      setCreateError(null);
      setModalTab('invite');
      fetchClients(); // Refresh list
    } catch (err: any) {
      console.error('Create user error:', err);
      setCreateError('Erro: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Alunos</h1>
          <p className="text-slate-400">Gerencie seus alunos ativos.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-900/20"
        >
          <Plus size={20} />
          Convidar Aluno
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-700">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Carregando alunos...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {searchTerm ? 'Nenhum aluno encontrado para sua busca.' : 'Você ainda não tem alunos vinculados.'}
            </div>
          ) : (
            filteredClients.map((client) => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="flex items-center p-4 hover:bg-slate-700/50 transition-colors group"
              >
                <img src={client.avatarUrl} alt={client.name} className="w-12 h-12 rounded-full object-cover border border-slate-600" />

                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-lg">{client.name}</h3>
                    {client.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                    <span>{client.email}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span>Último: {client.lastWorkout}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={20} />
                  </button>
                  <ChevronRight className="text-slate-600 group-hover:text-primary-400 transition-colors" size={24} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Invite/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User size={24} className="text-primary-500" />
                Novo Aluno
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setModalTab('invite')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${modalTab === 'invite' ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Link de Convite
              </button>
              <button
                onClick={() => setModalTab('create')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${modalTab === 'create' ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Criar Manualmente
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalTab === 'invite' ? (
                <>
                  <p className="text-slate-400 text-sm mb-4">
                    Gere um link de cadastro para seu aluno.
                  </p>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Nome do Aluno</label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-primary-500 focus:outline-none"
                      placeholder="Ex: Ana Souza"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Email do Aluno</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-primary-500 focus:outline-none"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  {generatedLink && (
                    <div className="mt-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800 animate-in slide-in-from-top-2">
                      <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Link de Acesso</p>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={generatedLink}
                          className="flex-1 bg-slate-900 text-slate-300 text-xs p-2 rounded border border-slate-700 truncate"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLink);
                            alert('Link copiado!');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-700"
                          title="Copiar"
                        >
                          <Copy size={16} />
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Olá ${inviteName}, aqui está o seu link de acesso para o app de treinos: ${generatedLink}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded border border-emerald-500 flex items-center justify-center"
                          title="Enviar no WhatsApp"
                        >
                          <Send size={16} />
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-4">
                    Crie a conta do aluno e defina uma senha temporária.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Nome</label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Senha Temporária</label>
                    <div className="flex gap-2 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-14 top-2.5 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => setTempPassword(Math.random().toString(36).slice(-8))}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-3 rounded-lg border border-slate-700 text-xs whitespace-nowrap"
                      >
                        Gerar
                      </button>
                    </div>
                  </div>
                  {createError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-xs text-red-500">{createError}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setGeneratedLink(null); }}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium"
              >
                Fechar
              </button>

              {modalTab === 'invite' && !generatedLink && (
                <button
                  onClick={handleInviteClient}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-primary-900/20 flex items-center gap-2"
                >
                  Gerar Convite
                </button>
              )}

              {modalTab === 'create' && (
                <button
                  onClick={handleCreateUser}
                  disabled={isCreating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-emerald-900/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? 'Criando...' : 'Criar Conta'}
                </button>
              )}
            </div>
          </div>
        </div >
      )}
    </div >
  );
};

export default Clients;