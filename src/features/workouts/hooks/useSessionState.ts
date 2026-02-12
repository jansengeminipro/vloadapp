import { useState, useEffect, useCallback } from 'react';
import { WorkoutTemplate, WorkoutExercise, Exercise } from '@/shared/types';
import { getWorkoutTemplate } from '../api/workoutService';

export interface SetDraft {
    weight: string;
    reps: string;
    rir: string;
    completed: boolean;
}

interface UseSessionStateProps {
    templateId: string | null;
}

interface UseSessionStateReturn {
    // Template
    template: WorkoutTemplate | undefined;
    isLoadingTemplate: boolean;
    setTemplate: React.Dispatch<React.SetStateAction<WorkoutTemplate | undefined>>;

    // Navigation
    currentExerciseIndex: number;
    setCurrentExerciseIndex: React.Dispatch<React.SetStateAction<number>>;
    navigateExercise: (direction: 'prev' | 'next') => void;

    // Logs
    logs: { [exerciseIdx: number]: SetDraft[] };
    updateSet: (setIndex: number, field: keyof SetDraft, value: any) => void;
    toggleSetComplete: (setIndex: number, onComplete?: () => void) => void;
    addSet: () => void;
    removeSet: (setIndex: number) => void;

    // Adaptation
    handleAddExercise: (exercise: Exercise) => void;
    handleRemoveExercise: (index: number) => void;
    handleReplaceExercise: (index: number, exercise: Exercise, preserveTargets?: boolean) => void;
    handleUpdateExercise: (index: number, updatedExercise: WorkoutExercise) => void;
    handleUpdateTarget: (index: number, field: keyof WorkoutExercise, value: any) => void;
    handleAddAlternative: (index: number, exercise: Exercise) => void;
    handleSwapAlternative: (exerciseIndex: number, alternativeIndex: number) => void;

    // Current Exercise Helpers
    currentExercise: WorkoutExercise | undefined;
    currentLogs: SetDraft[];
}

/**
 * Hook to manage the core session state: template, logs, navigation, and adaptation.
 */
export const useSessionState = ({ templateId }: UseSessionStateProps): UseSessionStateReturn => {
    // Template State
    const [template, setTemplate] = useState<WorkoutTemplate | undefined>(undefined);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

    // Navigation
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

    // Set Logs
    const [logs, setLogs] = useState<{ [exerciseIdx: number]: SetDraft[] }>({});

    // Fetch Template
    useEffect(() => {
        const fetchTemplate = async () => {
            if (!templateId) {
                setIsLoadingTemplate(false);
                return;
            }
            const templateData = await getWorkoutTemplate(templateId);

            if (templateData) {
                setTemplate(templateData);
            }
            setIsLoadingTemplate(false);
        };
        fetchTemplate();
    }, [templateId]);

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

    // Navigation
    const navigateExercise = useCallback((direction: 'prev' | 'next') => {
        if (!template) return;
        if (direction === 'prev' && currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev - 1);
        } else if (direction === 'next' && currentExerciseIndex < template.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        }
    }, [template, currentExerciseIndex]);

    // Set Management
    const updateSet = useCallback((setIndex: number, field: keyof SetDraft, value: any) => {
        setLogs(prev => {
            const newLogs = { ...prev };
            if (newLogs[currentExerciseIndex]) {
                newLogs[currentExerciseIndex] = [...newLogs[currentExerciseIndex]];
                newLogs[currentExerciseIndex][setIndex] = {
                    ...newLogs[currentExerciseIndex][setIndex],
                    [field]: value
                };
            }
            return newLogs;
        });
    }, [currentExerciseIndex]);

    const toggleSetComplete = useCallback((setIndex: number, onComplete?: () => void) => {
        setLogs(prev => {
            const newLogs = { ...prev };
            if (newLogs[currentExerciseIndex]) {
                newLogs[currentExerciseIndex] = [...newLogs[currentExerciseIndex]];
                const isCompleting = !newLogs[currentExerciseIndex][setIndex].completed;
                newLogs[currentExerciseIndex][setIndex] = {
                    ...newLogs[currentExerciseIndex][setIndex],
                    completed: isCompleting
                };
                if (isCompleting && onComplete) {
                    onComplete();
                }
            }
            return newLogs;
        });
    }, [currentExerciseIndex]);

    const addSet = useCallback(() => {
        setLogs(prev => {
            const newLogs = { ...prev };
            const currentLogs = newLogs[currentExerciseIndex] || [];
            const prevSet = currentLogs[currentLogs.length - 1];
            newLogs[currentExerciseIndex] = [
                ...currentLogs,
                {
                    weight: prevSet ? prevSet.weight : '',
                    reps: prevSet ? prevSet.reps : '',
                    rir: prevSet ? prevSet.rir : '',
                    completed: false
                }
            ];
            return newLogs;
        });
    }, [currentExerciseIndex]);

    const removeSet = useCallback((setIndex: number) => {
        setLogs(prev => {
            const newLogs = { ...prev };
            if (newLogs[currentExerciseIndex]) {
                newLogs[currentExerciseIndex] = newLogs[currentExerciseIndex].filter((_, idx) => idx !== setIndex);
            }
            return newLogs;
        });
    }, [currentExerciseIndex]);

    // Adaptation Handlers
    const handleAddExercise = useCallback((exercise: Exercise) => {
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
    }, [template]);

    const handleRemoveExercise = useCallback((index: number) => {
        if (!template) return;
        const newExercises = [...template.exercises];
        newExercises.splice(index, 1);

        setLogs({}); // Reset logs to force regeneration
        setTemplate({
            ...template,
            exercises: newExercises
        });
    }, [template]);

    const handleUpdateTarget = useCallback((index: number, field: keyof WorkoutExercise, value: any) => {
        if (!template) return;
        const newExercises = [...template.exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };

        if (field === 'sets') {
            setLogs({});
        }

        setTemplate({
            ...template,
            exercises: newExercises
        });
    }, [template]);

    const handleReplaceExercise = useCallback((index: number, exercise: Exercise, preserveTargets = false) => {
        if (!template) return;
        const newExercises = [...template.exercises];
        const oldExercise = newExercises[index]; // Get existing exercise

        const newWorkoutExercise: WorkoutExercise = {
            ...exercise,
            sets: preserveTargets ? oldExercise.sets : 3,
            targetReps: preserveTargets ? oldExercise.targetReps : '8-12',
            targetRIR: preserveTargets ? oldExercise.targetRIR : 2,
            restSeconds: preserveTargets ? oldExercise.restSeconds : 90
        };
        newExercises[index] = newWorkoutExercise;

        setLogs({}); // Reset logs as exercise changed
        setTemplate({
            ...template,
            exercises: newExercises
        });
    }, [template]);

    const handleUpdateExercise = useCallback((index: number, updatedExercise: WorkoutExercise) => {
        if (!template) return;
        const newExercises = [...template.exercises];
        newExercises[index] = updatedExercise;

        setTemplate({
            ...template,
            exercises: newExercises
        });
    }, [template]);

    const handleAddAlternative = useCallback((index: number, exercise: Exercise) => {
        if (!template) return;
        const newExercises = [...template.exercises];
        const targetExercise = { ...newExercises[index] };

        const newAlternative: WorkoutExercise = {
            ...exercise,
            sets: targetExercise.sets, // Inhert sets from parent
            targetReps: targetExercise.targetReps,
            targetRIR: targetExercise.targetRIR,
            restSeconds: targetExercise.restSeconds
        };

        targetExercise.alternatives = [...(targetExercise.alternatives || []), newAlternative];
        newExercises[index] = targetExercise;

        setTemplate({
            ...template,
            exercises: newExercises
        });
    }, [template]);

    const handleSwapAlternative = useCallback((exerciseIndex: number, alternativeIndex: number) => {
        if (!template) return;
        const newExercises = [...template.exercises];
        const mainExercise = { ...newExercises[exerciseIndex] };

        if (!mainExercise.alternatives) return; // Should not happen

        // Create a copy of alternatives
        const newAlternatives = [...mainExercise.alternatives];

        // Identify the chosen alternative
        const selectedAlternative = newAlternatives[alternativeIndex];

        // Prepare the old main to become an alternative
        // Important: Strip its own alternatives array to avoid nesting
        const oldMainAsAlternative = { ...mainExercise, alternatives: [] };

        // Swap in Place: Put the old main exactly where the selected alternative was
        newAlternatives[alternativeIndex] = oldMainAsAlternative;

        // Create the new main exercise
        const newMainExercise: WorkoutExercise = {
            ...selectedAlternative,
            sets: mainExercise.sets, // Preserve session targets
            targetReps: mainExercise.targetReps,
            targetRIR: mainExercise.targetRIR,
            restSeconds: mainExercise.restSeconds,
            alternatives: newAlternatives // Attach the modified list
        };

        newExercises[exerciseIndex] = newMainExercise;

        setTemplate({
            ...template,
            exercises: newExercises
        });
    }, [template]);

    // Derived Values
    const currentExercise = template?.exercises[currentExerciseIndex];
    const currentLogs = logs[currentExerciseIndex] || [];

    return {
        template,
        isLoadingTemplate,
        setTemplate,
        currentExerciseIndex,
        setCurrentExerciseIndex,
        navigateExercise,
        logs,
        updateSet,
        toggleSetComplete,
        addSet,
        removeSet,
        handleAddExercise,
        handleRemoveExercise,
        handleReplaceExercise,
        handleUpdateExercise,
        handleUpdateTarget,
        handleAddAlternative, // Exposed
        handleSwapAlternative, // Exposed
        currentExercise,
        currentLogs
    };
};
