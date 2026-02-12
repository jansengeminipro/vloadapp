import React, { useState } from 'react';
import { History, ChevronDown, Calendar, Layers, Dumbbell, Edit2, Trash2, Save, X, Plus, Battery, Clock } from 'lucide-react';
import { SavedSession } from '@/shared/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { deleteSession, updateSession } from '@/features/clients/api/clientHistoryService';

interface ClientHistoryProps {
    sessions: SavedSession[];
    setSessions: (sessions: SavedSession[]) => void;
}

const ClientHistory: React.FC<ClientHistoryProps> = ({ sessions, setSessions }) => {
    const { user } = useAuth();
    const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingExerciseIdx, setEditingExerciseIdx] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<SavedSession | null>(null);

    const toggleHistoryCard = (sessionId: string) => {
        if (editingId === sessionId) return;

        setExpandedHistoryIds(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const handleDeleteSession = async (sid: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta sessão de histórico? Esta ação não pode ser desfeita.')) return;

        if (!user) {
            alert('Usuário não autenticado.');
            return;
        }

        try {
            console.log('Attempting to delete session:', sid);
            await deleteSession(sid);

            console.log('Session deleted successfully');
            setSessions(sessions.filter(s => s.id !== sid));
        } catch (err: any) {
            console.error('Full delete error:', err);
            alert(`Erro ao excluir sessão: ${err.message || 'Erro desconhecido'}`);
        }
    };

    const handleStartEdit = (session: SavedSession, exerciseIdx: number | null = null) => {
        setEditingId(session.id);
        setEditingExerciseIdx(exerciseIdx);
        setEditForm(JSON.parse(JSON.stringify(session)));
        if (!expandedHistoryIds.includes(session.id)) {
            setExpandedHistoryIds(prev => [...prev, session.id]);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingExerciseIdx(null);
        setEditForm(null);
    };

    const handleSaveSessionEdit = async () => {
        if (!editForm || !user) return;

        try {
            // Recalculate session totals from the already updated exercise fields
            const totalSets = editForm.details.reduce((acc: number, ex: any) => acc + (ex.sets || 0), 0);
            const volumeLoad = editForm.details.reduce((acc: number, ex: any) => acc + (ex.volumeLoad || 0), 0);

            await updateSession({
                id: editForm.id,
                coach_id: user.id,
                date: editForm.date,
                durationSeconds: editForm.durationSeconds,
                details: editForm.details,
                rpe: editForm.rpe
            });

            const updatedSession: SavedSession = {
                ...editForm,
                totalSets,
                volumeLoad
            };

            const updatedSessionsList = sessions.map(s => s.id === updatedSession.id ? updatedSession : s)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setSessions(updatedSessionsList);
            setEditingId(null);
            setEditingExerciseIdx(null);
            setEditForm(null);
        } catch (err: any) {
            alert('Erro ao salvar edição: ' + err.message);
        }
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: string, value: string) => {
        if (!editForm) return;
        const newDetails = [...editForm.details];
        const newEx = { ...newDetails[exIndex] };
        const newSetDetails = [...(newEx.setDetails || [])];

        newSetDetails[setIndex] = { ...newSetDetails[setIndex], [field]: value };
        newEx.setDetails = newSetDetails;

        // Update exercise volume load in real-time
        newEx.volumeLoad = newSetDetails.reduce((acc: number, set: any) =>
            acc + ((parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)), 0
        );

        newDetails[exIndex] = newEx;
        setEditForm({ ...editForm, details: newDetails });
    };

    const handleRemoveSet = (exIndex: number, setIndex: number) => {
        if (!editForm) return;
        const newDetails = [...editForm.details];
        const newEx = { ...newDetails[exIndex] };
        const newSetDetails = [...(newEx.setDetails || [])];

        newSetDetails.splice(setIndex, 1);
        newEx.setDetails = newSetDetails;
        newEx.sets = newSetDetails.length;

        // Update exercise volume load in real-time
        newEx.volumeLoad = newSetDetails.reduce((acc: number, set: any) =>
            acc + ((parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)), 0
        );

        newDetails[exIndex] = newEx;
        setEditForm({ ...editForm, details: newDetails });
    };

    const handleAddSet = (exIndex: number) => {
        if (!editForm) return;
        const newDetails = [...editForm.details];
        const newEx = { ...newDetails[exIndex] };
        const newSetDetails = [...(newEx.setDetails || [])];

        const lastSet = newSetDetails[newSetDetails.length - 1] || { weight: '', reps: '', rir: '' };
        newSetDetails.push({ ...lastSet });

        newEx.setDetails = newSetDetails;
        newEx.sets = newSetDetails.length;

        // Update exercise volume load in real-time
        newEx.volumeLoad = newSetDetails.reduce((acc: number, set: any) =>
            acc + ((parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)), 0
        );

        newDetails[exIndex] = newEx;
        setEditForm({ ...editForm, details: newDetails });
    };

    return (
        <div className="space-y-4 animate-in fade-in pb-12">
            {sessions.filter(s => s.status !== 'pending').length === 0 ? (
                <div className="text-center py-16 text-surface-500 bg-surface-900/30 rounded-2xl border border-dashed border-surface-700 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center opacity-50">
                        <History size={32} className="text-surface-400" />
                    </div>
                    <div>
                        <p className="font-medium text-surface-300">Nenhum histórico disponível</p>
                        <p className="text-xs text-surface-500 mt-1">Os treinos finalizados aparecerão aqui.</p>
                    </div>
                </div>
            ) : (
                sessions.filter(s => s.status !== 'pending').map(session => {
                    const isExpanded = expandedHistoryIds.includes(session.id);
                    const isEditing = editingId === session.id;

                    return (
                        <div key={session.id} className={`bg-surface-800 border ${isEditing ? 'border-primary-500 ring-1 ring-primary-500/20 shadow-lg shadow-primary-900/10' : 'border-white/5 hover:border-white/10'} rounded-xl overflow-hidden transition-all shadow-sm backdrop-blur-sm`}>
                            {/* Card Header */}
                            <div className={`p-4 flex items-center justify-between hover:bg-surface-700/30 transition-colors ${isExpanded && !isEditing ? 'border-b border-white/5' : ''}`}>
                                <div className="flex-1 cursor-pointer" onClick={() => toggleHistoryCard(session.id)}>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <h3 className="text-base font-bold text-white tracking-tight font-display">{session.templateName}</h3>
                                        <ChevronDown size={16} className={`text-surface-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary-400' : ''}`} />
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-surface-400 font-bold uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-surface-500" />
                                            {new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        </span>
                                        <span className="w-1 h-1 bg-surface-600 rounded-full"></span>
                                        <span className="flex items-center gap-1.5">
                                            <Layers size={12} className="text-surface-500" />
                                            {session.totalSets || 0} Séries
                                        </span>
                                        <span className="w-1 h-1 bg-surface-600 rounded-full"></span>
                                        <span className="flex items-center gap-1.5">
                                            <Dumbbell size={12} className="text-surface-500" />
                                            {(session.volumeLoad || 0).toLocaleString()}kg
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {!isEditing && (
                                        <>
                                            <button onClick={() => handleStartEdit(session)} className="p-2 text-surface-400 hover:text-primary-400 hover:bg-surface-700 rounded-lg transition-colors border border-transparent hover:border-white/5" title="Editar Sessão">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={(e) => handleDeleteSession(e, session.id)} className="p-2 text-surface-400 hover:text-red-400 hover:bg-surface-700 rounded-lg transition-colors border border-transparent hover:border-white/5" title="Excluir Sessão">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expandable Content Body */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-6 pt-4 bg-surface-900/30">
                                    {isEditing && editForm ? (
                                        <div className="space-y-6 animate-in slide-in-from-top-2">
                                            <div className="flex justify-between items-start md:items-center pb-4 border-b border-white/5 flex-col md:flex-row gap-4 md:gap-0">
                                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                                    <div className="w-full md:w-auto">
                                                        <label className="text-[10px] uppercase font-bold text-surface-500 block mb-1 tracking-wider">Data</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={new Date(editForm.date).toISOString().slice(0, 16)}
                                                            onChange={e => setEditForm({ ...editForm, date: new Date(e.target.value).toISOString() })}
                                                            className="w-full md:w-auto bg-surface-950 border border-white/10 rounded p-1.5 text-xs text-white focus:border-primary-500 outline-none transition-colors [color-scheme:dark]"
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-auto">
                                                        <label className="text-[10px] uppercase font-bold text-surface-500 block mb-1 tracking-wider">Duração (m)</label>
                                                        <input
                                                            type="number"
                                                            value={Math.round(editForm.durationSeconds / 60)}
                                                            onChange={e => setEditForm({ ...editForm, durationSeconds: (parseInt(e.target.value) || 0) * 60 })}
                                                            className="w-full md:w-24 bg-surface-950 border border-white/10 rounded p-1.5 text-xs text-white focus:border-primary-500 outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="hidden md:flex gap-2">
                                                    <button onClick={handleCancelEdit} className="text-surface-400 hover:text-white px-3 py-1.5 text-xs font-bold border border-white/10 hover:border-white/20 rounded-lg transition-colors">Cancelar</button>
                                                    <button onClick={handleSaveSessionEdit} className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg shadow-primary-900/20 transition-colors"><Save size={14} /> Salvar</button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {editForm.details.map((ex: any, exIdx: number) => {
                                                    const isExEditing = editingExerciseIdx === exIdx;
                                                    return (
                                                        <div key={exIdx} className={`rounded-xl border transition-all ${isExEditing ? 'bg-surface-900 border-primary-500/30' : 'bg-surface-900/40 border-white/5 hover:border-white/10'}`}>
                                                            {/* Exercise Edit Header - Toggle Accordion */}
                                                            <div
                                                                className="p-4 flex justify-between items-center cursor-pointer"
                                                                onClick={() => setEditingExerciseIdx(isExEditing ? null : exIdx)}
                                                            >
                                                                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${isExEditing ? 'bg-primary-500/10 border-primary-500/20' : 'bg-surface-800 border-white/5'}`}>
                                                                        <Dumbbell size={12} className={isExEditing ? "text-primary-500" : "text-surface-500"} />
                                                                    </div>
                                                                    {ex.name}
                                                                </h4>
                                                                <div className="flex items-center gap-3">
                                                                    {!isExEditing && (
                                                                        <div className="text-[10px] text-surface-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                                                            <span className="bg-surface-950 px-1.5 py-0.5 rounded text-surface-400 border border-white/5">{ex.sets} séries</span>
                                                                            <span className="bg-surface-950 px-1.5 py-0.5 rounded text-surface-400 border border-white/5">{(ex.volumeLoad || 0).toLocaleString()}kg</span>
                                                                        </div>
                                                                    )}
                                                                    <ChevronDown size={14} className={`text-surface-600 transition-transform duration-300 ${isExEditing ? 'rotate-180' : ''}`} />
                                                                </div>
                                                            </div>

                                                            {isExEditing && (
                                                                <div className="p-4 pt-0 space-y-2 animate-in fade-in slide-in-from-top-2">
                                                                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-surface-500 px-1 mb-1 tracking-wider">
                                                                        <div className="col-span-1 text-center">#</div>
                                                                        <div className="col-span-3 text-center">Carga (kg)</div>
                                                                        <div className="col-span-3 text-center">Reps</div>
                                                                        <div className="col-span-3 text-center">RIR</div>
                                                                        <div className="col-span-2 text-center">Ação</div>
                                                                    </div>
                                                                    {(ex.setDetails || []).map((set: any, sIdx: number) => (
                                                                        <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                                                                            <div className="col-span-1 text-center text-xs text-surface-500 font-mono">{sIdx + 1}</div>
                                                                            <div className="col-span-3">
                                                                                <input type="number" value={set.weight} onChange={e => handleSetChange(exIdx, sIdx, 'weight', e.target.value)} className="w-full bg-surface-950 border border-white/10 rounded p-1 text-center text-xs text-white focus:border-primary-500 outline-none transition-colors" />
                                                                            </div>
                                                                            <div className="col-span-3">
                                                                                <input type="number" value={set.reps} onChange={e => handleSetChange(exIdx, sIdx, 'reps', e.target.value)} className="w-full bg-surface-950 border border-white/10 rounded p-1 text-center text-xs text-white focus:border-primary-500 outline-none transition-colors" />
                                                                            </div>
                                                                            <div className="col-span-3">
                                                                                <input type="number" value={set.rir} onChange={e => handleSetChange(exIdx, sIdx, 'rir', e.target.value)} className="w-full bg-surface-950 border border-white/10 rounded p-1 text-center text-xs text-amber-500 font-bold focus:border-amber-500 outline-none transition-colors" />
                                                                            </div>
                                                                            <div className="col-span-2 flex justify-center">
                                                                                <button onClick={() => handleRemoveSet(exIdx, sIdx)} className="text-surface-600 hover:text-red-500 p-1 transition-colors"><X size={14} /></button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <button onClick={() => handleAddSet(exIdx)} className="w-full py-2 mt-2 text-[10px] font-bold text-surface-500 hover:text-primary-400 hover:bg-surface-800 rounded border border-dashed border-white/10 flex items-center justify-center gap-1 transition-colors">
                                                                        <Plus size={12} /> Adicionar Série
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <div className="flex md:hidden gap-2 pt-4 border-t border-white/5 sticky bottom-0 bg-surface-800/95 backdrop-blur py-4 -mx-6 px-6 shadow-2xl z-10">
                                                    <button onClick={handleCancelEdit} className="flex-1 text-surface-400 hover:text-white px-3 py-3 text-xs font-bold border border-white/10 rounded-lg bg-surface-900 transition-colors">Cancelar</button>
                                                    <button onClick={handleSaveSessionEdit} className="flex-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-lg shadow-primary-900/20 transition-colors"><Save size={14} /> Salvar</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 animate-in fade-in duration-300">
                                            {session.details.map((ex: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm p-3 bg-surface-900/30 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-surface-200 font-display text-sm">{ex.name}</span>
                                                        {ex.setDetails && ex.setDetails.length > 0 && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-surface-500 font-medium uppercase tracking-wider flex items-center gap-2">
                                                                    <span className="bg-surface-950 px-1.5 py-0.5 rounded text-surface-400 border border-white/5">{ex.sets} Sets</span>
                                                                    <span className="bg-surface-950 px-1.5 py-0.5 rounded text-surface-400 border border-white/5">{(ex.volumeLoad || 0).toLocaleString()}kg Vol</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-[10px] text-surface-500 font-bold uppercase tracking-wider bg-surface-950 px-2 py-1 rounded border border-white/5">
                                                                Max: <span className="text-white">{ex.setDetails ? Math.max(...ex.setDetails.map((s: any) => parseFloat(s.weight) || 0)) : 0}kg</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleStartEdit(session, idx)}
                                                            className="p-1.5 text-surface-500 hover:text-primary-400 hover:bg-surface-800 rounded transition-all opacity-0 group-hover:opacity-100"
                                                            title="Editar este exercício"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-surface-500">
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-1.5"><Clock size={14} /> {Math.floor(session.durationSeconds / 60)} min</div>
                                                    <div className="flex items-center gap-1.5"><Battery size={14} className={session.totalSets > 20 ? 'text-amber-500' : 'text-surface-500'} /> Intensidade: {session.totalSets > 20 ? 'Alta' : 'Moderada'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ClientHistory;
