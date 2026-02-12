import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Save, X, ChevronLeft, Clock, Target, Dumbbell, Layers, LayoutGrid, Anchor, ArrowDown, ChevronUp, ChevronDown, Zap, Box, Video, Play, Link as LinkIcon, UserPlus, Check, AlertCircle, Copy, Calendar, GripVertical, Activity, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { WorkoutTemplate, Exercise, WorkoutExercise, MuscleGroup, Client } from '@/shared/types';
import { EXERCISE_DB } from '@/shared/data/exercises';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProvider';
import { WEEKDAYS } from '@/features/clients/constants';

const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getThumbnailUrl = (url?: string) => {
  if (!url) return null;
  const ytID = getYouTubeID(url);
  if (ytID) return `https://img.youtube.com/vi/${ytID}/0.jpg`;
  return null;
};

const getMuscleIcon = (muscle: string | 'All') => {
  switch (muscle) {
    case MuscleGroup.Chest: return <Box size={18} />;
    case MuscleGroup.Lats:
    case MuscleGroup.UpperBack:
    case MuscleGroup.Traps: return <Anchor size={18} />;
    case MuscleGroup.Quads:
    case MuscleGroup.Hamstrings:
    case MuscleGroup.Calves:
    case MuscleGroup.Glutes:
    case MuscleGroup.Adductors:
    case MuscleGroup.Abductors: return <ArrowDown size={18} />;
    case MuscleGroup.Shoulders: return <ChevronUp size={18} />;
    case MuscleGroup.Biceps:
    case MuscleGroup.Triceps:
    case MuscleGroup.Forearms: return <Zap size={18} />;
    case 'All': return <LayoutGrid size={18} />;
    default: return <Dumbbell size={18} />;
  }
};


import { DraggableExerciseCard } from '../components/DraggableExerciseCard';

/* DraggableWorkoutExercise Removed - Replaced by Shared Component */

import ExerciseSelectionModal from '../components/ExerciseSelectionModal';

const Workouts: React.FC = () => {
  // ... (Keep existing states and fetch logic) ...
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setGlobalError(null);

      // 1. Fetch Templates
      const { data: tmplData, error: tmplError } = await supabase
        .from('workout_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (tmplError) throw tmplError;

      const mappedTemplates: WorkoutTemplate[] = (tmplData || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        focus: t.focus || 'Geral',
        lastModified: new Date(t.updated_at).toLocaleDateString(),
        exercises: t.exercises || []
      }));
      setTemplates(mappedTemplates);

      // 2. Fetch Custom Exercises
      const { data: exData, error: exError } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('coach_id', user.id);

      if (exError) throw exError;

      const mappedExercises: Exercise[] = (exData || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscle_group as MuscleGroup,
        equipment: e.equipment || 'Outros',
        videoUrl: e.video_url,
        agonists: [e.muscle_group],
        synergists: []
      }));
      setCustomExercises(mappedExercises);

    } catch (err: any) {
      console.error('Error fetching workout data:', err);
      setGlobalError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);


  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [viewingDetailExercise, setViewingDetailExercise] = useState<Exercise | null>(null);
  const [viewingDetailIndex, setViewingDetailIndex] = useState<number | null>(null);
  const [searchExercise, setSearchExercise] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({ name: '', muscleGroup: MuscleGroup.Chest, equipment: 'Peso do Corpo' });
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  // Assignment Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [templateToAssign, setTemplateToAssign] = useState<WorkoutTemplate | null>(null);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentDates, setAssignmentDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedScheduleDays, setSelectedScheduleDays] = useState<number[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['student', 'client']) // Match any student role
        .eq('trainer_id', user.id);

      if (error) {
        console.error('Fetch clients error:', error);
        return;
      }

      if (data) {
        const mapped: Client[] = (data || []).map((d: any) => ({
          id: d.id,
          name: d.full_name,
          email: d.email,
          avatarUrl: d.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.full_name || 'Aluno')}&background=random`,
          status: 'active'
        } as any));
        setAvailableClients(mapped);
      }
    };
    if (user) fetchClients();
  }, [user]);

  useEffect(() => {
    const combined = [...customExercises, ...EXERCISE_DB].sort((a, b) => a.name.localeCompare(b.name));
    setAllExercises(combined);
  }, [customExercises]);

  const handleEdit = (template: WorkoutTemplate) => {
    setEditingTemplate({ ...template });
    setView('editor');
  };

  const handleDuplicate = async (template: WorkoutTemplate) => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_templates')
        .insert({
          name: `${template.name} (Cópia)`,
          focus: template.focus,
          exercises: template.exercises,
          coach_id: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newT: WorkoutTemplate = {
        id: data.id,
        name: data.name,
        focus: data.focus,
        lastModified: new Date(data.updated_at).toLocaleDateString(),
        exercises: data.exercises
      };
      setTemplates(prev => [newT, ...prev]);
    } catch (err: any) {
      setGlobalError('Erro ao duplicar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: string) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation && user) {
      try {
        setIsDeleting(true);
        const { error } = await supabase
          .from('workout_templates')
          .delete()
          .eq('id', deleteConfirmation)
          .eq('coach_id', user.id);

        if (error) throw error;

        setTemplates(prev => prev.filter(t => t.id !== deleteConfirmation));
        setDeleteConfirmation(null);
      } catch (err: any) {
        setGlobalError('Erro ao excluir: ' + err.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const openAssignModal = (template: WorkoutTemplate) => {
    setTemplateToAssign(template);
    setSelectedClientIds([]);
    setAssignmentDates({
      startDate: '',
      endDate: ''
    });
    setSelectedScheduleDays([]); // Reset schedule
    setShowAssignModal(true);
  };

  const toggleScheduleDay = (dayVal: number) => {
    setSelectedScheduleDays(prev =>
      prev.includes(dayVal) ? prev.filter(d => d !== dayVal) : [...prev, dayVal].sort()
    );
  };

  const handleAssignToClients = async () => {
    if (!templateToAssign || selectedClientIds.length === 0 || !user) return;

    try {
      setIsAssigning(true);
      setGlobalError(null);
      console.log('Starting assignment for clients:', selectedClientIds);

      // Validate Template ID
      const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (templateToAssign.id.startsWith('new-') || !isUuid(templateToAssign.id)) {
        throw new Error('Salve este modelo de treino primeiro ou utilize um modelo novo da biblioteca para atribuir.');
      }

      for (const clientId of selectedClientIds) {
        // 1. Fetch Active Program
        const { data: activePrograms, error: fetchError } = await supabase
          .from('client_programs')
          .select('*')
          .eq('client_id', clientId)
          .eq('is_active', true);

        if (fetchError) throw fetchError;

        const activeProgram = activePrograms && activePrograms.length > 0 ? activePrograms[0] : null;

        if (activeProgram) {
          // Check if workout already exists to avoid duplication
          const currentIds = activeProgram.workout_ids || [];
          const newIds = currentIds.includes(templateToAssign.id)
            ? currentIds
            : [...currentIds, templateToAssign.id];

          const currentSchedule = activeProgram.schedule_json || {};
          // Merge schedule: overwrite the schedule for THIS specific template, keep others
          const newSchedule = {
            ...currentSchedule,
            [templateToAssign.id]: selectedScheduleDays
          };

          // Only update dates if explicitly provided
          const updates: any = {
            workout_ids: newIds,
            schedule_json: newSchedule
          };
          if (assignmentDates.startDate) updates.start_date = assignmentDates.startDate;
          if (assignmentDates.endDate) updates.end_date = assignmentDates.endDate;

          const { error: updateError } = await supabase
            .from('client_programs')
            .update(updates)
            .eq('id', activeProgram.id);

          if (updateError) throw updateError;
        } else {
          // Create New Program
          const newSchedule = {
            [templateToAssign.id]: selectedScheduleDays
          };

          // Default to today if no date provided for NEW program
          const startDate = assignmentDates.startDate || new Date().toISOString().split('T')[0];

          const { error: insertError } = await supabase
            .from('client_programs')
            .insert({
              client_id: clientId,
              coach_id: user.id,
              name: 'Programa de Treino', // Default name
              is_active: true,
              workout_ids: [templateToAssign.id],
              start_date: startDate,
              end_date: assignmentDates.endDate || null,
              schedule_json: newSchedule
            });

          if (insertError) throw insertError;
        }
      }

      alert(`O treino "${templateToAssign.name}" foi adicionado ao programa de ${selectedClientIds.length} aluno(s).`);
      setShowAssignModal(false);
      setSelectedClientIds([]);
    } catch (err: any) {
      console.error('Assign error details:', err);
      const msg = err.message || 'Erro desconhecido';
      setGlobalError('Não foi possível atribuir: ' + msg);
      alert('Houve um erro: ' + msg);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate({
      id: 'new-' + Date.now(),
      name: 'Novo Modelo de Treino',
      lastModified: new Date().toISOString().split('T')[0],
      focus: 'Geral',
      exercises: []
    });
    setView('editor');
  };

  const handleSave = async () => {
    if (editingTemplate && user) {
      if (!editingTemplate.name) {
        alert("O nome do treino é obrigatório!");
        return;
      }

      setLoading(true);
      setGlobalError(null);

      const templatePayload = {
        name: editingTemplate.name,
        focus: editingTemplate.focus,
        exercises: editingTemplate.exercises,
        coach_id: user.id,
        updated_at: new Date().toISOString()
      };

      try {
        const isNew = editingTemplate.id.startsWith('new-');

        if (isNew) {
          const { data, error } = await supabase
            .from('workout_templates')
            .insert(templatePayload)
            .select()
            .single();

          if (error) throw error;

          const newT = {
            id: data.id,
            name: data.name,
            focus: data.focus,
            lastModified: new Date(data.updated_at).toLocaleDateString(),
            exercises: data.exercises
          };
          setTemplates(prev => [newT, ...prev]);
        } else {
          const { error } = await supabase
            .from('workout_templates')
            .update(templatePayload)
            .eq('id', editingTemplate.id)
            .eq('coach_id', user.id);

          if (error) throw error;

          setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? {
            ...editingTemplate,
            lastModified: new Date().toLocaleDateString()
          } : t));
        }

        setView('list');
        setEditingTemplate(null);
      } catch (err: any) {
        setGlobalError('Erro ao salvar: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ... (Keep addExercise, saveCustomExercise, removeExercise, updateExerciseParam etc.) ...
  const addExercise = (exercise: Exercise) => {
    if (!editingTemplate) return;
    const newExercise: WorkoutExercise = { ...exercise, sets: 3, targetReps: '8-12', targetRIR: 2, restSeconds: 120 };
    setEditingTemplate({ ...editingTemplate, exercises: [...editingTemplate.exercises, newExercise] });
    setShowExerciseModal(false);
  };

  const saveCustomExercise = async () => {
    if (!newExerciseForm.name || !user) return alert("O nome é obrigatório");

    try {
      const { data, error } = await supabase
        .from('custom_exercises')
        .insert({
          name: newExerciseForm.name,
          muscle_group: newExerciseForm.muscleGroup,
          equipment: newExerciseForm.equipment,
          coach_id: user.id,
          video_url: tempVideoUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      const newEx: Exercise = {
        id: data.id,
        name: data.name,
        muscleGroup: data.muscle_group as MuscleGroup,
        equipment: data.equipment,
        agonists: [data.muscle_group],
        synergists: [],
        videoUrl: data.video_url
      };

      setCustomExercises(prev => [...prev, newEx]);
      addExercise(newEx);

      setNewExerciseForm({ name: '', muscleGroup: MuscleGroup.Chest, equipment: 'Peso do Corpo' });
      setTempVideoUrl('');
      setIsCreatingExercise(false);
    } catch (err: any) {
      setGlobalError('Erro ao criar exercício: ' + err.message);
    }
  };

  const removeExercise = (index: number) => {
    if (!editingTemplate) return;
    const newExercises = [...editingTemplate.exercises];
    newExercises.splice(index, 1);
    setEditingTemplate({ ...editingTemplate, exercises: newExercises });
  };

  const updateExerciseParam = (index: number, field: keyof WorkoutExercise, value: any) => {
    if (!editingTemplate) return;
    const newExercises = [...editingTemplate.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setEditingTemplate({ ...editingTemplate, exercises: newExercises });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !editingTemplate) return;
    const items = Array.from(editingTemplate.exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setEditingTemplate({ ...editingTemplate, exercises: items });
  };

  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchExercise.toLowerCase());
    return matchesSearch && (selectedMuscleFilter === 'All' || ex.muscleGroup === selectedMuscleFilter);
  });

  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white font-display tracking-tight">Biblioteca de Treinos</h1>
            <p className="text-surface-400">Gerencie modelos de treino e atribua prescrições.</p>
          </div>
        </div>
        <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95">
          <Plus size={20} /> Criar Modelo
        </button>
      </div>

      {globalError && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{globalError}</span>
          <button onClick={() => setGlobalError(null)} className="ml-auto text-red-400/50 hover:text-red-400"><X size={18} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => {
          const isExpanded = expandedTemplateId === template.id;
          return (
            <div
              key={template.id}
              onClick={() => setExpandedTemplateId(prev => prev === template.id ? null : template.id)}
              className={`bg-surface-800 border rounded-xl p-6 transition-all group relative shadow-lg flex flex-col h-full cursor-pointer hover:border-primary-500/30 ${isExpanded ? 'ring-1 ring-primary-500 border-primary-500/50' : 'border-white/5'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-xl font-bold mb-1 truncate pr-2 transition-colors font-display ${isExpanded ? 'text-primary-400' : 'text-white'}`}>{template.name}</h3>
                  <span className="inline-block bg-surface-700 text-surface-300 text-xs px-2 py-1 rounded">{template.focus}</span>
                </div>
                <div className="flex gap-1 shrink-0 relative z-10">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openAssignModal(template); }}
                    className="p-2 text-surface-400 hover:text-emerald-400 hover:bg-surface-700 rounded-lg transition-colors"
                    title="Atribuir à Agenda"
                  >
                    <UserPlus size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(template); }}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Duplicar"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                    className="p-2 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center text-slate-400 text-sm">
                  <Dumbbell size={16} className="mr-2" /> <span>{template.exercises.length} Exercícios</span>
                </div>
                <div className="flex items-center text-slate-400 text-sm">
                  <Target size={16} className="mr-2" /> <span>{template.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0)} Séries Totais</span>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-white/5 pt-4 mb-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-surface-500 uppercase">Lista de Exercícios</h4>
                    <span className="text-[10px] text-surface-600 font-mono">Séries x Reps</span>
                  </div>
                  <ul className="space-y-2">
                    {template.exercises.map((ex, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-surface-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                        <span className="flex-1">{ex.name}</span>
                        <span className="text-surface-500 text-xs font-mono whitespace-nowrap pt-0.5">{ex.sets} x {ex.targetReps}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={`pt-4 border-t border-white/5 flex justify-between items-center text-xs text-surface-500 ${isExpanded ? 'mt-2' : ''}`}>
                <span>Modificado: {template.lastModified}</span>
                <span className="flex items-center gap-1 text-primary-500/80 font-medium">
                  {isExpanded ? <><ChevronUp size={12} /> Recolher</> : <><ChevronDown size={12} /> Ver detalhes</>}
                </span>
              </div>
            </div>
          );
        })}

        {templates.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <Dumbbell size={48} className="mx-auto mb-4 opacity-10" />
            Nenhum modelo de treino disponível. Clique em "Criar Modelo" para começar.
          </div>
        )}

        {loading && templates.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );

  const handleAddAlternative = (index: number, alternative: Exercise) => {
    if (!editingTemplate) return;
    const newExercises = [...editingTemplate.exercises];
    // Inherit configuration from parent
    const altWorkoutExercise: WorkoutExercise = {
      ...alternative,
      sets: newExercises[index].sets,
      targetReps: newExercises[index].targetReps,
      targetRIR: newExercises[index].targetRIR,
      restSeconds: newExercises[index].restSeconds,
      alternatives: [] // Flatten structure, don't nest alternatives
    };

    const currentAlternatives = newExercises[index].alternatives || [];
    newExercises[index] = {
      ...newExercises[index],
      alternatives: [...currentAlternatives, altWorkoutExercise]
    };

    setEditingTemplate({ ...editingTemplate, exercises: newExercises });
    setShowExerciseModal(false);
  };

  const handleSwapAlternative = (exerciseIndex: number, alternativeIndex: number) => {
    if (!editingTemplate) return;
    const newExercises = [...editingTemplate.exercises];
    const exercise = newExercises[exerciseIndex];
    if (!exercise.alternatives) return; // Should not happen

    // Create copy of alternatives
    const newAlternatives = [...exercise.alternatives];

    // Identify chosen alternative
    const alternative = newAlternatives[alternativeIndex];

    // Prepare old main as alternative (strip its alternatives)
    const oldMainAsAlternative: WorkoutExercise = { ...exercise, alternatives: [] };

    // Swap in Place: Insert old main where the selected alternative was
    newAlternatives[alternativeIndex] = oldMainAsAlternative;

    // Create new main exercise
    const newMain: WorkoutExercise = {
      ...alternative,
      alternatives: newAlternatives
    };

    newExercises[exerciseIndex] = newMain;
    setEditingTemplate({ ...editingTemplate, exercises: newExercises });
  };

  const handleReplaceExercise = (index: number, newEx: Exercise) => {
    if (!editingTemplate) return;
    const newExercises = [...editingTemplate.exercises];
    const oldEx = newExercises[index];
    newExercises[index] = {
      ...newEx,
      sets: oldEx.sets,
      targetReps: oldEx.targetReps,
      targetRIR: oldEx.targetRIR,
      restSeconds: oldEx.restSeconds,
      alternatives: oldEx.alternatives // Preserve alternatives? Or clear? Let's preserve for now to be safe.
    };
    setEditingTemplate({ ...editingTemplate, exercises: newExercises });
    setEditingTemplate({ ...editingTemplate, exercises: newExercises });
    setShowExerciseModal(false);
  };

  const handleUpdateExercise = (index: number, updatedExercise: WorkoutExercise) => {
    if (!editingTemplate) return;
    const newExercises = [...editingTemplate.exercises];
    newExercises[index] = updatedExercise;
    setEditingTemplate({ ...editingTemplate, exercises: newExercises });
  };

  const renderEditorView = () => {
    if (!editingTemplate) return null;
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-surface-950/90 backdrop-blur-md py-4 z-40 border-b border-white/5">
          <div className="flex items-center gap-4 flex-1">
            <button type="button" onClick={() => setView('list')} className="p-2 hover:bg-surface-800 rounded-lg text-surface-400 hover:text-white transition-colors"><ChevronLeft size={24} /></button>
            <input
              type="text"
              value={editingTemplate.name}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
              className="bg-transparent text-xl md:text-2xl font-bold text-white border-none focus:ring-0 placeholder-surface-600 w-full font-display tracking-tight"
              placeholder="Nome do Modelo"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setView('list')} className="px-3 md:px-4 py-2 text-surface-400 hover:text-white text-sm font-medium">Cancelar</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 md:px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Save size={18} /> {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {globalError && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{globalError}</span>
          </div>
        )}

        <div className="bg-surface-900 p-4 rounded-xl border border-white/5 mb-6 flex flex-wrap gap-4 items-center shadow-lg">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-surface-500 uppercase">Foco do Treino:</label>
            <select
              value={editingTemplate.focus}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, focus: e.target.value })}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 ring-primary-500 outline-none"
            >
              <option value="Geral">Geral</option>
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Força">Força</option>
              <option value="Resistência">Resistência</option>
              <option value="Potência">Potência</option>
              <option value="Mobilidade">Mobilidade</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="template-exercises">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {editingTemplate.exercises.map((exercise, index) => (
                    <DraggableExerciseCard
                      key={`${exercise.id}-${index}`}
                      exercise={exercise}
                      index={index}
                      onRemove={removeExercise}
                      onUpdate={handleUpdateExercise}
                      onSwap={handleSwapAlternative}
                      onOpenDetails={(ex, idx) => {
                        setViewingDetailExercise(ex);
                        setViewingDetailIndex(idx);
                        setShowExerciseModal(true);
                      }}
                      getThumbnailUrl={getThumbnailUrl}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <button type="button" onClick={() => { setShowExerciseModal(true); setIsCreatingExercise(false) }} className="w-full py-8 border-2 border-dashed border-surface-700 rounded-xl text-surface-500 hover:text-primary-400 hover:border-primary-500/50 hover:bg-surface-800/30 transition-all flex flex-col items-center justify-center gap-2">
            <Plus size={32} /> <span className="font-medium">Adicionar Exercício</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {view === 'list' ? renderListView() : renderEditorView()}

      {/* Assignment Modal */}
      {showAssignModal && templateToAssign && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-900 border border-white/5 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <UserPlus size={20} className="text-emerald-500" /> Adicionar ao Programa
                </h2>
                <p className="text-xs text-surface-500 truncate max-w-[250px]">Treino: {templateToAssign.name}</p>
              </div>
              <button type="button" onClick={() => setShowAssignModal(false)} className="text-surface-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" size={16} />
                <input
                  type="text"
                  placeholder="Pesquisar aluno..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-full bg-surface-950 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-primary-500 outline-none placeholder-surface-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {availableClients.filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())).map(client => {
                const isSelected = selectedClientIds.includes(client.id);
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientIds(prev =>
                        isSelected ? prev.filter(id => id !== client.id) : [...prev, client.id]
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors border ${isSelected ? 'bg-primary-500/10 border-primary-500/30' : 'hover:bg-surface-800 border-transparent'
                      }`}
                  >
                    <img src={client.avatarUrl} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                    <span className={`flex-1 text-left text-sm font-medium ${isSelected ? 'text-white' : 'text-surface-300'}`}>{client.name}</span>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-surface-600 bg-surface-900'
                      }`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
              {availableClients.length === 0 && (
                <p className="p-4 text-center text-surface-500 text-sm italic">Nenhum aluno encontrado.</p>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-surface-900/30 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-surface-500 uppercase mb-2 font-display">Definir Período (Opcional)</h4>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-surface-400 block mb-1">Início (Opcional)</label>
                    <input
                      type="date"
                      value={assignmentDates.startDate}
                      onChange={e => setAssignmentDates({ ...assignmentDates, startDate: e.target.value })}
                      className="w-full bg-surface-950 border border-white/5 rounded p-2 text-xs text-white [color-scheme:dark] focus:outline-none focus:border-primary-500 placeholder-surface-600"
                      placeholder="Manter atual"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-surface-400 block mb-1">Fim (Opcional)</label>
                    <input
                      type="date"
                      value={assignmentDates.endDate}
                      onChange={e => setAssignmentDates({ ...assignmentDates, endDate: e.target.value })}
                      className="w-full bg-surface-950 border border-white/5 rounded p-2 text-xs text-white [color-scheme:dark] focus:outline-none focus:border-primary-500 placeholder-surface-600"
                      placeholder="Manter atual"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-surface-500 uppercase mb-2 flex items-center gap-1 font-display"><Calendar size={12} /> Agendamento Semanal</h4>
                <div className="flex gap-2 justify-between">
                  {WEEKDAYS.map(day => {
                    const isDaySelected = selectedScheduleDays.includes(day.val);
                    return (
                      <button
                        key={day.val}
                        onClick={() => toggleScheduleDay(day.val)}
                        className={`flex-1 h-8 rounded text-[10px] font-bold transition-all border ${isDaySelected
                          ? 'bg-primary-600 text-white border-primary-500'
                          : 'bg-surface-950 text-surface-500 border-white/5 hover:border-surface-500'
                          }`}
                        title={day.label}
                      >
                        {day.label.charAt(0)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-surface-900/50 flex flex-col gap-3">
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-2 text-surface-400 hover:text-white text-sm font-medium">Cancelar</button>
                <button
                  type="button"
                  onClick={handleAssignToClients}
                  disabled={selectedClientIds.length === 0 || isAssigning}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2 shadow-emerald-600/20"
                >
                  {isAssigning ? 'Salvando...' : `Confirmar (${selectedClientIds.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      <ExerciseSelectionModal
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setViewingDetailExercise(null);
        }}
        onSelect={addExercise}
        onReplace={(exercise) => {
          if (viewingDetailIndex !== null) handleReplaceExercise(viewingDetailIndex, exercise);
        }}
        onAddAlternative={(exercise) => {
          if (viewingDetailIndex !== null) handleAddAlternative(viewingDetailIndex, exercise);
        }}
        onRemove={() => {
          if (viewingDetailIndex !== null && editingTemplate) {
            const exercise = editingTemplate.exercises[viewingDetailIndex];
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

              handleUpdateExercise(viewingDetailIndex, updatedExercise);
            } else {
              // No alternatives? Just remove the slot.
              removeExercise(viewingDetailIndex);
            }
            setShowExerciseModal(false);
          }
        }}
        exercises={filteredExercises}
        initialViewingExercise={viewingDetailExercise}
        workoutContext={viewingDetailIndex !== null && editingTemplate ? editingTemplate.exercises[viewingDetailIndex] : undefined}
        onUpdateWorkoutContext={(updates) => {
          if (editingTemplate && viewingDetailIndex !== null) {
            const newExercises = [...editingTemplate.exercises];
            newExercises[viewingDetailIndex] = { ...newExercises[viewingDetailIndex], ...updates };
            setEditingTemplate({ ...editingTemplate, exercises: newExercises });
          }
        }}
        onCreateCustom={async (data) => {
          setNewExerciseForm({ ...data, equipment: data.equipment || 'Peso do Corpo' });
          setTempVideoUrl(data.videoUrl || '');

          if (!user) return alert("Erro de autenticação");

          try {
            const payload: any = {
              name: data.name,
              muscle_group: data.muscleGroup,
              equipment: data.equipment,
              coach_id: user.id,
              video_url: data.videoUrl || null,
              is_global: data.isGlobal || false
            };

            const { data: customData, error } = await supabase
              .from('custom_exercises')
              .insert(payload)
              .select()
              .single();

            if (error) throw error;

            const newEx: Exercise = {
              id: customData.id,
              name: customData.name,
              muscleGroup: customData.muscle_group as MuscleGroup,
              equipment: customData.equipment,
              agonists: [customData.muscle_group],
              synergists: [],
              videoUrl: customData.video_url,
              isGlobal: customData.is_global,
              ownerId: customData.coach_id
            };

            setCustomExercises(prev => [...prev, newEx]);
            addExercise(newEx);
          } catch (err: any) {
            console.error('Save error:', err);
            // Warn but don't crash if field missing
            alert('Erro ao criar: ' + err.message);
            throw err;
          }
        }}
        onUpdateExercise={async (id, updates) => {
          if (!user) return;
          try {
            // Map updates to DB columns
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.muscleGroup) dbUpdates.muscle_group = updates.muscleGroup;
            if (updates.equipment) dbUpdates.equipment = updates.equipment;
            if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;

            const { error } = await supabase
              .from('custom_exercises')
              .update(dbUpdates)
              .eq('id', id);

            if (error) throw error;

            // Update Local State for Custom Exercises
            setCustomExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));

            // Update Editing Template if it contains this exercise
            if (editingTemplate) {
              setEditingTemplate(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  exercises: prev.exercises.map(ex => {
                    // Start customization -> viewingDetailExercise -> ID match
                    if (ex.id === id) {
                      return { ...ex, ...updates };
                    }
                    return ex;
                  })
                };
              });
            }

            // Update viewing detail exercise to reflect changes immediately
            setViewingDetailExercise(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);

          } catch (err: any) {
            console.error('Update error:', err);
            alert('Erro ao atualizar exercício: ' + err.message);
            throw err;
          }
        }}
      />



      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-900 border border-white/5 rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 font-display">Excluir Modelo?</h3>
            <p className="text-surface-400 text-sm mb-6">Tem certeza que deseja excluir este modelo de treino? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirmation(null)} className="px-4 py-2 text-surface-400 hover:text-white font-medium">Cancelar</button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 hover:shadow-red-600/20"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;