import { supabase } from '@/shared/lib/supabase';

export interface ProgramPayload {
    client_id: string;
    coach_id: string;
    name: string;
    start_date: string;
    end_date: string | null;
    workout_ids: string[];
    schedule_json: Record<string, number[]>;
    is_active: boolean;
    id?: string;
}

export const saveClientProgram = async (payload: ProgramPayload) => {
    const { data, error } = await supabase
        .from('client_programs')
        .upsert(payload.id ? payload : payload)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteClientProgram = async (programId: string, coachId: string) => {
    const { error } = await supabase
        .from('client_programs')
        .delete()
        .eq('id', programId)
        .eq('coach_id', coachId);

    if (error) throw error;
};
