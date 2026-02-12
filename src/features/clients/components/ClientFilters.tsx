import React from 'react';
import { Search } from 'lucide-react';

interface ClientFiltersProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <div className="bg-surface-800/50 border-b border-white/5 backdrop-blur-sm shadow-sm">
            <div className="p-4 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar alunos..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-surface-900 border border-white/5 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary-500 placeholder-surface-500 transition-all"
                    />
                </div>
            </div>
        </div>
    );
};
