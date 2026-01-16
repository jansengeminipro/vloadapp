import { useMemo } from 'react';
import { SavedSession } from '@/shared/types';

export interface ProgressionStats {
    successCount: number;
    totalComparisons: number;
    progressScore: number;
}

export interface TopExercise {
    name: string;
    muscleGroup: string; // We might need to extract this if available, or just default
    increasePercentage: number;
    currentE1RM: number;
    previousBest: number;
}

export const useProgressionAnalysis = (completedSessions: SavedSession[]) => {
    return useMemo(() => {
        if (!completedSessions || !Array.isArray(completedSessions)) {
            return {
                stats: { successCount: 0, totalComparisons: 0, progressScore: 0 },
                topExercises: []
            };
        }

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // Safe filters
        const sessions = Array.isArray(completedSessions) ? completedSessions : [];
        const thisWeekSessions = sessions.filter(s => new Date(s.date) >= startOfWeek);
        const olderSessions = sessions.filter(s => new Date(s.date) < startOfWeek);

        let comparisonsCount = 0;
        let successCount = 0;
        let progressScore = 0;
        const improvedExercises: TopExercise[] = [];

        // Map older sessions - Find GLOBAL BEST E1RM for each exercise in history
        const historyMap: Record<string, number> = {};

        olderSessions.forEach(s => {
            if (s.details && Array.isArray(s.details)) {
                s.details.forEach((d: any) => {
                    const name = d.name;
                    let bestE1RM = 0;
                    if (d.setDetails && Array.isArray(d.setDetails)) {
                        bestE1RM = d.setDetails.reduce((max: number, set: any) => {
                            const w = parseFloat(set.weight) || 0;
                            const r = parseFloat(set.reps) || 0;
                            const e1rm = w * (1 + 0.0333 * r);
                            return Math.max(max, e1rm);
                        }, 0);
                    }
                    if (bestE1RM > 0) {
                        if (!historyMap[name] || bestE1RM > historyMap[name]) {
                            historyMap[name] = bestE1RM;
                        }
                    }
                });
            }
        });

        // Analyze This Week
        thisWeekSessions.forEach(s => {
            if (s.details && Array.isArray(s.details)) {
                s.details.forEach((d: any) => {
                    if (historyMap[d.name]) {
                        let currentBest = 0;
                        if (d.setDetails && Array.isArray(d.setDetails)) {
                            currentBest = d.setDetails.reduce((max: number, set: any) => {
                                const w = parseFloat(set.weight) || 0;
                                const r = parseFloat(set.reps) || 0;
                                return Math.max(max, w * (1 + 0.0333 * r));
                            }, 0);
                        }

                        // We compare if we beat the history best
                        if (currentBest > 0) {
                            comparisonsCount++;
                            if (currentBest > historyMap[d.name]) {
                                successCount++;

                                const previousBest = historyMap[d.name];
                                const increase = ((currentBest - previousBest) / previousBest) * 100;

                                // Check if already added (maybe multiple sessions of same exercise this week, take best)
                                const existingIdx = improvedExercises.findIndex(e => e.name === d.name);
                                if (existingIdx > -1) {
                                    if (currentBest > improvedExercises[existingIdx].currentE1RM) {
                                        improvedExercises[existingIdx] = {
                                            name: d.name,
                                            muscleGroup: d.muscleGroup || 'Geral',
                                            increasePercentage: increase,
                                            currentE1RM: currentBest,
                                            previousBest: previousBest
                                        };
                                    }
                                } else {
                                    improvedExercises.push({
                                        name: d.name,
                                        muscleGroup: d.muscleGroup || 'Geral',
                                        increasePercentage: increase,
                                        currentE1RM: currentBest,
                                        previousBest: previousBest
                                    });
                                }
                            }
                        }
                    }
                });
            }
        });

        // Calculate Score (Legacy Logic Preserved)
        if (comparisonsCount < 3) {
            // FALLBACK logic for score if low data
            const thisWeekVol = thisWeekSessions.reduce((acc, s) => acc + (s.volumeLoad || 0), 0);

            const startOfPrevWeek = new Date(startOfWeek);
            startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
            const prevWeekSessions = olderSessions.filter(s => {
                const d = new Date(s.date);
                return d >= startOfPrevWeek && d < startOfWeek;
            });
            const prevWeekVol = prevWeekSessions.reduce((acc, s) => acc + (s.volumeLoad || 0), 0);

            if (thisWeekVol > prevWeekVol && prevWeekVol > 0) progressScore = 100;
            else if (thisWeekVol === 0 && prevWeekVol === 0) progressScore = 0;
            else if (thisWeekVol >= prevWeekVol * 0.9) progressScore = 75;
            else progressScore = 40;

        } else {
            const ratio = successCount / comparisonsCount;
            if (ratio >= 0.6) progressScore = 100;
            else if (ratio >= 0.3) progressScore = 75;
            else progressScore = 40;
        }

        // Sort top exercises by % increase
        const topExercises = improvedExercises
            .sort((a, b) => b.increasePercentage - a.increasePercentage)
            .slice(0, 3);

        return {
            stats: {
                successCount,
                totalComparisons: comparisonsCount,
                progressScore
            },
            topExercises
        };
    }, [completedSessions]);
};
