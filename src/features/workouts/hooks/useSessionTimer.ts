import { useState, useEffect, useCallback } from 'react';

interface UseSessionTimerReturn {
    elapsedTime: number;
    restTimer: number;
    timerActive: boolean;
    startRestTimer: () => void;
    stopRestTimer: () => void;
    resetRestTimer: () => void;
    formatTime: (seconds: number) => string;
}

/**
 * Hook to manage session timers: global elapsed time and rest timer.
 */
export const useSessionTimer = (): UseSessionTimerReturn => {
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [restTimer, setRestTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    // Global elapsed timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    // Rest timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timerActive) {
            interval = setInterval(() => {
                setRestTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    const startRestTimer = useCallback(() => {
        setRestTimer(0);
        setTimerActive(true);
    }, []);

    const stopRestTimer = useCallback(() => {
        setTimerActive(false);
    }, []);

    const resetRestTimer = useCallback(() => {
        setRestTimer(0);
        setTimerActive(false);
    }, []);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, []);

    return {
        elapsedTime,
        restTimer,
        timerActive,
        startRestTimer,
        stopRestTimer,
        resetRestTimer,
        formatTime
    };
};
