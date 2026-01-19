import React, { useState, useEffect } from 'react';
import { ChevronLeft, Timer, CheckCircle2, History, ChevronRight, PlayCircle, Plus, Trash2, Video, X, Search, Settings, GripVertical, Layers, Dumbbell, Target, Clock, Play, Activity } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { WorkoutExercise, Exercise } from '@/shared/types';
import { EXERCISE_DB } from '@/shared/data/exercises';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProvider';

// Hooks
import { useSessionTimer } from '../hooks/useSessionTimer';
import { useSessionState, SetDraft } from '../hooks/useSessionState';
import { useExerciseHistory } from '../hooks/useExerciseHistory';
import ExerciseDetailsModal from '../components/ExerciseDetailsModal';
import ExerciseSelectionModal from '../components/ExerciseSelectionModal';

// --- Helper Functions ---
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

import { DraggableExerciseCard } from '../components/DraggableExerciseCard';

// --- Main Component ---
const WorkoutSession: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');
  const clientId = searchParams.get('clientId');

  // --- Hooks ---
  const timer = useSessionTimer();
  const session = useSessionState({
    templateId,
    initialEditMode: searchParams.get('mode') === 'adapt'
  });
  const history = useExerciseHistory();

  // Modal States
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [viewingDetailExercise, setViewingDetailExercise] = useState<Exercise | null>(null);
  const [viewingDetailIndex, setViewingDetailIndex] = useState<number | null>(null);


  // Force sync with URL param (Robust for HashRouter)
  useEffect(() => {
    if (searchParams.get('mode') === 'adapt' || window.location.hash.includes('mode=adapt')) {
      session.setIsEditing(true);
    }
  }, [searchParams]);

  const handleFinish = async () => {
    if (!session.template || !clientId || !user) return;

    const completedExercises: any[] = [];
    Object.keys(session.logs).forEach((key) => {
      const idx = parseInt(key);
      const exerciseLogs = session.logs[idx];
      const validSets = exerciseLogs.filter(s => s.completed && s.weight && s.reps);

      if (validSets.length > 0) {
        const setDetails = validSets.map(s => ({
          weight: parseFloat(s.weight),
          reps: parseFloat(s.reps),
          rir: s.rir || '0'
        }));
        completedExercises.push({
          name: session.template!.exercises[idx].name,
          muscleGroup: session.template!.exercises[idx].muscleGroup,
          sets: validSets.length,
          setDetails: setDetails
        });
      }
    });

    const payload = {
      student_id: clientId,
      coach_id: user.id,
      template_id: session.template.id,
      name: session.template.name,
      scheduled_date: new Date().toISOString().split('T')[0],
      completed_at: new Date().toISOString(),
      duration_minutes: Math.floor(timer.elapsedTime / 60),
      exercises: completedExercises,
      status: 'completed',
      rpe: 8
    };

    try {
      const { error } = await supabase.from('workout_sessions').insert(payload);
      if (error) throw error;
      navigate(`/clients/${clientId}`);
    } catch (err: any) {
      alert('Erro ao salvar sessão: ' + err.message);
    }
  };

  const handleCancelAdaptation = () => {
    const mode = searchParams.get('mode');
    if (mode === 'adapt') {
      if (clientId) navigate(`/clients/${clientId}?tab=program`);
      else navigate(-1);
    } else {
      session.setIsEditing(false);
    }
  };

  // --- Loading States ---
  if (session.isLoadingTemplate) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Carregando treino...</p>
      </div>
    );
  }

  if (!session.template) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-white text-xl font-bold mb-2">Treino não encontrado</h2>
        <p className="text-slate-400 mb-4">O treino solicitado não existe ou foi removido.</p>
        <Link to="/" className="text-primary-500 hover:text-primary-400 font-medium">Voltar ao Início</Link>
      </div>
    );
  }

  // --- Editing Mode ---
  if (session.isEditing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center safe-area-top">
          <div className="flex items-center gap-3">
            <button onClick={handleCancelAdaptation} className="p-1 -ml-1 text-slate-400 hover:text-white transition-colors"><ChevronLeft size={24} /></button>
            <h2 className="text-white font-bold text-lg flex items-center gap-2"><Settings size={18} /> Adaptar Sessão</h2>
          </div>
          <button onClick={() => session.setIsEditing(false)} className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Concluir & Iniciar</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <DragDropContext onDragEnd={session.handleOnDragEnd}>
            <Droppable droppableId="exercises">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {session.template!.exercises.map((ex, i) => (
                    <DraggableExerciseCard
                      key={`${ex.id}-${i}`}
                      exercise={ex}
                      index={i}
                      onRemove={session.handleRemoveExercise}
                      onUpdate={session.handleUpdateExercise}
                      onSwap={session.handleSwapAlternative}
                      onOpenDetails={(exercise, index) => {
                        setViewingDetailExercise(exercise);
                        setViewingDetailIndex(index);
                        setShowAddExerciseModal(true);
                      }}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <button onClick={() => setShowAddExerciseModal(true)} className="w-full py-4 rounded-xl border-2 border-dashed border-slate-800 text-slate-500 font-bold hover:bg-slate-900 flex items-center justify-center gap-2 transition-all">
            <Plus size={20} /> Adicionar Exercício
          </button>
          <div className="h-20"></div>
        </div>

        <ExerciseSelectionModal
          isOpen={showAddExerciseModal}
          onClose={() => setShowAddExerciseModal(false)}
          onSelect={(exercise) => {
            session.handleAddExercise(exercise);
            setShowAddExerciseModal(false);
          }}
          exercises={EXERCISE_DB}
          initialViewingExercise={viewingDetailExercise}
          workoutContext={viewingDetailIndex !== null && session.template ? session.template.exercises[viewingDetailIndex] : undefined}
          onUpdateWorkoutContext={(updates) => {
            if (session.template && viewingDetailIndex !== null) {
              // Iterate over updates to update each field individually using handleUpdateTarget
              Object.entries(updates).forEach(([key, value]) => {
                session.handleUpdateTarget(viewingDetailIndex, key as keyof WorkoutExercise, value);
              });
            }
          }}
          onReplace={(exercise) => {
            if (viewingDetailIndex !== null) {
              session.handleReplaceExercise(viewingDetailIndex, exercise);
            }
          }}
          onAddAlternative={(exercise) => {
            if (viewingDetailIndex !== null) {
              session.handleAddAlternative(viewingDetailIndex, exercise);
            }
          }}
          onRemove={() => {
            if (viewingDetailIndex !== null && session.template) {
              const exercise = session.template.exercises[viewingDetailIndex];
              const alternatives = exercise.alternatives || [];

              if (alternatives.length > 0) {
                // Promote first alternative to be the new Main
                const newMain = alternatives[0];
                const otherAlternatives = alternatives.slice(1);

                const updatedExercise = {
                  ...newMain,
                  sets: exercise.sets,
                  targetReps: exercise.targetReps,
                  targetRIR: exercise.targetRIR,
                  restSeconds: exercise.restSeconds,
                  alternatives: otherAlternatives
                };

                session.handleUpdateExercise(viewingDetailIndex, updatedExercise);
              } else {
                // No alternatives? Just remove the slot.
                session.handleRemoveExercise(viewingDetailIndex);
              }
              setShowAddExerciseModal(false);
            }
          }}
        />



      </div>
    );
  }

  // --- Session Mode ---
  const { currentExercise, currentLogs } = session;
  if (!currentExercise) return null;

  const ytID = currentExercise.videoUrl ? getYouTubeID(currentExercise.videoUrl) : null;
  const thumbnailUrl = ytID ? `https://img.youtube.com/vi/${ytID}/0.jpg` : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4 flex justify-between items-center">
        <Link to={`/clients/${clientId}?tab=program`} className="text-slate-400 hover:text-white"><ChevronLeft size={24} /></Link>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-white font-bold text-sm">{session.template.name}</h2>
            <button onClick={() => session.setIsEditing(true)} className="text-slate-600 hover:text-amber-500 transition-colors p-1" title="Adaptar Treino"><Settings size={14} /></button>
          </div>
          <p className="text-slate-500 text-xs font-mono">{timer.formatTime(timer.elapsedTime)} decorrido</p>
        </div>
        <button onClick={handleFinish} className="text-emerald-500 font-semibold text-sm hover:text-emerald-400">Finalizar</button>
      </div>

      {/* Rest Timer Overlay */}
      {timer.timerActive && (
        <div className="sticky top-[60px] z-40 bg-slate-800 border-y border-slate-700 px-4 py-3 flex justify-between items-center shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Timer size={24} className="text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
            <div>
              <span className="font-mono font-bold text-xl text-white block leading-none">{timer.formatTime(timer.restTimer)}</span>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Descanso</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>
            <div className="text-xs text-slate-400">Alvo: <span className="text-white font-mono">{timer.formatTime(currentExercise.restSeconds)}</span></div>
          </div>
          <button onClick={timer.stopRestTimer} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Pular</button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <button onClick={() => { session.navigateExercise('prev'); timer.stopRestTimer(); }} disabled={session.currentExerciseIndex === 0} className="disabled:opacity-30 p-2 hover:bg-slate-900 rounded-full"><ChevronLeft size={24} /></button>
          <span className="font-mono">Exercício {session.currentExerciseIndex + 1} / {session.template.exercises.length}</span>
          <button onClick={() => { session.navigateExercise('next'); timer.stopRestTimer(); }} disabled={session.currentExerciseIndex === session.template.exercises.length - 1} className="disabled:opacity-30 p-2 hover:bg-slate-900 rounded-full"><ChevronRight size={24} /></button>
        </div>

        {/* Current Exercise Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-start gap-3 mb-3">
              {currentExercise.videoUrl && (
                <div onClick={() => setShowVideoModal(true)} className="w-20 h-14 shrink-0 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden relative group cursor-pointer">
                  {thumbnailUrl ? <img src={thumbnailUrl} alt="Video" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /> : <div className="w-full h-full flex items-center justify-center bg-slate-900"><Video size={20} className="text-slate-500" /></div>}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent"><PlayCircle size={24} className="text-white/90 fill-black/50" /></div>
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h1 className="text-xl font-bold text-white leading-tight">{currentExercise.name}</h1>
                  <button onClick={() => history.fetchHistory(clientId || '', currentExercise.name)} className="text-slate-500 hover:text-primary-400 p-1 hover:bg-slate-800 rounded-lg transition-colors"><History size={22} /></button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">Alvo: <span className="text-white font-medium">{currentExercise.targetReps} reps</span></div>
              <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">RIR: <span className="text-amber-500 font-bold">{currentExercise.targetRIR}</span></div>
              <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">Desc: <span className="text-blue-400 font-medium">{currentExercise.restSeconds}s</span></div>
            </div>

            {/* Alternatives Navigation (Cycle Button) */}
            {(currentExercise.alternatives && currentExercise.alternatives.length > 0) && (
              <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
                <button
                  onClick={() => session.handleSwapAlternative(session.currentExerciseIndex, 0)}
                  className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg flex items-center justify-center gap-2 text-primary-400 font-medium transition-all active:scale-[0.99]"
                >
                  <Layers size={14} />
                  <span>Ver alternativa ({currentExercise.alternatives.length})</span>
                  <ChevronRight size={16} />
                </button>
                {/* Pagination Dots */}
                <div className="flex gap-1.5">
                  {/* Active Dot (Always first because Main is always active slot) */}
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50"></div>
                  {/* Dots for alternatives in queue */}
                  {currentExercise.alternatives.map((_, idx) => (
                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-slate-700/50"></div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2 space-y-1">
              <div className="grid grid-cols-12 gap-2 px-2 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-center">
                <div className="col-span-1 flex items-center justify-center">Série</div>
                <div className="col-span-4">kg</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2">RIR</div>
                <div className="col-span-2"></div>
              </div>

              {currentLogs.map((set, idx) => (
                <div key={idx} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-all duration-200 ${set.completed ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-slate-950 border border-slate-800'}`}>
                  <div className="col-span-1 text-center font-bold text-slate-500 text-sm">{idx + 1}</div>
                  <div className="col-span-4"><input type="number" placeholder="-" value={set.weight} onChange={(e) => session.updateSet(idx, 'weight', e.target.value)} className={`w-full bg-slate-800 text-center p-3 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none text-lg font-bold ${set.completed ? 'text-emerald-100' : 'text-white'}`} /></div>
                  <div className="col-span-3"><input type="number" placeholder="-" value={set.reps} onChange={(e) => session.updateSet(idx, 'reps', e.target.value)} className={`w-full bg-slate-800 text-center p-3 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none text-lg font-bold ${set.completed ? 'text-emerald-100' : 'text-white'}`} /></div>
                  <div className="col-span-2"><input type="number" placeholder="-" value={set.rir} onChange={(e) => session.updateSet(idx, 'rir', e.target.value)} className="w-full bg-slate-800 text-amber-500 text-center p-3 rounded-lg border border-transparent focus:border-amber-500 focus:outline-none text-lg font-bold placeholder-amber-900/50" /></div>
                  <div className="col-span-2 flex justify-center gap-1">
                    <button onClick={() => session.removeSet(idx)} className="h-10 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    <button onClick={() => session.toggleSetComplete(idx, timer.startRestTimer)} className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-lg active:scale-95 ${set.completed ? 'bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}><CheckCircle2 size={22} fill={set.completed ? "currentColor" : "none"} /></button>
                  </div>
                </div>
              ))}

              <button onClick={session.addSet} className="w-full py-4 text-sm font-medium text-slate-400 hover:text-primary-400 hover:bg-slate-800/50 hover:border-primary-500/30 border border-dashed border-slate-800 rounded-lg mt-3 flex items-center justify-center gap-2 transition-all"><Plus size={18} /> Adicionar Série</button>
            </div>
          </div>

          {/* Next Exercise Preview */}
          {session.currentExerciseIndex < session.template.exercises.length - 1 && (
            <div onClick={() => { session.navigateExercise('next'); timer.stopRestTimer(); }} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">A Seguir</p><p className="text-white font-medium">{session.template.exercises[session.currentExerciseIndex + 1].name}</p></div>
              <ChevronRight className="text-slate-500" />
            </div>
          )}
        </div>

      </div>

      {/* History Modal */}
      {history.showHistoryModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl md:rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div><h3 className="text-white font-bold">Carga Histórica</h3><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{currentExercise.name}</p></div>
              <button onClick={history.closeHistoryModal} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {history.isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 text-sm">Carregando histórico...</p>
                </div>
              ) : history.exerciseHistory.length > 0 ? (
                history.exerciseHistory.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-800/50 px-3 py-2 flex justify-between items-center border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300">{item.date}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{item.setDetails.length} Séries</span>
                    </div>
                    <div className="p-2">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold text-slate-600 mb-1"><span>kg</span><span>Reps</span><span>RIR</span></div>
                      {item.setDetails.map((set: any, sIdx: number) => (
                        <div key={sIdx} className="grid grid-cols-3 gap-2 text-center text-sm py-1 border-t border-slate-800/50 first:border-0">
                          <span className="text-white font-mono">{set.weight}</span>
                          <span className="text-slate-300 font-mono">{set.reps}</span>
                          <span className="text-amber-500 font-bold font-mono">{set.rir}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12"><History size={48} className="text-slate-800 mx-auto mb-4 opacity-50" /><p className="text-slate-500">Nenhum histórico encontrado para este exercício.</p></div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50"><button onClick={history.closeHistoryModal} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">Fechar</button></div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && currentExercise.videoUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-white/10"><X size={32} /></button>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-800">
            {ytID ? (
              <iframe width="100%" height="100%" src={`https://www.youtube-nocookie.com/embed/${ytID}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`} title={currentExercise.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="border-0"></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500"><Video size={48} className="mb-4" /><p>Formato de vídeo não suportado para embed direto.</p><a href={currentExercise.videoUrl} target="_blank" rel="noreferrer" className="mt-4 text-primary-400 underline">Abrir link externo</a></div>
            )}
          </div>
          <h3 className="text-white font-bold text-lg mt-4">{currentExercise.name}</h3>
        </div>
      )}

    </div>
  );
};

export default WorkoutSession;