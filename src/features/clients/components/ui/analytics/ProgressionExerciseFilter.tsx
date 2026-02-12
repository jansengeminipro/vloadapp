import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Filter, ChevronUp, ChevronDown, Dumbbell, Check } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            if (isOpen) setIsOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                const dropdownEl = document.getElementById('exercise-filter-dropdown');
                if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
                    setIsOpen(false);
                }
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

    const isDesktop = useMediaQuery('(min-width: 768px)');

    const dropdownContent = (
        <>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Dumbbell size={16} className="text-amber-500" /> Filtrar Exercícios
            </h4>
            <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-base md:text-xs text-white mb-3 focus:outline-none focus:border-primary-500"
                placeholder="Buscar exercícios..."
                autoFocus
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
        </>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
                <Filter size={14} />
                Exercícios
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isOpen && createPortal(
                isDesktop ? (
                    <div
                        id="exercise-filter-dropdown"
                        className="absolute z-[9999] w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            top: position.top,
                            left: Math.max(10, position.left + position.width - 320),
                        }}
                    >
                        {dropdownContent}
                    </div>
                ) : (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div
                            id="exercise-filter-dropdown"
                            className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 animate-in zoom-in-95 duration-200"
                        >
                            {dropdownContent}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-4 w-full py-3 bg-slate-800 rounded-lg text-sm font-bold text-slate-300"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                ),
                document.body
            )}
        </>
    );
};
