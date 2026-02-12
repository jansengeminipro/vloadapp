import { supabase } from '@/shared/lib/supabase';
import { Assessment } from '@/features/assessments/domain/models';
import { CARDIO_TYPES, STRENGTH_TYPES, BODY_COMP_TYPES } from '../domain/strategies';

/**
 * Saves a new assessment to the database.
 */
export const saveAssessment = async (assessment: Partial<Assessment>) => {
    const { data, error } = await supabase
        .from('client_assessments')
        .insert([assessment])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Fetches all assessments for a specific client, ordered by date descending.
 */
export const getClientAssessments = async (clientId: string) => {
    const { data, error } = await supabase
        .from('client_assessments')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data as Assessment[];
};

/**
 * Deletes an assessment by ID.
 */
export const deleteAssessment = async (id: string) => {
    const { error } = await supabase
        .from('client_assessments')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getLatestAssessment = async (clientId: string) => {
    const { data, error } = await supabase
        .from('client_assessments')
        .select('*')
        .eq('client_id', clientId)
        .in('type', [...CARDIO_TYPES, ...STRENGTH_TYPES, ...BODY_COMP_TYPES]) // simplified
        .order('date', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }
    return data as Assessment | null;
};

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
