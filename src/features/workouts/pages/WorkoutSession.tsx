import React, { useState, useEffect } from 'react';
import { Timer, History, ChevronRight, Video, X } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { WorkoutExercise, Exercise } from '@/shared/types';
import { EXERCISE_DB } from '@/shared/data/exercises';
import { createSession } from '../api/sessionService';
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
import { SessionHeader } from '../components/session/SessionHeader';
import { ExerciseNavigation } from '../components/session/ExerciseNavigation';
import { ExerciseCard } from '../components/session/ExerciseCard';
import { SetList } from '../components/session/SetList';

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
    templateId
  });
  const history = useExerciseHistory();

  // Modal States
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

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
      await createSession(payload as any);
      navigate(`/clients/${clientId}`);
    } catch (err: any) {
      alert('Erro ao salvar sessão: ' + err.message);
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

  // --- Session Mode ---
  const { currentExercise, currentLogs } = session;
  if (!currentExercise) return null;

  const ytID = currentExercise.videoUrl ? getYouTubeID(currentExercise.videoUrl) : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-safe">
      <SessionHeader
        templateName={session.template.name}
        elapsedTime={timer.formatTime(timer.elapsedTime)}
        clientId={clientId || ''}
        onFinish={handleFinish}
      />

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
        <ExerciseNavigation
          currentIndex={session.currentExerciseIndex}
          totalExercises={session.template.exercises.length}
          onPrev={() => { session.navigateExercise('prev'); timer.stopRestTimer(); }}
          onNext={() => { session.navigateExercise('next'); timer.stopRestTimer(); }}
        />

        {/* Current Exercise Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <ExerciseCard
            exercise={currentExercise}
            exerciseIndex={session.currentExerciseIndex}
            clientId={clientId || ''}
            onShowHistory={() => history.fetchHistory(clientId || '', currentExercise.name)}
            onShowVideo={() => setShowVideoModal(true)}
            onSwapAlternative={session.handleSwapAlternative}
            onReplace={() => setReplacingIndex(session.currentExerciseIndex)}
            onRemove={() => {
              if (window.confirm("Tem certeza que deseja remover este exercício da sessão atual?")) {
                session.handleRemoveExercise(session.currentExerciseIndex);
                // If we removed the last one, it might be tricky, but handleRemove updates the array
                // We might need to adjust index if we exceeded bounds, but useSessionState should safely handle re-renders
                // Ideally navigate back if empty? logic stays same
              }
            }}
          />
          <SetList
            sets={currentLogs}
            onUpdateSet={session.updateSet}
            onToggleComplete={session.toggleSetComplete}
            onRemoveSet={session.removeSet}
            onAddSet={session.addSet}
            onTimerStart={timer.startRestTimer}
          />
        </div>

        {/* Next Exercise Preview */}
        {session.currentExerciseIndex < session.template.exercises.length - 1 && (
          <div onClick={() => { session.navigateExercise('next'); timer.stopRestTimer(); }} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">A Seguir</p><p className="text-white font-medium">{session.template.exercises[session.currentExerciseIndex + 1].name}</p></div>
            <ChevronRight className="text-slate-500" />
          </div>
        )}

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
                      <span className="text-xs uppercase font-bold text-slate-500">{item.setDetails.length} Séries</span>
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

      {/* Replacement Modal */}
      <ExerciseSelectionModal
        isOpen={replacingIndex !== null}
        onClose={() => setReplacingIndex(null)}
        exercises={EXERCISE_DB}
        onSelect={(exercise) => {
          if (replacingIndex !== null) {
            session.handleReplaceExercise(replacingIndex, exercise, true); // preserveTargets = true
            setReplacingIndex(null);
          }
        }}
      />

    </div>
  );
};

export default WorkoutSession;