import { supabase } from '@/shared/lib/supabase';
import { WorkoutTemplate } from '@/shared/types';

export const getWorkoutTemplates = async (coachId: string): Promise<WorkoutTemplate[]> => {
    const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('coach_id', coachId);

    if (error) throw error;

    return (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        focus: t.focus || 'Geral',
        lastModified: new Date(t.updated_at).toLocaleDateString(),
        exercises: t.exercises || []
    }));
};
