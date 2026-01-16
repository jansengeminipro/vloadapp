import { supabase } from '@/shared/lib/supabase';
import { Assessment } from '@/features/assessments/domain/models';

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
