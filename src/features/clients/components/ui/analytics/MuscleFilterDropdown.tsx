import React, { useRef, useState, useEffect } from 'react';
import { Layers, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { MUSCLE_COLORS } from '@/features/clients/constants';

interface MuscleFilterDropdownProps {
    activeMuscleGroups: string[];
    visibleMuscleGroups: string[];
    setVisibleMuscleGroups: (muscles: string[]) => void;
}

export const MuscleFilterDropdown: React.FC<MuscleFilterDropdownProps> = ({
    activeMuscleGroups,
    visibleMuscleGroups,
    setVisibleMuscleGroups
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMuscles = Object.keys(MUSCLE_COLORS)
        .sort()
        .filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()));

    const toggleMuscle = (muscle: string) => {
        if (visibleMuscleGroups.includes(muscle)) {
            setVisibleMuscleGroups(visibleMuscleGroups.filter(m => m !== muscle));
        } else {
            setVisibleMuscleGroups([...visibleMuscleGroups, muscle]);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-900 border border-white/5 rounded-lg text-xs font-bold text-surface-300 hover:bg-surface-800 transition-colors uppercase tracking-wider"
            >
                <Layers size={14} />
                Músculos
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-surface-900 border border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200 md:absolute md:top-full md:left-auto md:right-0 md:translate-x-0 md:translate-y-0 md:mt-2 md:w-64">
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 font-display tracking-tight">
                            <Layers size={16} className="text-primary-500" /> Filtrar Músculos
                        </h4>
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-950 border border-white/10 rounded p-2 text-base md:text-xs text-white mb-3 focus:outline-none focus:border-primary-500 placeholder-surface-500"
                            placeholder="Buscar..."
                        />
                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                            {filteredMuscles.map(m => (
                                <button
                                    key={m}
                                    onClick={() => toggleMuscle(m)}
                                    className="w-full flex justify-between items-center px-3 py-2 text-xs text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors border border-transparent hover:border-white/5"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: MUSCLE_COLORS[m] }}></div>
                                        <span className="font-medium">{m}</span>
                                    </div>
                                    {visibleMuscleGroups.includes(m) && <Check size={14} className="text-emerald-500" />}
                                </button>
                            ))}
                            {filteredMuscles.length === 0 && (
                                <div className="text-center py-4 text-xs text-surface-500 italic">
                                    Nenhum músculo encontrado
                                </div>
                            )}
                        </div>
                        <div className="border-t border-white/5 mt-3 pt-3 flex items-center justify-between gap-2">
                            <button onClick={() => setVisibleMuscleGroups(activeMuscleGroups)} className="flex-1 bg-surface-800 hover:bg-surface-700 text-xs text-white py-2 rounded-lg font-bold transition-colors border border-white/5">Todos</button>
                            <button onClick={() => setVisibleMuscleGroups([])} className="flex-1 bg-surface-800 hover:bg-surface-700 text-xs text-white py-2 rounded-lg font-bold transition-colors border border-white/5">Nenhum</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
