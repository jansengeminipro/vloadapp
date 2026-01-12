import React, { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { Client, SavedSession, WorkoutTemplate } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';

interface UseClientProfileDataReturn {
    client: Client | null;
    setClient: (client: Client | null) => void;
    sessions: SavedSession[];
    setSessions: React.Dispatch<React.SetStateAction<SavedSession[]>>;
    allTemplates: WorkoutTemplate[];
    latestAssessment: Assessment | undefined;
    loading: boolean;
    error: Error | null;
}

export const useClientProfileData = (id?: string, userId?: string): UseClientProfileDataReturn => {
    const [client, setClient] = useState<Client | null>(null);
    const [sessions, setSessions] = useState<SavedSession[]>([]);
    const [allTemplates, setAllTemplates] = useState<WorkoutTemplate[]>([]);
    const [latestAssessment, setLatestAssessment] = useState<Assessment | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // 1. Fetch Client Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (profileError) throw profileError;

                // 2. Fetch Active Program
                const { data: programData, error: programError } = await supabase
                    .from('client_programs')
                    .select('*')
                    .eq('client_id', id)
                    .eq('is_active', true)
                    .single();

                // It's okay if no program exists
                if (programError && programError.code !== 'PGRST116') console.error(programError);

                const mappedClient: Client = {
                    id: profileData.id,
                    name: profileData.full_name || 'Sem nome',
                    email: profileData.email,
                    avatarUrl: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name)}&background=random`,
                    status: 'active', // Derived?
                    lastWorkout: '-', // Calc later
                    nextWorkout: '-',
                    birthDate: profileData.birth_date,
                    weight: profileData.weight,
                    height: profileData.height,
                    phone: profileData.phone,
                    gender: profileData.gender,
                    activeProgram: programData ? {
                        id: programData.id,
                        name: programData.name,
                        startDate: programData.start_date,
                        endDate: programData.end_date,
                        workoutIds: programData.workout_ids || [],
                        schedule: programData.schedule_json || {}
                    } : undefined
                };

                setClient(mappedClient);

                // 3. Fetch Sessions
                const { data: sessionData, error: sessionError } = await supabase
                    .from('workout_sessions')
                    .select('*')
                    .eq('student_id', id)
                    .order('scheduled_date', { ascending: false });

                if (sessionError) throw sessionError;

                const mappedSessions: SavedSession[] = (sessionData || []).map((s: any) => ({
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
                setSessions(mappedSessions);

                // 4. Fetch Templates (All templates from this trainer)
                if (userId) {
                    const { data: templateData, error: templateError } = await supabase
                        .from('workout_templates')
                        .select('*')
                        .eq('coach_id', userId);

                    if (templateError) throw templateError;

                    if (templateData) {
                        const mappedTemplates: WorkoutTemplate[] = templateData.map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            focus: t.focus || 'Geral',
                            lastModified: new Date(t.updated_at).toLocaleDateString(),
                            exercises: t.exercises || []
                        }));
                        setAllTemplates(mappedTemplates);
                    }

                    // 5. Fetch Latest Assessment (all types, filtered by category in theory, but here by typical IDs)
                    const { data: assessmentData, error: assessmentError } = await supabase
                        .from('client_assessments')
                        .select('*')
                        .eq('client_id', id)
                        .in('type', ['pollock3', 'pollock7', 'faulkner', 'guedes', 'bia', 'bmi', 'rce', 'rcq'])
                        .order('date', { ascending: false })
                        .limit(1)
                        .single();

                    if (assessmentError && assessmentError.code !== 'PGRST116') {
                        // Silent fail for no assessment
                    }

                    if (assessmentData) {
                        setLatestAssessment(assessmentData);
                    }
                }

            } catch (err: any) {
                console.error('Error loading client data:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId && id) loadData();
    }, [id, userId]);

    return { client, setClient, sessions, setSessions, allTemplates, latestAssessment, loading, error };
};
