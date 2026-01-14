import { useState, useMemo } from 'react';
import { Client, WorkoutTemplate } from '@/shared/types';
import { WEEKDAYS } from '../../constants';

export const useWeeklyProgram = (client: Client, activeProgramWorkouts: WorkoutTemplate[]) => {
    const [selectedCalendarDay, setSelectedCalendarDay] = useState((new Date().getDay() + 6) % 7);
    const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

    const programStats = useMemo(() => {
        if (!client.activeProgram) return null;

        const scheduledDays = Object.values(client.activeProgram.schedule || {}).flat();
        const uniqueDays = new Set(scheduledDays).size;

        const totalWeeklySets = activeProgramWorkouts.reduce((acc, w) => {
            const frequency = (client.activeProgram?.schedule?.[w.id] || []).length;
            const workoutSets = w.exercises.reduce((s, e) => s + e.sets, 0);
            return acc + (workoutSets * frequency);
        }, 0);

        const divisionType = uniqueDays >= 5 ? 'Alto Volume' : uniqueDays === 3 ? 'Full Body' : 'Híbrido';
        const microCycleStatus = 'Em Dia'; // Placeholder logic as in original

        return {
            uniqueDays,
            totalWeeklySets,
            divisionType,
            microCycleStatus
        };
    }, [client.activeProgram, activeProgramWorkouts]);

    const getWorkoutsForDay = (dayVal: number) => {
        return activeProgramWorkouts.filter(w =>
            (client.activeProgram?.schedule?.[w.id] || []).includes(dayVal)
        );
    };

    return {
        selectedCalendarDay,
        setSelectedCalendarDay,
        expandedWorkoutId,
        setExpandedWorkoutId,
        programStats,
        getWorkoutsForDay
    };
};
