import React, { useState, useRef, useEffect } from 'react';
import { Video, PlayCircle, History, Layers, ChevronRight, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';
import { WorkoutExercise } from '@/shared/types';

interface ExerciseCardProps {
    exercise: WorkoutExercise;
    exerciseIndex: number;
    clientId: string;
    onShowHistory: () => void;
    onShowVideo: () => void;
    onSwapAlternative: (exerciseIndex: number, alternativeIndex: number) => void;
    onReplace: () => void;
    onRemove: () => void;
}

// Helpers (duplicated for now, could move to shared utils)
const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getThumbnailUrl = (url?: string) => {
    if (!url) return null;
    const id = getYouTubeID(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    exerciseIndex,
    onShowHistory,
    onShowVideo,
    onSwapAlternative,
    onReplace,
    onRemove
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const ytID = exercise.videoUrl ? getYouTubeID(exercise.videoUrl) : null;
    const thumbnailUrl = ytID ? `https://img.youtube.com/vi/${ytID}/0.jpg` : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-start gap-4 mb-3">
                {exercise.videoUrl && (
                    <div
                        onClick={onShowVideo}
                        className="w-24 h-16 shrink-0 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden relative group cursor-pointer shadow-md"
                    >
                        {thumbnailUrl ? (
                            <img src={thumbnailUrl} alt="Video" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                <Video size={20} className="text-slate-500" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent">
                            <PlayCircle size={24} className="text-white/90 fill-black/50" />
                        </div>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h1 className="text-lg font-bold text-white leading-tight line-clamp-2">{exercise.name}</h1>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setShowMenu(false); onShowHistory(); }}
                                            className="w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-3 text-left"
                                        >
                                            <History size={16} className="text-blue-400" />
                                            Histórico
                                        </button>
                                        <button
                                            onClick={() => { setShowMenu(false); onReplace(); }}
                                            className="w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-3 text-left"
                                        >
                                            <RefreshCw size={16} className="text-amber-500" />
                                            Substituir
                                        </button>
                                        <div className="h-px bg-slate-800 my-1"></div>
                                        <button
                                            onClick={() => { setShowMenu(false); onRemove(); }}
                                            className="w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 text-left"
                                        >
                                            <Trash2 size={16} />
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">
                    Alvo: <span className="text-white font-medium">{exercise.targetReps} reps</span>
                </div>
                <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">
                    RIR: <span className="text-amber-500 font-bold">{exercise.targetRIR}</span>
                </div>
                <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">
                    Desc: <span className="text-blue-400 font-medium">{exercise.restSeconds}s</span>
                </div>
            </div>

            {/* Alternatives Navigation */}
            {(exercise.alternatives && exercise.alternatives.length > 0) && (
                <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
                    <button
                        onClick={() => onSwapAlternative(exerciseIndex, 0)}
                        className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg flex items-center justify-center gap-2 text-primary-400 font-medium transition-all active:scale-[0.99]"
                    >
                        <Layers size={14} />
                        <span>Ver alternativa ({exercise.alternatives.length})</span>
                        <ChevronRight size={16} />
                    </button>
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50"></div>
                        {exercise.alternatives.map((_, idx) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-slate-700/50"></div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
