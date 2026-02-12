import React from 'react';
import { Settings, ChevronLeft } from 'lucide-react';
import { Client } from '@/shared/types';
import { calculateAge } from '@/shared/utils/date';

import { useNavigate } from 'react-router-dom';

interface ClientHeaderProps {
    client: Client;
    onEditProfile: () => void;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ client, onEditProfile }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-surface-400 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <img src={client.avatarUrl} className="w-16 h-16 rounded-full border-2 border-primary-500 shadow-lg shadow-primary-500/20" alt={client.name} />
                <div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight">{client.name}</h1>
                    <div className="flex gap-4 text-sm text-surface-400 mt-1 font-medium">
                        {calculateAge(client.birthDate) && <span>{calculateAge(client.birthDate)} anos</span>}
                        {client.weight && <span>{client.weight}kg</span>}
                        <span className="text-primary-400">{client.activeProgram?.name || 'Sem programa'}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onEditProfile} className="p-2 border border-white/10 hover:border-white/20 hover:bg-surface-800 rounded-lg text-surface-400 hover:text-white transition-colors" title="Editar Perfil">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
};

export default ClientHeader;
