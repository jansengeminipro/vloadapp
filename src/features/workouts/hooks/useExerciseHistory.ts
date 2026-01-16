import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';

interface HistoryItem {
    date: string;
    setDetails: { weight: number; reps: number; rir: string }[];
}

interface UseExerciseHistoryReturn {
    exerciseHistory: HistoryItem[];
    isLoadingHistory: boolean;
    showHistoryModal: boolean;
    openHistoryModal: () => void;
    closeHistoryModal: () => void;
    fetchHistory: (clientId: string, exerciseName: string) => Promise<void>;
}

/**
 * Hook to fetch and display exercise history for a specific client and exercise.
 */
export const useExerciseHistory = (): UseExerciseHistoryReturn => {
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [exerciseHistory, setExerciseHistory] = useState<HistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const openHistoryModal = useCallback(() => {
        setShowHistoryModal(true);
    }, []);

    const closeHistoryModal = useCallback(() => {
        setShowHistoryModal(false);
    }, []);

    const fetchHistory = useCallback(async (clientId: string, exerciseName: string) => {
        if (!clientId || !exerciseName) return;

        setIsLoadingHistory(true);
        openHistoryModal();

        try {
            const { data, error } = await supabase
                .from('workout_sessions')
                .select('completed_at, exercises')
                .eq('student_id', clientId)
                .order('completed_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            // Extract only sets for this specific exercise
            const historyItems: HistoryItem[] = [];
            data?.forEach(session => {
                const matchingExercise = session.exercises?.find((ex: any) => ex.name === exerciseName);
                if (matchingExercise) {
                    historyItems.push({
                        date: new Date(session.completed_at).toLocaleDateString(),
                        setDetails: matchingExercise.setDetails || []
                    });
                }
            });

            setExerciseHistory(historyItems);
        } catch (err) {
            console.error('Error fetching history:', err);
            setExerciseHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [openHistoryModal]);

    return {
        exerciseHistory,
        isLoadingHistory,
        showHistoryModal,
        openHistoryModal,
        closeHistoryModal,
        fetchHistory
    };
};
