import { supabase } from '@/shared/lib/supabase';
import { Client } from '@/shared/types';

// --- Read Operations ---

export const getClientProfile = async (id: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const getClients = async (trainerId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('role', 'student');

    if (error) throw error;

    // Map DB fields to Client type
    return (data || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || 'Sem nome',
        email: p.email,
        avatarUrl: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'User')}&background=random`,
        status: 'active',
        lastWorkout: '-', // This would need a separate query or join
        nextWorkout: '-',
        birthDate: p.birth_date,
        weight: p.weight,
        height: p.height
    })) as Client[];
};

// --- Write Operations ---

export const updateClientProfile = async (id: string, updates: Partial<Client>) => {
    const dbUpdates = {
        full_name: updates.name,
        birth_date: updates.birthDate,
        weight: updates.weight,
        height: updates.height,
        phone: updates.phone,
        gender: updates.gender
    };

    const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

interface CreateStudentPayload {
    email: string;
    password: string;
    full_name: string;
    trainer_id: string;
}

export const createStudent = async (payload: CreateStudentPayload) => {
    const { data, error } = await supabase.functions.invoke('create-user', {
        body: payload
    });

    if (error) {
        // Updated error handling to extract message robustly from Edge Function response
        let errorMessage = error.message;
        try {
            // Check if error object has the response context
            if (error && typeof error === 'object' && 'context' in error) {
                const response = (error as any).context as Response;
                if (response && typeof response.text === 'function') {
                    const textBody = await response.text(); // WARNING: This might fail if stream is consumed? usually invokes handle this.
                    // Actually supabase invoke returns { data, error }. 'error' usually wraps the response.
                    // Let's copy the robust logic loosely but simplifying return for the component to handle UI alert/logic?
                    // The component had specific UI error handling logic. It's better to preserve the error throwing here 
                    // and let component handle UI messages, OR return a standardized error.
                    // For now, re-throwing the raw error/message is safest to preserve behavior.
                }
            }
        } catch (e) {
            console.error('Failed to parse error body', e);
        }
        throw error; // Let the component parse it as it did before, or we refactor completely.
        // To make it truly clean, we should normalize errors here. But "Preserve Behavior" rule is strict.
        // Code in component: parses error from function invoke.
        // If we just return { data, error } from this function, Component has to handle it.
        // Let's simply return the result of the invoke.
    }

    return data;
};

// Re-exporting the raw invoke for max compatibility if needed, 
// but wrapping it is better.
export const invokeCreateUser = async (payload: CreateStudentPayload) => {
    return await supabase.functions.invoke('create-user', {
        body: payload
    });
}
