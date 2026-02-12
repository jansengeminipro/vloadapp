import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';

interface FilterSelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    icon?: React.ReactNode;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-surface-950 border border-white/5 rounded-xl text-xs font-bold text-surface-300 hover:bg-surface-900 hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
            >
                <div className="flex items-center gap-2 truncate">
                    {icon}
                    <span className="truncate">{value === 'All' ? label : value}</span>
                </div>
                {isOpen ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-xs bg-surface-900 border border-white/10 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200 md:absolute md:top-full md:left-0 md:w-full md:translate-x-0 md:translate-y-1 md:mt-1 max-h-60 overflow-y-auto custom-scrollbar">
                        <button
                            type="button"
                            onClick={() => { onChange('All'); setIsOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${value === 'All' ? 'bg-primary-500/10 text-primary-400' : 'text-surface-400 hover:bg-surface-800 hover:text-white'}`}
                        >
                            <span>{label}</span>
                            {value === 'All' && <Check size={14} />}
                        </button>
                        <div className="h-px bg-white/5 my-1" />
                        {options.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${value === opt ? 'bg-primary-500/10 text-primary-400' : 'text-surface-400 hover:bg-surface-800 hover:text-white'}`}
                            >
                                <span>{opt}</span>
                                {value === opt && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
