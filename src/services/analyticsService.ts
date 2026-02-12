import { supabase } from '@/shared/lib/supabase';
import { SavedSession } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';

export const getClientSessions = async (clientId: string) => {
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('student_id', clientId)
        .order('scheduled_date', { ascending: false });

    if (error) throw error;

    // Map DB response to SavedSession generic type used in app
    // Note: The mapping logic was previously inside the hook. 
    // We should ideally return the raw data or mapped data. 
    // Returning mapped data keeps the service abstraction cleaner for the UI.
    return (data || []).map((s: any) => ({
        id: s.id,
        clientId: s.student_id,
        templateId: s.template_id || 'unknown',
        templateName: s.name || 'Treino Avulso',
        date: s.scheduled_date || s.completed_at || s.created_at,
        durationSeconds: s.duration_minutes ? s.duration_minutes * 60 : 0,
        totalSets: (s.exercises || []).reduce((acc: number, ex: any) => acc + (ex.sets || 0), 0),
        volumeLoad: (s.exercises || []).reduce((acc: number, ex: any) => {
            const exVolume = (ex.setDetails || []).reduce((setAcc: number, set: any) =>
                setAcc + ((parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)), 0);
            return acc + exVolume;
        }, 0),
        details: s.exercises || [],
        rpe: s.rpe,
        status: s.status
    }));
};

import { getLatestAssessment as getLatest, getLatestAssessmentsByCategory as getLatestByCategory } from '@/features/assessments/api/assessmentsRepository';
import { CARDIO_TYPES as C_TYPES, STRENGTH_TYPES as S_TYPES, BODY_COMP_TYPES as B_TYPES } from '@/features/assessments/domain/strategies';

export const getLatestAssessment = getLatest;
export const getLatestAssessmentsByCategory = getLatestByCategory;
export const CARDIO_TYPES = C_TYPES;
export const STRENGTH_TYPES = S_TYPES;
export const BODY_COMP_TYPES = B_TYPES;
