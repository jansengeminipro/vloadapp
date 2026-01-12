import React, { useState } from 'react';
import { History, ChevronDown, Calendar, Layers, Dumbbell, Edit2, Trash2, Save, X, Plus, Battery, Clock } from 'lucide-react';
import { SavedSession } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProvider';

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
        if (!window.confirm('Excluir sessão?') || !user) return;

        try {
            const { error } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', sid)
                .eq('coach_id', user.id);

            if (error) throw error;

            setSessions(sessions.filter(s => s.id !== sid));
        } catch (err: any) {
            alert('Erro ao excluir sessão: ' + err.message);
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

            const updatedPayload = {
                scheduled_date: new Date(editForm.date).toISOString().split('T')[0],
                completed_at: editForm.date,
                duration_minutes: Math.round(editForm.durationSeconds / 60),
                exercises: editForm.details,
                rpe: editForm.rpe
            };

            const { error } = await supabase
                .from('workout_sessions')
                .update(updatedPayload)
                .eq('id', editForm.id)
                .eq('coach_id', user.id);

            if (error) throw error;

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
        <div className="space-y-4">
            {sessions.filter(s => s.status !== 'pending').length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhum histórico de treino finalizado encontrado.</p>
                </div>
            ) : (
                sessions.filter(s => s.status !== 'pending').map(session => {
                    const isExpanded = expandedHistoryIds.includes(session.id);
                    const isEditing = editingId === session.id;

                    return (
                        <div key={session.id} className={`bg-slate-800 border ${isEditing ? 'border-primary-500 ring-1 ring-primary-500/20' : 'border-slate-700'} rounded-xl overflow-hidden transition-all shadow-sm`}>
                            {/* Card Header */}
                            <div className={`p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors ${isExpanded && !isEditing ? 'border-b border-slate-700' : ''}`}>
                                <div className="flex-1 cursor-pointer" onClick={() => toggleHistoryCard(session.id)}>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-base font-bold text-white">{session.templateName}</h3>
                                        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary-400' : ''}`} />
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        <span>{new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>{session.totalSets || 0} Séries</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>{(session.volumeLoad || 0).toLocaleString()}kg</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {!isEditing && (
                                        <>
                                            <button onClick={() => handleStartEdit(session)} className="p-2 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded-lg transition-colors" title="Editar Sessão">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteSession(session.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-700 rounded-lg transition-colors" title="Excluir Sessão">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expandable Content Body */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-6 pt-4 bg-slate-800/50">
                                    {isEditing && editForm ? (
                                        <div className="space-y-6 animate-in slide-in-from-top-2">
                                            <div className="flex justify-between items-start md:items-center pb-4 border-b border-slate-700 flex-col md:flex-row gap-4 md:gap-0">
                                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                                    <div className="w-full md:w-auto">
                                                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Data</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={new Date(editForm.date).toISOString().slice(0, 16)}
                                                            onChange={e => setEditForm({ ...editForm, date: new Date(e.target.value).toISOString() })}
                                                            className="w-full md:w-auto bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-primary-500 outline-none [color-scheme:dark]"
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-auto">
                                                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Duração (m)</label>
                                                        <input
                                                            type="number"
                                                            value={Math.round(editForm.durationSeconds / 60)}
                                                            onChange={e => setEditForm({ ...editForm, durationSeconds: (parseInt(e.target.value) || 0) * 60 })}
                                                            className="w-full md:w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-primary-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="hidden md:flex gap-2">
                                                    <button onClick={handleCancelEdit} className="text-slate-400 hover:text-white px-3 py-1.5 text-xs font-medium border border-slate-700 rounded-lg">Cancelar</button>
                                                    <button onClick={handleSaveSessionEdit} className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg shadow-primary-900/20"><Save size={14} /> Salvar</button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {editForm.details.map((ex: any, exIdx: number) => {
                                                    const isExEditing = editingExerciseIdx === exIdx;
                                                    return (
                                                        <div key={exIdx} className={`rounded-xl border transition-all ${isExEditing ? 'bg-slate-900 border-primary-500/50 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                                                            {/* Exercise Edit Header - Toggle Accordion */}
                                                            <div
                                                                className="p-4 flex justify-between items-center cursor-pointer"
                                                                onClick={() => setEditingExerciseIdx(isExEditing ? null : exIdx)}
                                                            >
                                                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                                    <Dumbbell size={14} className={isExEditing ? "text-primary-500" : "text-slate-500"} />
                                                                    {ex.name}
                                                                </h4>
                                                                <div className="flex items-center gap-3">
                                                                    {!isExEditing && (
                                                                        <div className="text-[10px] text-slate-500 font-bold uppercase">
                                                                            {ex.sets} séries • {(ex.volumeLoad || 0).toLocaleString()}kg
                                                                        </div>
                                                                    )}
                                                                    <ChevronDown size={14} className={`text-slate-600 transition-transform duration-300 ${isExEditing ? 'rotate-180' : ''}`} />
                                                                </div>
                                                            </div>

                                                            {isExEditing && (
                                                                <div className="p-4 pt-0 space-y-2 animate-in fade-in slide-in-from-top-2">
                                                                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-500 px-1 mb-1">
                                                                        <div className="col-span-1 text-center">#</div>
                                                                        <div className="col-span-3 text-center">Carga (kg)</div>
                                                                        <div className="col-span-3 text-center">Reps</div>
                                                                        <div className="col-span-3 text-center">RIR</div>
                                                                        <div className="col-span-2 text-center">Ação</div>
                                                                    </div>
                                                                    {(ex.setDetails || []).map((set: any, sIdx: number) => (
                                                                        <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                                                                            <div className="col-span-1 text-center text-xs text-slate-500 font-mono">{sIdx + 1}</div>
                                                                            <div className="col-span-3">
                                                                                <input type="number" value={set.weight} onChange={e => handleSetChange(exIdx, sIdx, 'weight', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs text-white focus:border-primary-500 outline-none" />
                                                                            </div>
                                                                            <div className="col-span-3">
                                                                                <input type="number" value={set.reps} onChange={e => handleSetChange(exIdx, sIdx, 'reps', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs text-white focus:border-primary-500 outline-none" />
                                                                            </div>
                                                                            <div className="col-span-3">
                                                                                <input type="number" value={set.rir} onChange={e => handleSetChange(exIdx, sIdx, 'rir', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs text-amber-500 font-bold focus:border-amber-500 outline-none" />
                                                                            </div>
                                                                            <div className="col-span-2 flex justify-center">
                                                                                <button onClick={() => handleRemoveSet(exIdx, sIdx)} className="text-slate-600 hover:text-red-500 p-1"><X size={14} /></button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <button onClick={() => handleAddSet(exIdx)} className="w-full py-2 mt-2 text-[10px] font-bold text-slate-500 hover:text-primary-400 hover:bg-slate-800 rounded border border-dashed border-slate-700 flex items-center justify-center gap-1 transition-colors">
                                                                        <Plus size={12} /> Adicionar Série
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <div className="flex md:hidden gap-2 pt-4 border-t border-slate-700 sticky bottom-0 bg-slate-800/95 backdrop-blur py-4 -mx-6 px-6 shadow-2xl z-10">
                                                    <button onClick={handleCancelEdit} className="flex-1 text-slate-400 hover:text-white px-3 py-3 text-xs font-bold border border-slate-700 rounded-lg bg-slate-900">Cancelar</button>
                                                    <button onClick={handleSaveSessionEdit} className="flex-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-lg shadow-primary-900/20"><Save size={14} /> Salvar</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 animate-in fade-in duration-300">
                                            {session.details.map((ex: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 group">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-200">{ex.name}</span>
                                                        {ex.setDetails && ex.setDetails.length > 0 && (
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] text-slate-500">
                                                                    Sets: <span className="text-slate-400">{ex.sets}</span> •
                                                                    Vol: <span className="text-slate-400">{(ex.volumeLoad || 0).toLocaleString()}kg</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-[10px] text-slate-500">
                                                                Max: {ex.setDetails ? Math.max(...ex.setDetails.map((s: any) => parseFloat(s.weight) || 0)) : 0}kg
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleStartEdit(session, idx)}
                                                            className="p-1.5 text-slate-500 hover:text-primary-400 hover:bg-slate-800 rounded transition-all opacity-0 group-hover:opacity-100"
                                                            title="Editar este exercício"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-1.5"><Clock size={14} /> {Math.floor(session.durationSeconds / 60)} min</div>
                                                    <div className="flex items-center gap-1.5"><Battery size={14} className={session.totalSets > 20 ? 'text-amber-500' : 'text-slate-500'} /> Intensidade: {session.totalSets > 20 ? 'Alta' : 'Moderada'}</div>
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
