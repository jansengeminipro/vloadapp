import { useMemo } from 'react';
import { SavedSession } from '@/shared/types';

export interface ProgressionStats {
    successCount: number;
    totalComparisons: number;
    progressScore: number;
}

export interface TopExercise {
    name: string;
    muscleGroup: string;
    increasePercentage: number;
    currentE1RM: number;
    previousBest: number;
}

export interface StrengthVariation {
    name: string;
    muscleGroup: string;
    changePercentage: number;
    direction: 'up' | 'down';
    baselineE1RM: number;
    currentE1RM: number;
}

interface UseProgressionAnalysisOptions {
    mesoStartDate?: string;
}

export const useProgressionAnalysis = (
    completedSessions: SavedSession[],
    options: UseProgressionAnalysisOptions = {}
) => {
    return useMemo(() => {
        const { mesoStartDate } = options;

        if (!completedSessions || !Array.isArray(completedSessions)) {
            return {
                stats: { successCount: 0, totalComparisons: 0, progressScore: 0 },
                topExercises: [],
                strengthVariations: []
            };
        }

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        const sessions = Array.isArray(completedSessions) ? completedSessions : [];

        // --- STRENGTH VARIATIONS LOGIC (Mesocycle Comparison) ---
        const strengthVariations: StrengthVariation[] = [];

        if (mesoStartDate) {
            const mesoStart = new Date(mesoStartDate);

            // Sort sessions by date ascending
            const sortedSessions = [...sessions].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            // Find baseline e1RM for each exercise (first session on or after mesoStartDate)
            const baselineMap: Record<string, { e1rm: number; muscleGroup: string }> = {};
            const latestMap: Record<string, { e1rm: number; muscleGroup: string }> = {};

            sortedSessions.forEach(s => {
                const sessionDate = new Date(s.date);
                const isAfterMesoStart = sessionDate >= mesoStart;

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

                        if (bestE1RM > 0 && isAfterMesoStart) {
                            // Baseline: first occurrence after meso start
                            if (!baselineMap[name]) {
                                baselineMap[name] = {
                                    e1rm: bestE1RM,
                                    muscleGroup: d.muscleGroup || 'Geral'
                                };
                            }
                            // Latest: always overwrite with most recent
                            latestMap[name] = {
                                e1rm: bestE1RM,
                                muscleGroup: d.muscleGroup || 'Geral'
                            };
                        }
                    });
                }
            });

            // Calculate variations
            Object.keys(baselineMap).forEach(exerciseName => {
                const baseline = baselineMap[exerciseName];
                const latest = latestMap[exerciseName];

                if (baseline && latest && baseline.e1rm !== latest.e1rm) {
                    const change = ((latest.e1rm - baseline.e1rm) / baseline.e1rm) * 100;

                    // Apply threshold: only show ±5% or more
                    if (Math.abs(change) >= 5) {
                        strengthVariations.push({
                            name: exerciseName,
                            muscleGroup: baseline.muscleGroup,
                            changePercentage: change,
                            direction: change > 0 ? 'up' : 'down',
                            baselineE1RM: baseline.e1rm,
                            currentE1RM: latest.e1rm
                        });
                    }
                }
            });

            // Sort by absolute magnitude (biggest changes first)
            strengthVariations.sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage));
        }

        // --- LEGACY WEEKLY LOGIC (Top Progressions) ---
        const thisWeekSessions = sessions.filter(s => new Date(s.date) >= startOfWeek);
        const olderSessions = sessions.filter(s => new Date(s.date) < startOfWeek);

        let comparisonsCount = 0;
        let successCount = 0;
        let progressScore = 0;
        const improvedExercises: TopExercise[] = [];

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

                        if (currentBest > 0) {
                            comparisonsCount++;
                            if (currentBest > historyMap[d.name]) {
                                successCount++;

                                const previousBest = historyMap[d.name];
                                const increase = ((currentBest - previousBest) / previousBest) * 100;

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

        // Calculate Score
        if (comparisonsCount < 3) {
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

        const topExercises = improvedExercises
            .sort((a, b) => b.increasePercentage - a.increasePercentage)
            .slice(0, 3);

        return {
            stats: {
                successCount,
                totalComparisons: comparisonsCount,
                progressScore
            },
            topExercises,
            strengthVariations: strengthVariations.slice(0, 3)
        };
    }, [completedSessions, options.mesoStartDate]);
};
