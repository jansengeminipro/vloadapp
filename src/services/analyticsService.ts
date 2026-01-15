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

export const getLatestAssessment = async (clientId: string) => {
    const { data, error } = await supabase
        .from('client_assessments')
        .select('*')
        .eq('client_id', clientId)
        .in('type', ['pollock3', 'pollock7', 'faulkner', 'guedes', 'bia', 'bmi', 'rce', 'rcq'])
        .order('date', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }
    return data as Assessment | null;
};
export const CARDIO_TYPES = ['cooper', 'rockport', 'bruce', 'balke_ware', 'mssrt', 'ruffier', 'tc6m', 'ymca', 'lunge_test', 'step_test_queens'];
export const STRENGTH_TYPES = ['1rm', 'one_rm', 'pushups', 'situps', 'squats', 'plank', 'flexion', 'abdominal', 'arm_curl', 'chair_stand', 'dynamometry'];
export const BODY_COMP_TYPES = ['pollock3', 'pollock7', 'faulkner', 'guedes', 'bia', 'bmi', 'rce', 'rcq', 'circumferences'];

export const getLatestAssessmentsByCategory = async (clientId: string) => {
    // We can run 3 queries in parallel for efficiency
    const fetchLatest = async (types: string[]) => {
        const { data, error } = await supabase
            .from('client_assessments')
            .select('*')
            .eq('client_id', clientId)
            .in('type', types)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') return null;
        return data as Assessment | null;
    };

    const [cardio, strength, bodyComp] = await Promise.all([
        fetchLatest(CARDIO_TYPES),
        fetchLatest(STRENGTH_TYPES),
        fetchLatest(BODY_COMP_TYPES)
    ]);

    return { cardio, strength, bodyComp };
};
