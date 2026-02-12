import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { ChevronLeft, Settings, Plus } from 'lucide-react';
import { WorkoutTemplate, WorkoutExercise, Exercise } from '@/shared/types';
import { DraggableExerciseCard } from '../DraggableExerciseCard';
import ExerciseSelectionModal from '../ExerciseSelectionModal';
import { EXERCISE_DB } from '@/shared/data/exercises';

interface SessionAdaptationProps {
    template: WorkoutTemplate;
    onDragEnd: (result: any) => void;
    onRemoveExercise: (index: number) => void;
    onUpdateExercise: (index: number, updatedExercise: WorkoutExercise) => void;
    onSwapAlternative: (exerciseIndex: number, alternativeIndex: number) => void;
    onCancel: () => void;
    onComplete: () => void;

    // Modal & Add/Replace Logic is passed down usually via session hook, 
    // but here we can keep the modal local or pass handlers.
    // For simplicity, we'll implement the modal state locally in this component 
    // OR pass the modal control props if we want to bubble it up. 
    // Looking at the original file, it has complex modal logic. 
    // Let's pass the handlers and keep the state in the parent Layout or pass the hook result?
    // Actually, creating a separate component for the modal logic inside here is better.

    // Passing handlers for the modal actions:
    onAddExercise: (exercise: Exercise) => void;
    onUpdateTarget: (index: number, field: keyof WorkoutExercise, value: any) => void;
    onReplaceExercise: (index: number, exercise: Exercise) => void;
    onAddAlternative: (index: number, exercise: Exercise) => void;
}

export const SessionAdaptation: React.FC<SessionAdaptationProps> = ({
    template,
    onDragEnd,
    onRemoveExercise,
    onUpdateExercise,
    onSwapAlternative,
    onCancel,
    onComplete,
    onAddExercise,
    onUpdateTarget,
    onReplaceExercise,
    onAddAlternative
}) => {
    // Local state for the modal visibility, as it is UI state
    const [showAddExerciseModal, setShowAddExerciseModal] = React.useState(false);
    const [viewingDetailExercise, setViewingDetailExercise] = React.useState<Exercise | null>(null);
    const [viewingDetailIndex, setViewingDetailIndex] = React.useState<number | null>(null);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center safe-area-top">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-1 -ml-1 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        <Settings size={18} /> Adaptar Sessão
                    </h2>
                </div>
                <button
                    onClick={onComplete}
                    className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                    Concluir & Iniciar
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="exercises">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                {template.exercises.map((ex, i) => (
                                    <DraggableExerciseCard
                                        key={`${ex.id}-${i}`}
                                        exercise={ex}
                                        index={i}
                                        onRemove={onRemoveExercise}
                                        onUpdate={onUpdateExercise}
                                        onSwap={onSwapAlternative}
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

                <button
                    onClick={() => setShowAddExerciseModal(true)}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-800 text-slate-500 font-bold hover:bg-slate-900 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus size={20} /> Adicionar Exercício
                </button>
                <div className="h-20"></div>
            </div>

            <ExerciseSelectionModal
                isOpen={showAddExerciseModal}
                onClose={() => setShowAddExerciseModal(false)}
                onSelect={(exercise) => {
                    onAddExercise(exercise);
                    setShowAddExerciseModal(false);
                }}
                exercises={EXERCISE_DB}
                initialViewingExercise={viewingDetailExercise}
                workoutContext={viewingDetailIndex !== null ? template.exercises[viewingDetailIndex] : undefined}
                onUpdateWorkoutContext={(updates) => {
                    if (viewingDetailIndex !== null) {
                        Object.entries(updates).forEach(([key, value]) => {
                            onUpdateTarget(viewingDetailIndex, key as keyof WorkoutExercise, value);
                        });
                    }
                }}
                onReplace={(exercise) => {
                    if (viewingDetailIndex !== null) {
                        onReplaceExercise(viewingDetailIndex, exercise);
                    }
                }}
                onAddAlternative={(exercise) => {
                    if (viewingDetailIndex !== null) {
                        onAddAlternative(viewingDetailIndex, exercise);
                    }
                }}
                onRemove={() => {
                    if (viewingDetailIndex !== null) {
                        const exercise = template.exercises[viewingDetailIndex];
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

                            onUpdateExercise(viewingDetailIndex, updatedExercise);
                        } else {
                            onRemoveExercise(viewingDetailIndex);
                        }
                        setShowAddExerciseModal(false);
                    }
                }}
            />
        </div>
    );
};
