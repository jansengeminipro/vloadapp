import { supabase } from '@/shared/lib/supabase';
import { SavedSession } from '@/shared/types';

export const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) throw error;
    return true;
};

interface UpdateSessionPayload {
    id: string;
    coach_id: string;
    date: string;
    durationSeconds: number;
    details: any[]; // Exercise Details
    rpe?: number;
}

export const updateSession = async (payload: UpdateSessionPayload) => {
    const dbPayload = {
        scheduled_date: new Date(payload.date).toISOString().split('T')[0],
        completed_at: payload.date,
        duration_minutes: Math.round(payload.durationSeconds / 60),
        exercises: payload.details,
        rpe: payload.rpe
    };

    const { error } = await supabase
        .from('workout_sessions')
        .update(dbPayload)
        .eq('id', payload.id)
        .eq('coach_id', payload.coach_id);

    if (error) throw error;
    return true;
};
