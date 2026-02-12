import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Layers, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { MUSCLE_COLORS } from '@/features/clients/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Toggle dropdown and calculate position
    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position: slight offset from bottom, aligned to the right of the button usually, or left if space allows
            // Let's align right edge of dropdown with right edge of button for cleaner look in the header
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX, // We'll adjust this in CSS or calc if needed. Let's send rect.left and handle alignment visually.
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
                // We check if the click is inside the portal content in a separate check closer to the portal usage or by checking generic click
                // But since portal is outside DOM hierarchy of parent, checking ref.current which encompasses the button is correct for the button.
                // For the dropdown content, we need to stop propagation or verify target.
                // Simplest way: Check if target is inside the dropdown element.
                const dropdownEl = document.getElementById('muscle-filter-dropdown');
                if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
                    setIsOpen(false);
                }
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

    const isDesktop = useMediaQuery('(min-width: 768px)');

    const dropdownContent = (
        <>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 font-display tracking-tight">
                <Layers size={16} className="text-primary-500" /> Filtrar Músculos
            </h4>
            <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-surface-950 border border-white/10 rounded p-2 text-base md:text-xs text-white mb-3 focus:outline-none focus:border-primary-500 placeholder-surface-500"
                placeholder="Buscar..."
                autoFocus
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
        </>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-900 border border-white/5 rounded-lg text-xs font-bold text-surface-300 hover:bg-surface-800 transition-colors uppercase tracking-wider relative z-10"
            >
                <Layers size={14} />
                Músculos
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isOpen && createPortal(
                isDesktop ? (
                    <div
                        id="muscle-filter-dropdown"
                        className="absolute z-[9999] w-64 bg-surface-900 border border-white/10 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            top: position.top,
                            left: Math.max(10, position.left + position.width - 256), // Align right
                        }}
                    >
                        {dropdownContent}
                    </div>
                ) : (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div
                            id="muscle-filter-dropdown"
                            className="w-full max-w-xs bg-surface-900 border border-white/10 rounded-xl shadow-2xl p-4 animate-in zoom-in-95 duration-200"
                        >
                            {dropdownContent}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-4 w-full py-3 bg-surface-800 rounded-lg text-sm font-bold text-surface-300"
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
