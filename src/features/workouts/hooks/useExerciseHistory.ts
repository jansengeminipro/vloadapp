import { useState, useEffect, useCallback } from 'react';
import { getExerciseHistory } from '../api/sessionService';

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
            const historyItems = await getExerciseHistory(clientId, exerciseName);
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
