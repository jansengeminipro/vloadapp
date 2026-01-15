import React, { useRef, useState, useEffect } from 'react';
import { Filter, ChevronUp, ChevronDown, Dumbbell, Check } from 'lucide-react';
import { CHART_COLORS } from '@/features/clients/constants';

interface ProgressionExerciseFilterProps {
    availableExercises: string[];
    selectedExercises: string[];
    setSelectedExercises: (exercises: string[]) => void;
}

export const ProgressionExerciseFilter: React.FC<ProgressionExerciseFilterProps> = ({
    availableExercises,
    selectedExercises,
    setSelectedExercises
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

    const toggleExercise = (exercise: string) => {
        if (selectedExercises.includes(exercise)) {
            setSelectedExercises(selectedExercises.filter(e => e !== exercise));
        } else {
            setSelectedExercises([...selectedExercises, exercise]);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
                <Filter size={14} />
                Exercícios
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200 md:absolute md:top-full md:left-auto md:right-0 md:translate-x-0 md:translate-y-0 md:mt-2 md:w-80">
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Dumbbell size={16} className="text-amber-500" /> Filtrar Exercícios
                        </h4>
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-base md:text-xs text-white mb-3 focus:outline-none focus:border-primary-500"
                            placeholder="Buscar exercícios..."
                        />
                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                            {availableExercises
                                .filter(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(e => (
                                    <button
                                        key={e}
                                        onClick={() => toggleExercise(e)}
                                        className="w-full flex justify-between items-center px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                                    >
                                        <span className={`text-left font-medium ${selectedExercises.includes(e) ? 'text-white' : ''}`}>
                                            {e}
                                        </span>
                                        {selectedExercises.includes(e) && <Check size={14} className="text-amber-500 shrink-0" />}
                                    </button>
                                ))}
                            {availableExercises.length === 0 && (
                                <div className="text-center py-4 text-xs text-slate-500 italic">
                                    Nenhum exercício encontrado
                                </div>
                            )}
                        </div>
                        <div className="border-t border-slate-800 mt-3 pt-3 px-2">
                            <button
                                onClick={() => setSelectedExercises([])}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-xs text-white py-2 rounded-lg font-bold transition-colors"
                            >
                                Limpar Seleção (Nenhum)
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
