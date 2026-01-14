import { supabase } from '@/shared/lib/supabase';
import { Client } from '@/shared/types';

export const getClientProfile = async (id: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const updateClientProfile = async (id: string, updates: Partial<Client>) => {
    // Map Client type back to DB columns if necessary 
    // For now assuming 1:1 mapping for fields used in update
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
