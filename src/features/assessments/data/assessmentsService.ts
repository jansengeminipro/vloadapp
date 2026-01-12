import { supabase } from '@/shared/lib/supabase';
import { Assessment } from '../domain/models';

export const saveAssessment = async (assessment: Partial<Assessment>) => {
    // Determine if we are updating or inserting based on potential presence of ID, 
    // but usually assessments are immutable snapshots. If editing logic is needed later, we can add .upsert or check ID.
    // For now, prompt implies "Realize a test", suggesting insert.

    const { data, error } = await supabase
        .from('client_assessments')
        .insert([assessment])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getClientAssessments = async (clientId: string) => {
    const { data, error } = await supabase
        .from('client_assessments')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data as Assessment[];
};

export const deleteAssessment = async (id: string) => {
    const { error } = await supabase
        .from('client_assessments')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
