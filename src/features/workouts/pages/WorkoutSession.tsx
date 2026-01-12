import React, { useState, useEffect } from 'react';
import { ChevronLeft, Timer, CheckCircle2, History, Save, ChevronRight, PlayCircle, Plus, Trash2, Video, X, Search, Settings, GripVertical, Layers, Dumbbell, Target, Clock, Play } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { WorkoutTemplate, Exercise, WorkoutExercise, MuscleGroup } from '@/shared/types';
import { EXERCISE_DB } from '@/shared/data/exercises';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProvider';

// Set Draft Interface
interface SetDraft {
  weight: string;
  reps: string;
  rir: string;
  completed: boolean;
}

// Helper to extract YouTube ID for embed
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

// Sub-component for Draggable Exercise Item to fix key linting
const DraggableExercise: React.FC<{
  ex: WorkoutExercise;
  index: number;
  onUpdateTarget: (index: number, field: keyof WorkoutExercise, value: any) => void;
  onRemove: (index: number) => void;
}> = ({ ex, index, onUpdateTarget, onRemove }) => {
  const thumbUrl = getThumbnailUrl(ex.videoUrl);
  return (
    <Draggable draggableId={`${ex.id}-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-slate-900 border ${snapshot.isDragging ? 'border-primary-500 shadow-2xl scale-[1.02] z-50' : 'border-slate-800'} rounded-xl p-4 md:p-6 transition-all duration-200 relative group flex flex-col md:flex-row gap-6`}
        >
          {/* Remove Button */}
          <button onClick={() => onRemove(index)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors p-2 z-10">
            <Trash2 size={18} />
          </button>

          {/* Left Section: Drag Handle & Thumbnail */}
          <div className="flex flex-col gap-3 items-center">
            {/* Drag Handle */}
            <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1">
              <GripVertical size={20} />
            </div>

            {/* Thumbnail */}
            <div className="w-full md:w-32 aspect-video bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden relative group/video">
              {thumbUrl ? (
                <>
                  <img src={thumbUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play size={20} className="text-white fill-white opacity-80" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-700">
                  <Video size={20} />
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Info & Controls */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white pr-10">{ex.name}</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{ex.muscleGroup} • {ex.equipment || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5 mb-2"><Layers size={12} /> Séries</label>
                <input
                  type="number"
                  value={ex.sets}
                  onChange={(e) => onUpdateTarget(index, 'sets', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold p-1.5 rounded focus:ring-1 ring-primary-500 outline-none"
                />
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5 mb-2"><Dumbbell size={12} /> Reps</label>
                <input
                  type="text"
                  value={ex.targetReps}
                  onChange={(e) => onUpdateTarget(index, 'targetReps', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold p-1.5 rounded focus:ring-1 ring-primary-500 outline-none"
                />
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                <label className="text-[10px] text-amber-500/80 font-bold uppercase flex items-center gap-1.5 mb-2"><Target size={12} /> RIR Alvo</label>
                <input
                  type="number"
                  value={ex.targetRIR}
                  onChange={(e) => onUpdateTarget(index, 'targetRIR', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-amber-500 font-mono font-bold p-1.5 rounded focus:ring-1 ring-amber-500 outline-none"
                />
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                <label className="text-[10px] text-blue-400/80 font-bold uppercase flex items-center gap-1.5 mb-2"><Clock size={12} /> Descanso (s)</label>
                <input
                  type="number"
                  step={30}
                  value={ex.restSeconds || 0}
                  onChange={(e) => onUpdateTarget(index, 'restSeconds', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-blue-400 font-mono font-bold p-1.5 rounded focus:ring-1 ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const WorkoutSession: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');
  const clientId = searchParams.get('clientId');

  // Load Template from Supabase
  const [template, setTemplate] = useState<WorkoutTemplate | undefined>(undefined);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        setIsLoadingTemplate(false);
        return;
      }
      const { data } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (data) {
        setTemplate({
          id: data.id,
          name: data.name,
          focus: data.focus || 'Geral',
          lastModified: new Date(data.updated_at || data.created_at).toLocaleDateString(),
          exercises: data.exercises || []
        });
      }
      setIsLoadingTemplate(false);
    };
    fetchTemplate();
  }, [templateId]);


  // State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Adaptation Mode State
  const [isEditing, setIsEditing] = useState(() => {
    const mode = searchParams.get('mode');
    return mode === 'adapt';
  });
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Force sync with URL param (Robust for HashRouter)
  useEffect(() => {
    // Check standard search params
    if (searchParams.get('mode') === 'adapt') {
      setIsEditing(true);
    }
    // Fallback: Check raw hash if react-router missed it
    else if (window.location.hash.includes('mode=adapt')) {
      setIsEditing(true);
    }
  }, [searchParams]);


  // Adaptation Handlers
  const handleAddExercise = (exercise: Exercise) => {
    if (!template) return;
    const newExercise: WorkoutExercise = {
      ...exercise,
      sets: 3,
      targetReps: '8-12',
      targetRIR: 2,
      restSeconds: 90
    };

    setLogs({}); // Reset logs to force regeneration
    setTemplate({
      ...template,
      exercises: [...template.exercises, newExercise]
    });
    setShowAddExerciseModal(false);
  };

  const handleRemoveExercise = (index: number) => {
    if (!template) return;
    const newExercises = [...template.exercises];
    newExercises.splice(index, 1);

    setLogs({}); // Reset logs to force regeneration
    setTemplate({
      ...template,
      exercises: newExercises
    });
  };

  const handleUpdateTarget = (index: number, field: keyof WorkoutExercise, value: any) => {
    if (!template) return;
    const newExercises = [...template.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };

    // Note: We don't reset logs here because changing targets doesn't change the number of sets/structure necessarily,
    // but if we changed sets, we might need to.
    if (field === 'sets') {
      setLogs({});
    }

    setTemplate({
      ...template,
      exercises: newExercises
    });
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination || !template) return;

    const items = Array.from(template.exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLogs({}); // Reset logs to ensure correct state mapping
    setTemplate({
      ...template,
      exercises: items
    });
  };


  // Video Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);

  // History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Store logs by exercise index to handle multiple exercises
  const [logs, setLogs] = useState<{ [exerciseIdx: number]: SetDraft[] }>({});

  // Initialize Logs when template loads
  useEffect(() => {
    if (template && Object.keys(logs).length === 0) {
      const initialLogs: { [key: number]: SetDraft[] } = {};
      template.exercises.forEach((ex, idx) => {
        initialLogs[idx] = Array(ex.sets).fill(null).map(() => ({
          weight: '',
          reps: '',
          rir: '',
          completed: false
        }));
      });
      setLogs(initialLogs);
    }
  }, [template]);

  // Global Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Rest Timer
  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = async () => {
    if (!template || !clientId || !user) return;

    const completedExercises: any[] = [];
    Object.keys(logs).forEach((key) => {
      const idx = parseInt(key);
      const exerciseLogs = logs[idx];
      const validSets = exerciseLogs.filter(s => s.completed && s.weight && s.reps);

      if (validSets.length > 0) {
        const setDetails = validSets.map(s => ({
          weight: parseFloat(s.weight),
          reps: parseFloat(s.reps),
          rir: s.rir || '0'
        }));
        completedExercises.push({
          name: template.exercises[idx].name,
          muscleGroup: template.exercises[idx].muscleGroup,
          sets: validSets.length,
          setDetails: setDetails
        });
      }
    });

    const payload = {
      student_id: clientId,
      coach_id: user.id,
      template_id: template.id,
      name: template.name,
      scheduled_date: new Date().toISOString().split('T')[0],
      completed_at: new Date().toISOString(),
      duration_minutes: Math.floor(elapsedTime / 60),
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
    // If we came from the "Adapt & Start" button (URL param mode=adapt), 
    // we should go back to the previous screen (Program Tab)
    const mode = searchParams.get('mode');
    if (mode === 'adapt') {
      if (clientId) {
        navigate(`/clients/${clientId}?tab=program`);
      } else {
        navigate(-1);
      }
    } else {
      // If we just toggled it from inside the session, just close the editor
      setIsEditing(false);
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Carregando treino...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-white text-xl font-bold mb-2">Treino não encontrado</h2>
        <p className="text-slate-400 mb-4">O treino solicitado não existe ou foi removido.</p>
        <Link to="/" className="text-primary-500 hover:text-primary-400 font-medium">Voltar ao Início</Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center safe-area-top">
          <div className="flex items-center gap-3">
            <button onClick={handleCancelAdaptation} className="p-1 -ml-1 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-white font-bold text-lg flex items-center gap-2"><Settings size={18} /> Adaptar Sessão</h2>
          </div>
          <button onClick={() => setIsEditing(false)} className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Concluir & Iniciar</button>
        </div>

        {/* List with Drag & Drop */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="exercises">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {template.exercises.map((ex, i) => (
                    <DraggableExercise
                      key={`${ex.id}-${i}`}
                      ex={ex}
                      index={i}
                      onUpdateTarget={handleUpdateTarget}
                      onRemove={handleRemoveExercise}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <button onClick={() => setShowAddExerciseModal(true)} className="w-full py-4 rounded-xl border-2 border-dashed border-slate-800 text-slate-500 font-bold hover:bg-slate-900 explorer-border flex items-center justify-center gap-2 transition-all">
            <Plus size={20} /> Adicionar Exercício
          </button>
          <div className="h-20"></div> {/* Spacer */}
        </div>

        {/* Add Modal */}
        {showAddExerciseModal && (
          <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col p-4 animate-in fade-in">
            <div className="flex justify-between items-center mb-4 safe-area-top pt-2">
              <h3 className="text-white font-bold text-lg">Adicionar Exercício</h3>
              <button onClick={() => setShowAddExerciseModal(false)} className="text-slate-400 p-2"><X size={24} /></button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nome ou grupo muscular..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500" autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {EXERCISE_DB.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.muscleGroup.toString().toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
                <button key={e.id} onClick={() => handleAddExercise(e)} className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-primary-500/50 hover:bg-slate-800 transition-all flex justify-between items-center group">
                  <div>
                    <h4 className="text-white font-bold text-sm group-hover:text-primary-400 transition-colors">{e.name}</h4>
                    <span className="text-xs text-slate-500">{e.muscleGroup}</span>
                  </div>
                  <Plus size={18} className="text-slate-600 group-hover:text-primary-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentExercise = template.exercises[currentExerciseIndex];
  const currentLogs = logs[currentExerciseIndex] || [];
  const ytID = currentExercise.videoUrl ? getYouTubeID(currentExercise.videoUrl) : null;
  const thumbnailUrl = ytID ? `https://img.youtube.com/vi/${ytID}/0.jpg` : null;

  const updateSet = (setIndex: number, field: keyof SetDraft, value: any) => {
    const newLogs = { ...logs };
    newLogs[currentExerciseIndex][setIndex] = {
      ...newLogs[currentExerciseIndex][setIndex],
      [field]: value
    };
    setLogs(newLogs);
  };

  const toggleSetComplete = (setIndex: number) => {
    const isCompleting = !logs[currentExerciseIndex][setIndex].completed;
    updateSet(setIndex, 'completed', isCompleting);

    if (isCompleting) {
      setRestTimer(0);
      setTimerActive(true);
    }
  };

  const addSet = () => {
    const newLogs = { ...logs };
    // Copy values from previous set if available for convenience
    const prevSet = currentLogs[currentLogs.length - 1];
    newLogs[currentExerciseIndex].push({
      weight: prevSet ? prevSet.weight : '',
      reps: prevSet ? prevSet.reps : '',
      rir: prevSet ? prevSet.rir : '',
      completed: false
    });
    setLogs(newLogs);
  };

  const removeSet = (setIndex: number) => {
    const newLogs = { ...logs };
    newLogs[currentExerciseIndex].splice(setIndex, 1);
    setLogs(newLogs);
  };

  const fetchHistory = async () => {
    if (!clientId || !currentExercise) return;

    setIsLoadingHistory(true);
    setShowHistoryModal(true);

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('completed_at, exercises')
        .eq('student_id', clientId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Extract only sets for this specific exercise
      const historyItems: any[] = [];
      data.forEach(session => {
        const matchingExercise = session.exercises?.find((ex: any) => ex.name === currentExercise.name);
        if (matchingExercise) {
          historyItems.push({
            date: new Date(session.completed_at).toLocaleDateString(),
            setDetails: matchingExercise.setDetails || []
          });
        }
      });

      setExerciseHistory(historyItems);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const navigateExercise = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setTimerActive(false); // Stop rest timer on switch
    } else if (direction === 'next' && currentExerciseIndex < template.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setTimerActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-safe">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4 flex justify-between items-center">
        <Link to={`/clients/${clientId}?tab=program`} className="text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-white font-bold text-sm">{template.name}</h2>
            <button onClick={() => setIsEditing(true)} className="text-slate-600 hover:text-amber-500 transition-colors p-1" title="Adaptar Treino">
              <Settings size={14} />
            </button>
          </div>
          <p className="text-slate-500 text-xs font-mono">{formatTime(elapsedTime)} decorrido</p>
        </div>
        <button
          onClick={handleFinish}
          className="text-emerald-500 font-semibold text-sm hover:text-emerald-400"
        >
          Finalizar
        </button>
      </div>

      {/* Rest Timer Overlay (Sticky) */}
      {timerActive && (
        <div className="sticky top-[60px] z-40 bg-slate-800 border-y border-slate-700 px-4 py-3 flex justify-between items-center shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Timer size={24} className="text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
            <div>
              <span className="font-mono font-bold text-xl text-white block leading-none">{formatTime(restTimer)}</span>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Descanso</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>
            <div className="text-xs text-slate-400">
              Alvo: <span className="text-white font-mono">{formatTime(currentExercise.restSeconds)}</span>
            </div>
          </div>
          <button
            onClick={() => setTimerActive(false)}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Pular
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">

        {/* Navigation / Progress */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <button
            onClick={() => navigateExercise('prev')}
            disabled={currentExerciseIndex === 0}
            className="disabled:opacity-30 p-2 hover:bg-slate-900 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="font-mono">Exercício {currentExerciseIndex + 1} / {template.exercises.length}</span>
          <button
            onClick={() => navigateExercise('next')}
            disabled={currentExerciseIndex === template.exercises.length - 1}
            className="disabled:opacity-30 p-2 hover:bg-slate-900 rounded-full"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Current Exercise Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-start gap-3 mb-3">
              {/* Thumbnail / Video Trigger */}
              {currentExercise.videoUrl && (
                <div
                  onClick={() => setShowVideoModal(true)}
                  className="w-20 h-14 shrink-0 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden relative group cursor-pointer"
                >
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Video" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
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

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h1 className="text-xl font-bold text-white leading-tight">{currentExercise.name}</h1>
                  <button
                    onClick={fetchHistory}
                    className="text-slate-500 hover:text-primary-400 p-1 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <History size={22} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">
                Alvo: <span className="text-white font-medium">{currentExercise.targetReps} reps</span>
              </div>
              <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">
                RIR: <span className="text-amber-500 font-bold">{currentExercise.targetRIR}</span>
              </div>
              <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">
                Desc: <span className="text-blue-400 font-medium">{currentExercise.restSeconds}s</span>
              </div>
            </div>
          </div>

          <div className="p-2 space-y-1">
            {/* Table Header */}
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

                <div className="col-span-4">
                  <input
                    type="number"
                    placeholder="-"
                    value={set.weight}
                    onChange={(e) => updateSet(idx, 'weight', e.target.value)}
                    className={`w-full bg-slate-800 text-center p-3 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none text-lg font-bold ${set.completed ? 'text-emerald-100' : 'text-white'}`}
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="-"
                    value={set.reps}
                    onChange={(e) => updateSet(idx, 'reps', e.target.value)}
                    className={`w-full bg-slate-800 text-center p-3 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none text-lg font-bold ${set.completed ? 'text-emerald-100' : 'text-white'}`}
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="-"
                    value={set.rir}
                    onChange={(e) => updateSet(idx, 'rir', e.target.value)}
                    className="w-full bg-slate-800 text-amber-500 text-center p-3 rounded-lg border border-transparent focus:border-amber-500 focus:outline-none text-lg font-bold placeholder-amber-900/50"
                  />
                </div>

                <div className="col-span-2 flex justify-center gap-1">
                  {/* Delete Button */}
                  <button
                    onClick={() => removeSet(idx)}
                    className="h-10 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Complete Button */}
                  <button
                    onClick={() => toggleSetComplete(idx)}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-lg active:scale-95 ${set.completed ? 'bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}
                  >
                    <CheckCircle2 size={22} fill={set.completed ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addSet}
              className="w-full py-4 text-sm font-medium text-slate-400 hover:text-primary-400 hover:bg-slate-800/50 hover:border-primary-500/30 border border-dashed border-slate-800 rounded-lg mt-3 flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={18} /> Adicionar Série
            </button>
          </div>
        </div>

        {/* Next Exercise Preview */}
        {currentExerciseIndex < template.exercises.length - 1 && (
          <div
            onClick={() => navigateExercise('next')}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">A Seguir</p>
              <p className="text-white font-medium">{template.exercises[currentExerciseIndex + 1].name}</p>
            </div>
            <ChevronRight className="text-slate-500" />
          </div>
        )}

      </div>

      {/* Exercise History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl md:rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="text-white font-bold">Carga Histórica</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{currentExercise.name}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 text-sm">Carregando histórico...</p>
                </div>
              ) : exerciseHistory.length > 0 ? (
                exerciseHistory.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-800/50 px-3 py-2 flex justify-between items-center border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300">{item.date}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{item.setDetails.length} Séries</span>
                    </div>
                    <div className="p-2">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold text-slate-600 mb-1">
                        <span>kg</span>
                        <span>Reps</span>
                        <span>RIR</span>
                      </div>
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
                <div className="text-center py-12">
                  <History size={48} className="text-slate-800 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-500">Nenhum histórico encontrado para este exercício.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Playback Modal */}
      {showVideoModal && currentExercise.videoUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-white/10"
          >
            <X size={32} />
          </button>

          <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-800">
            {ytID ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${ytID}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
                title={currentExercise.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="border-0"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <Video size={48} className="mb-4" />
                <p>Formato de vídeo não suportado para embed direto.</p>
                <a
                  href={currentExercise.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 text-primary-400 underline"
                >
                  Abrir link externo
                </a>
              </div>
            )}
          </div>
          <h3 className="text-white font-bold text-lg mt-4">{currentExercise.name}</h3>
        </div>
      )}
    </div>
  );
};

export default WorkoutSession;