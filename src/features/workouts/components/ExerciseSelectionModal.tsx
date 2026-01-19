import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Video, Link as LinkIcon, Dumbbell, ChevronUp, ChevronDown, Check, ChevronLeft, Edit2, AlertCircle, Save, Settings, Trash2, RefreshCw, Shuffle } from 'lucide-react';
import { Exercise, MuscleGroup, WorkoutExercise } from '@/shared/types';
import { useAuth } from '@/app/providers/AuthProvider';

// Helper Component for Custom Select
interface FilterSelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    icon?: React.ReactNode;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

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
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
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
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-xs bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200 md:absolute md:top-full md:left-0 md:w-full md:translate-x-0 md:translate-y-1 md:mt-1 max-h-60 overflow-y-auto custom-scrollbar">
                        <button
                            type="button"
                            onClick={() => { onChange('All'); setIsOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${value === 'All' ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <span>{label}</span>
                            {value === 'All' && <Check size={14} />}
                        </button>
                        <div className="h-px bg-slate-800 my-1" />
                        {options.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${value === opt ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
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

interface ExerciseSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: Exercise) => void;
    exercises: Exercise[];
    onCreateCustom?: (data: { name: string; muscleGroup: MuscleGroup; equipment: string; videoUrl?: string; isGlobal?: boolean }) => Promise<void>;
    onUpdateExercise?: (exerciseId: string, updates: Partial<Exercise>) => Promise<void>;
    initialViewingExercise?: Exercise | null;
    workoutContext?: WorkoutExercise;
    onUpdateWorkoutContext?: (updates: Partial<WorkoutExercise>) => void;
    onReplace?: (exercise: Exercise) => void;
    onAddAlternative?: (exercise: Exercise) => void;
    onRemove?: () => void;
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    exercises,
    onCreateCustom,
    onUpdateExercise,
    initialViewingExercise,
    workoutContext,
    onUpdateWorkoutContext,
    onReplace,
    onAddAlternative,
    onRemove
}) => {
    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    const { user, profile } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');
    const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<string>('All');
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);

    // Details View State
    const [viewingExercise, setViewingExercise] = useState<Exercise | null>(initialViewingExercise || null);
    const [editingVideoUrl, setEditingVideoUrl] = useState('');
    const [isEditingVideo, setIsEditingVideo] = useState(false);

    // Customize State
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [customizeForm, setCustomizeForm] = useState({
        name: '',
        muscleGroup: MuscleGroup.Chest,
        equipment: '',
        videoUrl: ''
    });

    // Create Form State
    const [newExerciseForm, setNewExerciseForm] = useState({
        name: '',
        muscleGroup: MuscleGroup.Chest,
        equipment: 'Peso do Corpo',
        videoUrl: '',
        isGlobal: false
    });
    const [showVideoInput, setShowVideoInput] = useState(false);

    const [isReplacing, setIsReplacing] = useState(false);
    const [isAddingAlternative, setIsAddingAlternative] = useState(false);

    // Reset when modal opens/closes or initial exercise changes
    useEffect(() => {
        if (isOpen && initialViewingExercise) {
            setViewingExercise(initialViewingExercise);
        } else if (!isOpen) {
            // Reset state on close
            setViewingExercise(null);
            setIsCustomizing(false);
            setIsReplacing(false);
            setIsAddingAlternative(false);
            setSearchQuery('');
        }
    }, [isOpen, initialViewingExercise]);

    // EARLY RETURN AFTER ALL HOOKS
    if (!isOpen) return null;

    // Filter Logic
    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMuscle = selectedMuscleFilter === 'All' || ex.muscleGroup === selectedMuscleFilter;
        const matchesEquipment = selectedEquipmentFilter === 'All' || ex.equipment === selectedEquipmentFilter;
        return matchesSearch && matchesMuscle && matchesEquipment;
    });

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedMuscleFilter('All');
        setSelectedEquipmentFilter('All');
    };

    const handleSelectExercise = (exercise: Exercise) => {
        if (isReplacing && onReplace) {
            onReplace(exercise);
            setIsReplacing(false);
            onClose();
        } else if (isAddingAlternative && onAddAlternative) {
            onAddAlternative(exercise);
            setIsAddingAlternative(false);
            onClose();
        } else {
            onSelect(exercise);
        }
    };

    const handleQuickAlternative = () => {
        if (!viewingExercise) return;

        setSelectedMuscleFilter(viewingExercise.muscleGroup);
        setSelectedEquipmentFilter('All');
        setSearchQuery('');

        setViewingExercise(null);
        setIsAddingAlternative(true);
    };

    const handleCreate = async () => {
        if (!onCreateCustom) return;
        if (!newExerciseForm.name) return alert("O nome é obrigatório");

        await onCreateCustom(newExerciseForm);

        // Reset form
        setNewExerciseForm({
            name: '',
            muscleGroup: MuscleGroup.Chest,
            equipment: 'Peso do Corpo',
            videoUrl: '',
            isGlobal: false
        });
        setShowVideoInput(false);
        setIsCreatingExercise(false);
    };

    const handleSaveVideo = async () => {
        if (!viewingExercise || !onUpdateExercise) return;
        try {
            await onUpdateExercise(viewingExercise.id, { videoUrl: editingVideoUrl });
            // Update local state
            const updated = { ...viewingExercise, videoUrl: editingVideoUrl };
            setViewingExercise(updated);
            setIsEditingVideo(false);
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar vídeo');
        }
    };

    const startCustomization = () => {
        if (!viewingExercise) return;
        setCustomizeForm({
            name: viewingExercise.name,
            muscleGroup: viewingExercise.muscleGroup,
            equipment: viewingExercise.equipment,
            videoUrl: viewingExercise.videoUrl || ''
        });
        setIsCustomizing(true);
    };

    const handleSaveCustomization = async () => {
        if (!viewingExercise || !onCreateCustom || !onUpdateExercise || !user) return;
        if (!customizeForm.name) return alert("O nome é obrigatório");

        try {
            const isOwner = viewingExercise.ownerId === user.id;

            if (isOwner) {
                // Update existing
                await onUpdateExercise(viewingExercise.id, {
                    name: customizeForm.name,
                    muscleGroup: customizeForm.muscleGroup,
                    equipment: customizeForm.equipment,
                    videoUrl: customizeForm.videoUrl
                });

                // Update local view
                setViewingExercise({
                    ...viewingExercise,
                    ...customizeForm
                });
            } else {
                // Create copy
                await onCreateCustom({
                    name: customizeForm.name,
                    muscleGroup: customizeForm.muscleGroup,
                    equipment: customizeForm.equipment,
                    videoUrl: customizeForm.videoUrl,
                    isGlobal: false
                });
                // We should probably switch the view to the new exercise or just go back.
                // For now let's go back to list to show the new exercise
                setViewingExercise(null);
            }

            setIsCustomizing(false);
        } catch (error: any) {
            console.error(error);
            alert('Erro ao salvar personalização: ' + error.message);
        }
    };

    // Helper to get YouTube ID
    const getYoutubeId = (url?: string) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    }

    const renderCustomizeForm = () => {
        const ytId = getYoutubeId(customizeForm.videoUrl);
        const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

        return (
            <div className="flex flex-col h-full bg-slate-900 overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <button onClick={() => setIsCustomizing(false)} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="font-bold text-lg text-white truncate flex-1">Editar Exercício</h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Alert Box */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-full shrink-0">
                            <AlertCircle size={20} className="text-blue-400" />
                        </div>
                        <p className="text-sm text-blue-200 mt-0.5">
                            O exercício personalizado ficará salvo na aba "Meus Exercícios".
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Nome</label>
                        <input
                            type="text"
                            value={customizeForm.name}
                            onChange={(e) => setCustomizeForm({ ...customizeForm, name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none focus:ring-1 ring-primary-500 transition-all font-medium"
                        />
                    </div>

                    {/* Media Type */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Mídia</label>
                        <select className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer">
                            <option>Vídeo do Youtube / URL</option>
                        </select>
                    </div>

                    {/* Current Media Preview */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Mídia Atual</label>
                        <div className="w-full max-w-[200px] aspect-[9/16] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative group">
                            {thumbUrl ? (
                                <>
                                    <img src={thumbUrl} alt="" className="w-full h-full object-cover opacity-70" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                            <Video size={20} className="text-white" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <Video size={32} className="opacity-50" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Video URL */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Link do Vídeo (Opcional)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                value={customizeForm.videoUrl}
                                onChange={(e) => setCustomizeForm({ ...customizeForm, videoUrl: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </div>

                    {/* Muscle Group */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Grupo Muscular</label>
                        <select
                            value={customizeForm.muscleGroup}
                            onChange={(e) => setCustomizeForm({ ...customizeForm, muscleGroup: e.target.value as MuscleGroup })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
                        >
                            {Object.values(MuscleGroup).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* Equipment */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Categoria (Equipamento)</label>
                        <input
                            type="text"
                            value={customizeForm.equipment}
                            onChange={(e) => setCustomizeForm({ ...customizeForm, equipment: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSaveCustomization}
                            className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={20} /> Salvar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDetails = () => {
        if (!viewingExercise) return null;
        const ytId = getYoutubeId(viewingExercise.videoUrl);
        const canEdit = profile?.role === 'admin' || viewingExercise.ownerId === user?.id;

        // Check if we are editing a workout instance
        const isEditingInstance = workoutContext && onUpdateWorkoutContext && workoutContext.id === viewingExercise.id;

        return (
            <div className="flex flex-col h-full bg-slate-900 overflow-y-auto custom-scrollbar">
                {/* Header with Back Button */}
                <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <button onClick={() => setViewingExercise(null)} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="font-bold text-lg text-white truncate flex-1">{viewingExercise.name}</h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Video Section */}
                    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative group border border-slate-800 shadow-2xl">
                        {ytId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${ytId}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                                <Video size={48} className="mb-4 opacity-50" />
                                <p className="font-medium text-sm">Sem vídeo disponível</p>
                            </div>
                        )}

                        {/* Edit Video Overlay Button */}
                        {canEdit && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingVideoUrl(viewingExercise.videoUrl || ''); setIsEditingVideo(true); }}
                                    className="bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 hover:border-primary-500 shadow-xl flex items-center gap-2"
                                >
                                    <Edit2 size={12} /> {ytId ? 'Alterar Vídeo' : 'Adicionar Vídeo'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Workout Configuration (If Context Exists) */}
                    {isEditingInstance && (
                        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings size={16} className="text-primary-500" />
                                <h4 className="font-bold text-sm text-white uppercase tracking-wider">Configuração do Treino</h4>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase block text-center">Séries</label>
                                    <input
                                        type="number"
                                        value={workoutContext.sets}
                                        onChange={(e) => onUpdateWorkoutContext({ sets: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center text-sm py-2 rounded-lg focus:ring-1 ring-primary-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase block text-center">Reps</label>
                                    <input
                                        type="text"
                                        value={workoutContext.targetReps}
                                        onChange={(e) => onUpdateWorkoutContext({ targetReps: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center text-sm py-2 rounded-lg focus:ring-1 ring-primary-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-amber-500/70 font-bold uppercase block text-center">RIR</label>
                                    <input
                                        type="number"
                                        value={workoutContext.targetRIR}
                                        onChange={(e) => onUpdateWorkoutContext({ targetRIR: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-900 border border-slate-700 text-amber-500 font-mono font-bold text-center text-sm py-2 rounded-lg focus:ring-1 ring-amber-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-blue-400/70 font-bold uppercase block text-center">Desc. (s)</label>
                                    <input
                                        type="number"
                                        step={30}
                                        value={workoutContext.restSeconds}
                                        onChange={(e) => onUpdateWorkoutContext({ restSeconds: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-900 border border-slate-700 text-blue-400 font-mono font-bold text-center text-sm py-2 rounded-lg focus:ring-1 ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video Editor Input */}
                    {isEditingVideo && (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 animate-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Novo Link do YouTube</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editingVideoUrl}
                                    onChange={e => setEditingVideoUrl(e.target.value)}
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                                    placeholder="https://youtube.com/..."
                                    autoFocus
                                />
                                <button onClick={handleSaveVideo} className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Salvar</button>
                                <button onClick={() => setIsEditingVideo(false)} className="text-slate-400 hover:text-white px-3">Cancelar</button>
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Grupo Muscular</span>
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                {viewingExercise.muscleGroup}
                            </span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Equipamento</span>
                            <span className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                                <Dumbbell size={14} /> {viewingExercise.equipment}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-auto space-y-3">
                        {isEditingInstance ? (
                            <div className="space-y-3">
                                <button
                                    onClick={handleQuickAlternative}
                                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                                    <Shuffle size={20} /> Equipamento Ocupado?
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setViewingExercise(null);
                                            setIsReplacing(true);
                                        }}
                                        className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={18} /> Substituir
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onRemove) {
                                                onRemove();
                                                onClose();
                                            }
                                        }}
                                        className="flex-1 py-3.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} /> Excluir
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleSelectExercise(viewingExercise)}
                                className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Adicionar ao Treino
                            </button>
                        )}

                        <button
                            onClick={startCustomization}
                            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 hover:border-slate-500 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Edit2 size={18} className="text-slate-400" /> Personalizar Exercício
                        </button>

                        {canEdit && (
                            <p className="text-center text-xs text-slate-500 pt-2">
                                {viewingExercise.isGlobal ? '🔒 Este é um exercício Global' : '🔓 Este é seu exercício personalizado'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-[95vw] md:max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden mx-auto relative">

                {isCustomizing ? (
                    renderCustomizeForm()
                ) : viewingExercise ? (
                    renderDetails()
                ) : isCreatingExercise ? (
                    <div className="p-6 flex flex-col h-full overflow-y-auto space-y-4 custom-scrollbar">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Nome</label>
                            <input
                                type="text"
                                value={newExerciseForm.name}
                                onChange={(e) => setNewExerciseForm({ ...newExerciseForm, name: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none focus:ring-1 ring-primary-500 transition-all font-medium"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Músculo</label>
                                <select
                                    value={newExerciseForm.muscleGroup}
                                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, muscleGroup: e.target.value as MuscleGroup })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
                                >
                                    {Object.values(MuscleGroup).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Equipamento</label>
                                <input
                                    type="text"
                                    value={newExerciseForm.equipment}
                                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, equipment: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none placeholder-slate-600"
                                    placeholder="Ex: Halteres, Barra..."
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setShowVideoInput(!showVideoInput)}
                                className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-2"
                            >
                                {showVideoInput ? <X size={14} /> : <Plus size={14} />}
                                {showVideoInput ? 'Remover Link de Vídeo' : 'Adicionar Link de Vídeo'}
                            </button>

                            {showVideoInput && (
                                <div className="animate-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wide">URL do Vídeo (YouTube)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            value={newExerciseForm.videoUrl}
                                            onChange={(e) => setNewExerciseForm({ ...newExerciseForm, videoUrl: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {profile?.role === 'admin' && (
                            <div className="flex items-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="isGlobal"
                                    checked={newExerciseForm.isGlobal}
                                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, isGlobal: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-slate-800"
                                />
                                <label htmlFor="isGlobal" className="text-sm font-bold text-indigo-300">
                                    Adicionar à Biblioteca Global (Visível para todos)
                                </label>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3 mt-auto">
                            <button
                                type="button"
                                onClick={() => setIsCreatingExercise(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 transition-all"
                            >
                                Salvar Exercício
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
                            <h2 className="text-xl font-bold text-white truncate pr-4">
                                {isReplacing ? 'Substituir Exercício' : isAddingAlternative ? 'Adicionar Alternativa' : 'Selecionar Exercício'}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg shrink-0"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-slate-800 space-y-4 bg-slate-900/50">
                            <div className="flex gap-3">
                                <div className="relative flex-1 min-w-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar exercício..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 ring-primary-500 transition-all"
                                        autoFocus
                                    />
                                </div>
                                {onCreateCustom && (
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingExercise(true)}
                                        className="bg-emerald-600 hover:bg-emerald-500 px-3 md:px-4 rounded-xl text-white font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20 shrink-0"
                                        title="Criar Exercício Personalizado"
                                    >
                                        <Plus size={20} /> <span className="hidden md:inline">Novo</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="px-4 py-2 grid grid-cols-[1fr,1fr,auto] gap-2 items-center relative z-20">
                            <FilterSelect
                                label="Todos Músculos"
                                value={selectedMuscleFilter}
                                options={Object.values(MuscleGroup)}
                                onChange={setSelectedMuscleFilter}
                                icon={<div className="w-2 h-2 rounded-full bg-primary-500" />}
                            />

                            <FilterSelect
                                label="Todas Cargas"
                                value={selectedEquipmentFilter}
                                options={['Barra', 'Halter', 'Máquina', 'Cabo', 'Peso do Corpo', 'Elástico']}
                                onChange={setSelectedEquipmentFilter}
                                icon={<div className="w-2 h-2 rounded-full bg-indigo-500" />}
                            />

                            {(selectedMuscleFilter !== 'All' || selectedEquipmentFilter !== 'All') && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="h-full px-3 bg-slate-800 border border-slate-700 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 text-slate-400 rounded-xl flex items-center justify-center transition-all"
                                    title="Limpar Filtros"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar space-y-3 bg-slate-950">
                            {filteredExercises.length > 0 ? (
                                filteredExercises.map(exercise => {
                                    const ytId = exercise.videoUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                                    const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

                                    return (
                                        <button
                                            key={exercise.id}
                                            type="button"
                                            onClick={() => setViewingExercise(exercise)}
                                            className="w-full flex flex-row items-stretch gap-3 sm:gap-4 p-2 sm:p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-primary-500/50 hover:bg-slate-800/80 transition-all group shadow-sm text-left overflow-hidden min-h-[80px]"
                                        >
                                            <div className="w-[60px] sm:w-[70px] aspect-[9/16] shrink-0 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative group-hover:border-primary-500/30 transition-colors self-start">
                                                {thumbUrl ? (
                                                    <>
                                                        <img src={thumbUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                                <Video size={10} className="text-white" />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                                                        <Video size={20} className="opacity-20" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 py-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-white font-bold text-sm leading-snug group-hover:text-primary-400 transition-colors line-clamp-2 mb-1.5">{exercise.name}</h4>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 bg-slate-950/50">{exercise.muscleGroup}</span>
                                                        <span className="text-[10px] uppercase font-bold text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/10 truncate max-w-[120px]">{exercise.equipment}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center self-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp className="rotate-90 text-slate-500" size={20} />
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                    <Dumbbell size={32} className="mb-2 opacity-20" />
                                    <p className="font-medium">Nenhum exercício encontrado</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExerciseSelectionModal;
