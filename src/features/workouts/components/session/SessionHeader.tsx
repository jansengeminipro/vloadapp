import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Settings } from 'lucide-react';

interface SessionHeaderProps {
    templateName: string;
    elapsedTime: string;
    clientId: string;
    onToggleEdit: () => void;
    onFinish: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
    templateName,
    elapsedTime,
    clientId,
    onToggleEdit,
    onFinish
}) => {
    return (
        <div className="sticky top-0 z-50 bg-surface-950/95 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center safe-area-top shadow-sm">
            <Link to={`/clients/${clientId}?tab=program`} className="text-surface-400 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-surface-800/50">
                <ChevronLeft size={24} />
            </Link>

            <div className="flex-1 flex flex-col items-center justify-center mx-2">
                <div className="flex items-center gap-2 justify-center w-full">
                    <h2 className="text-white font-bold text-sm truncate max-w-[160px]">{templateName}</h2>
                    <button
                        onClick={onToggleEdit}
                        className="text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all p-1.5 rounded-lg group"
                        title="Adaptar Treino (Editar)"
                    >
                        <Settings size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                    </button>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-surface-400 text-[10px] font-mono font-medium tracking-wide">{elapsedTime}</p>
                </div>
            </div>

            <button
                onClick={onFinish}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
                Finalizar
            </button>
        </div>
    );
};
