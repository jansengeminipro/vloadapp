import { useState, useEffect } from 'react';
import { Client, SavedSession, WorkoutTemplate } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';
import { getClientProfile } from '@/services/clientService';
import { getActiveProgram, getCoachTemplates } from '@/services/programService';
import { getClientSessions, getLatestAssessment, getLatestAssessmentsByCategory } from '@/services/analyticsService';

interface UseClientProfileDataReturn {
    client: Client | null;
    setClient: (client: Client | null) => void;
    sessions: SavedSession[];
    setSessions: React.Dispatch<React.SetStateAction<SavedSession[]>>;
    allTemplates: WorkoutTemplate[];
    latestAssessment: Assessment | undefined;
    assessmentsByType: { cardio?: Assessment | null, strength?: Assessment | null, bodyComp?: Assessment | null };
    loading: boolean;
    error: Error | null;
}

export const useClientProfileData = (id?: string, userId?: string): UseClientProfileDataReturn => {
    const [client, setClient] = useState<Client | null>(null);
    const [sessions, setSessions] = useState<SavedSession[]>([]);
    const [allTemplates, setAllTemplates] = useState<WorkoutTemplate[]>([]);
    const [latestAssessment, setLatestAssessment] = useState<Assessment | undefined>(undefined);
    const [assessmentsByType, setAssessmentsByType] = useState<{ cardio?: Assessment | null, strength?: Assessment | null, bodyComp?: Assessment | null }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // 1. Fetch Client Profile
                const profileData = await getClientProfile(id);

                // 2. Fetch Active Program
                const programData = await getActiveProgram(id);

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
                const mappedSessions = await getClientSessions(id);
                setSessions(mappedSessions);

                // 4. Fetch Templates (All templates from this trainer)
                if (userId) {
                    const templateData = await getCoachTemplates(userId);

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

                    // 5. Fetch Latest Assessments (Categorized)
                    const cats = await getLatestAssessmentsByCategory(id);
                    setAssessmentsByType(cats);

                    if (cats.bodyComp) {
                        setLatestAssessment(cats.bodyComp);
                    } else {
                        // Fallback to generic fetch if needed, but bodyComp is what covers the dashboard needs (weight/fat)
                        // We can also check generic getLatestAssessment if bodyComp failed
                        // For now relies on categories
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

    return { client, setClient, sessions, setSessions, allTemplates, latestAssessment, assessmentsByType, loading, error };
};

