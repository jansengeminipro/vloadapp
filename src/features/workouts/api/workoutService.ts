import { supabase } from '@/shared/lib/supabase';
import { WorkoutTemplate } from '@/shared/types';

export const getWorkoutTemplate = async (templateId: string): Promise<WorkoutTemplate | null> => {
    const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', templateId)
        .single();

    if (error) {
        console.error('Error fetching template:', error);
        return null;
    }

    if (data) {
        return {
            id: data.id,
            name: data.name,
            focus: data.focus || 'Geral',
            lastModified: new Date(data.updated_at || data.created_at).toLocaleDateString(),
            exercises: data.exercises || []
        };
    }
    return null;
};
