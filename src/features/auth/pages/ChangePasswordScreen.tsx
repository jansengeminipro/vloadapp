import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';
import { Lock, CheckCircle } from 'lucide-react';

const ChangePasswordScreen: React.FC = () => {
    const { user, signOut } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const match = password === confirmPassword;
    const valid = password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!match) return setError('As senhas não coincidem.');
        if (!valid) return setError('A senha deve ter pelo menos 6 caracteres.');

        try {
            setLoading(true);

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;

            // Update metadata to remove force flag
            const { error: metaError } = await supabase.auth.updateUser({
                data: { force_password_change: false }
            });
            if (metaError) throw metaError;

            // Reload to refresh auth state
            window.location.reload();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="text-amber-500 w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center">Defina sua Senha</h1>
                    <p className="text-slate-400 text-sm text-center mt-2">
                        Por segurança, você deve alterar sua senha temporária antes de continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nova Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Confirmar Senha</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                            placeholder="Repita a senha"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !match || !valid}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Salvando...' : 'Atualizar Senha'}
                    </button>

                    <button
                        type="button"
                        onClick={() => signOut()}
                        className="w-full text-slate-500 text-sm hover:text-white transition-colors py-2"
                    >
                        Sair
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordScreen;
