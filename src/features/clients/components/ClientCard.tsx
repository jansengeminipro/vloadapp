import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, ChevronRight } from 'lucide-react';
import { Client } from '@/shared/types';

interface ClientCardProps {
    client: Client;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
    return (
        <Link
            to={`/clients/${client.id}`}
            className="flex items-center p-4 hover:bg-white/[0.02] transition-colors group relative"
        >
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <img
                src={client.avatarUrl}
                alt={client.name}
                className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-primary-500/30 transition-colors"
            />

            <div className="ml-4 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg font-display tracking-tight group-hover:text-primary-400 transition-colors">{client.name}</h3>
                    {client.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/50"></span>}
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-surface-400 mt-1">
                    <span>{client.email}</span>
                    <span className="w-1 h-1 rounded-full bg-surface-600"></span>
                    <span>Último: {client.lastWorkout}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-surface-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={20} />
                </button>
                <ChevronRight className="text-surface-600 group-hover:text-primary-400 transition-colors" size={24} />
            </div>
        </Link>
    );
};
