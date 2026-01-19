import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';
import { Dumbbell, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

const LoginScreen: React.FC = () => {
    const { signInWithEmail, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // New state for registration
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login'); // Toggle Login vs Register vs Forgot
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Invite Params
    const [inviteData, setInviteData] = useState<{ trainerId: string | null, name: string | null }>({ trainerId: null, name: null });

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref'); // trainerId
        const emailParam = params.get('email');
        const nameParam = params.get('name');

        if (emailParam) setEmail(emailParam);
        if (ref) setInviteData({ trainerId: ref, name: nameParam });

        // If coming from invite link, force login mode (students shouldn't self-register as trainers)
        if (ref) setMode('login');
    }, []);

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        try {
            if (mode === 'register') {
                // TRAINER REGISTRATION FLOW (via Edge Function for instant verification)
                const { error } = await supabase.functions.invoke('create-user', {
                    body: {
                        email,
                        password,
                        full_name: name
                        // No trainer_id => Role becomes 'trainer'
                    }
                });

                if (error) {
                    // Start parsing error to be helpful
                    let errorMessage = error.message || 'Erro ao criar conta.';
                    try {
                        if (error instanceof Error && 'context' in error) {
                            const body = await (error as any).context.json();
                            if (body && body.error) errorMessage = body.error;
                        }
                    } catch (e) {
                        console.error('Failed to parse error body', e);
                    }
                    throw new Error(errorMessage);
                }

                setMessage('Conta criada com sucesso! Faça login para continuar.');
                setMode('login');
            }
            else if (mode === 'forgot_password') {
                // SEND RESET/LOGIN LINK
                const options = inviteData.trainerId ? {
                    data: {
                        trainer_id: inviteData.trainerId,
                        full_name: inviteData.name,
                        role: 'student'
                    }
                } : undefined;

                await signInWithEmail(email, options); // This sends a magic link which acts as a passwordless login/recovery
                setMessage('Link de recuperação enviado! Verifique seu e-mail.');
                setMode('login');
            } else {
                // STANDARD PASSWORD LOGIN
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                // Auto-redirect handled by AuthProvider listener
            }
        } catch (error: any) {
            setMessage('Erro: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-900/20">
                        <Dumbbell className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">VolumeLoad</h1>
                    {inviteData.trainerId && inviteData.name ? (
                        <div className="mt-2 text-center">
                            <p className="text-emerald-400 font-medium text-sm">Convite de Treinador</p>
                            <p className="text-slate-400 text-xs">Olá, {inviteData.name}! Entre para acessar.</p>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">
                            {mode === 'register' ? 'Criar Conta de Treinador' : mode === 'forgot_password' ? 'Recuperar Acesso' : 'Hipertrofia de Precisão'}
                        </p>
                    )}
                </div>

                <form onSubmit={handleAction} className="space-y-4">
                    {/* Name Input - Only for Register */}
                    {mode === 'register' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    {mode !== 'forgot_password' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase">Senha</label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => { setMode('forgot_password'); setMessage(null); }}
                                        className="text-xs text-primary-400 hover:text-primary-300 font-bold"
                                    >
                                        Esqueci minha senha
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-10 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
                                    placeholder="Sua senha"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? 'Processando...'
                            : mode === 'register' ? 'Criar Conta de Treinador'
                                : mode === 'forgot_password' ? 'Enviar Link de Recuperação'
                                    : 'Entrar'
                        }
                    </button>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm text-center ${message.includes('Erro') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {message}
                        </div>
                    )}
                </form>

                <div className="mt-8 text-center text-xs text-slate-500">
                    {mode === 'login' ? (
                        <>
                            {!inviteData.trainerId && (
                                <button
                                    onClick={() => { setMode('register'); setMessage(null); }}
                                    className="text-primary-400 hover:text-primary-300 font-bold"
                                >
                                    Não tem conta? Cadastre-se como Treinador
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => { setMode('login'); setMessage(null); }}
                            className="text-primary-400 hover:text-primary-300 font-bold"
                        >
                            Voltar para Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
