import { supabase } from '@/shared/lib/supabase';
import { Exercise } from '@/shared/types';

export interface CreateSessionPayload {
    student_id: string;
    coach_id: string;
    template_id: string;
    name: string;
    scheduled_date: string;
    completed_at: string;
    duration_minutes: number;
    exercises: any[];
    status: 'completed';
    rpe: number;
}

export const createSession = async (payload: CreateSessionPayload) => {
    const { error } = await supabase.from('workout_sessions').insert(payload);
    if (error) throw error;
    return true;
};

export const getExerciseHistory = async (clientId: string, exerciseName: string) => {
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('completed_at, exercises')
        .eq('student_id', clientId)
        .order('completed_at', { ascending: false })
        .limit(10);

    if (error) throw error;

    const historyItems: { date: string; setDetails: any[] }[] = [];
    data?.forEach(session => {
        const matchingExercise = session.exercises?.find((ex: any) => ex.name === exerciseName);
        if (matchingExercise) {
            historyItems.push({
                date: new Date(session.completed_at).toLocaleDateString(),
                setDetails: matchingExercise.setDetails || []
            });
        }
    });

    return historyItems;
};
