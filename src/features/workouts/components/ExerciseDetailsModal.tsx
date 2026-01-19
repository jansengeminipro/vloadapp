import React from 'react';
import { X, PlayCircle, Video, Activity, Dumbbell } from 'lucide-react';
import { getExerciseByName } from '@/shared/data/exercises';

interface ExerciseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseName: string | null;
}

const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({ isOpen, onClose, exerciseName }) => {
    if (!isOpen || !exerciseName) return null;

    const exercise = getExerciseByName(exerciseName);
    if (!exercise) return null;

    const ytID = exercise.videoUrl ? getYouTubeID(exercise.videoUrl) : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-900/50 backdrop-blur-sm relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white pr-8">{exercise.name}</h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{exercise.muscleGroup}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Video Section */}
                    <div className="aspect-video bg-black relative border-b border-slate-800">
                        {ytID ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube-nocookie.com/embed/${ytID}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
                                title={exercise.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                className="border-0 w-full h-full"
                            ></iframe>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                                <Video size={48} className="mb-4 opacity-50" />
                                <p className="text-sm font-medium">Vídeo indisponível</p>
                                {exercise.videoUrl && (
                                    <a
                                        href={exercise.videoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 text-primary-400 text-xs hover:underline flex items-center gap-2"
                                    >
                                        <PlayCircle size={14} />
                                        Abrir link externo
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Muscle Details */}
                    <div className="p-6 space-y-6">
                        {/* Agonists */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-emerald-400">
                                <Activity size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Musculatura Agonista (Principal)</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {exercise.agonists && exercise.agonists.length > 0 ? (
                                    exercise.agonists.map((muscle, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium rounded-lg"
                                        >
                                            {muscle}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-500 text-sm italic">Não informado</span>
                                )}
                            </div>
                        </div>

                        {/* Synergists */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-indigo-400">
                                <Dumbbell size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Musculatura Sinergista (Auxiliar)</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {exercise.synergists && exercise.synergists.length > 0 ? (
                                    exercise.synergists.map((muscle, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium rounded-lg"
                                        >
                                            {muscle}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-500 text-sm italic">Não informado</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetailsModal;
