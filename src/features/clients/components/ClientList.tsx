import React from 'react';
import { Client } from '@/shared/types';
import { ClientCard } from './ClientCard';

interface ClientListProps {
    clients: Client[];
    loading: boolean;
    searchTerm: string;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, loading, searchTerm }) => {
    return (
        <div className="divide-y divide-white/5">
            {loading ? (
                <div className="p-12 text-center text-surface-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Carregando alunos...
                </div>
            ) : clients.length === 0 ? (
                <div className="p-12 text-center text-surface-500 font-medium">
                    {searchTerm ? 'Nenhum aluno encontrado para sua busca.' : 'Você ainda não tem alunos vinculados.'}
                </div>
            ) : (
                clients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                ))
            )}
        </div>
    );
};
