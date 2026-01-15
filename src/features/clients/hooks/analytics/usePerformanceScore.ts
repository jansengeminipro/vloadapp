import { useMemo } from 'react';
import { Client, SavedSession } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';

interface PerformanceScoreHookProps {
    dashboardStats: any;
    analyticsMetrics: any;
    latestAssessment?: Assessment;
    client: Client | null;
    completedSessions: SavedSession[];
}

export const usePerformanceScore = ({
    dashboardStats,
    analyticsMetrics,
    client,
    completedSessions
}: PerformanceScoreHookProps) => {
    return useMemo(() => {
        const scores = [
            { subject: 'Consistência', A: 0, fullMark: 100 },
            { subject: 'Simetria', A: 0, fullMark: 100 },
            { subject: 'Evolução', A: 0, fullMark: 100 },
            { subject: 'Intensidade', A: 0, fullMark: 100 },
        ];

        if (!dashboardStats) return scores;

        // 1. CONSISTENCY (Consistência)
        const plannedSessions = Number(dashboardStats.plannedWeeklySessions) || 1;
        const currentSessions = Number(dashboardStats.weekSessionsCount) || 0;
        let consistencyScore = (currentSessions / plannedSessions) * 100;
        if (isNaN(consistencyScore)) consistencyScore = 0;
        if (consistencyScore > 100) consistencyScore = 100;
        scores[0].A = Math.round(consistencyScore);

        // 2. SYMMETRY (Simetria Upper/Lower)
        // Need to categorize muscles from dashboardStats.muscleDistributionData or similar
        // dashboardStats.weeklyMuscleVolume is a Record<string, number> where string is muscle name
        // We define Upper vs Lower muscles
        const upperMuscles = ['Peitoral', 'Costas', 'Ombros', 'Tríceps', 'Bíceps', 'Trapézio', 'Antebraço'];
        const lowerMuscles = ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Adutores', 'Abdutores'];

        // We can use muscleDistributionData but we need it in 'sets' metric for cleaner symmetry check?
        // Or weeklyMuscleVolume which is 'sets' based (from lines 61, 84, 100 in useClientDashboardStats)
        const volumes = dashboardStats.weeklyMuscleVolume || {};

        let upperVol = 0;
        let lowerVol = 0;

        Object.keys(volumes).forEach(m => {
            if (upperMuscles.includes(m)) upperVol += volumes[m];
            if (lowerMuscles.includes(m)) lowerVol += volumes[m];
        });

        let symScore = 0;
        if (upperVol === 0 && lowerVol === 0) {
            symScore = 0;
        } else if (upperVol === 0 || lowerVol === 0) {
            // Complete asymmetry (only trained one half)
            symScore = 20;
        } else {
            const ratio = Math.min(upperVol, lowerVol) / Math.max(upperVol, lowerVol);
            // Ratio 1.0 = 100pts
            // Ratio 0.5 = 70pts
            // Ratio < 0.3 = 30pts
            if (ratio >= 0.7) symScore = 100;
            else if (ratio < 0.3) symScore = 30;
            else {
                // Linear: 0.3->30, 0.7->100
                symScore = 30 + ((ratio - 0.3) * (70 / 0.4));
            }
        }
        if (isNaN(symScore)) symScore = 0;
        scores[1].A = Math.round(symScore);


        // 3. PROGRESS (Evolução / Taxa de Progresso)
        // Compare Logic: Current week vs Previous occurences
        // Need to parse completedSessions manually
        /* 
           Logic:
           1. Filter sessions from last 7 days.
           2. For each exercise in these sessions, find the LATEST previous session (before last 7 days).
           3. Compare e1RM (Weight * (1 + 0.0333 * Reps)).
           4. Count successes.
           Fallback: If < 3 comparisons possible, use Total Volume Load (Current Week vs Previous Week).
        */

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        const thisWeekSessions = completedSessions.filter(s => new Date(s.date) >= startOfWeek);
        const olderSessions = completedSessions.filter(s => new Date(s.date) < startOfWeek);

        let progressScore = 0;
        let comparisonsCount = 0;
        let successCount = 0;

        // Map older sessions for fast lookup: { exerciseName: { maxE1RM: number, date: string } }
        const historyMap: Record<string, number> = {};

        olderSessions.forEach(s => {
            s.details.forEach((d: any) => {
                const name = d.name;
                // Calculate max e1RM for this exercise in this session
                let bestE1RM = 0;
                if (d.setDetails && Array.isArray(d.setDetails)) {
                    bestE1RM = d.setDetails.reduce((max: number, set: any) => {
                        const w = parseFloat(set.weight) || 0;
                        const r = parseFloat(set.reps) || 0;
                        const e1rm = w * (1 + 0.0333 * r);
                        return Math.max(max, e1rm);
                    }, 0);
                }

                // We want the LATEST best? Or All time best? 
                // Usually "Previous Session" implies the most recent one before current.
                // But simplified: Let's store the MOST RECENT historical e1RM.
                // Since olderSessions is likely not sorted, we might need to handle dates if we want strict "prev session".
                // Optimistic approach: Use the *best* recorded recently? Or just the last one?
                // Plan said: "com sessão anterior".
                // Let's rely on olderSessions being sorted desc or filtered meaningfully? 
                // completedSessions usually comes from DB sorted by date.
                // Let's assume sorted (Latest first).

                if (!historyMap[name]) {
                    historyMap[name] = bestE1RM;
                }
            });
        });

        thisWeekSessions.forEach(s => {
            s.details.forEach((d: any) => {
                if (historyMap[d.name]) {
                    // Check current best e1RM
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
                        }
                    }
                }
            });
        });

        if (comparisonsCount < 3) {
            // FALLBACK: Weekly Volume Load
            const currentLoad = dashboardStats.weeklyLoadSum || 0; // Careful: dashboardStats.weeklyLoadSum is Internal Load (UA)?
            // dashboardStats usually has volume metrics?
            // useClientDashboardStats returns currentWeeklySets, but not Load sum explicitly in dashboardStats object unless we added it?
            // Ah, analyticsMetrics has `weeklyLoadSum` which is Internal Load (UA).
            // We want Volume Load (kg).
            // Let's calculate manually from thisWeekSessions vs lastWeek (approx).
            const thisWeekVol = thisWeekSessions.reduce((acc, s) => acc + (s.volumeLoad || 0), 0);

            // Get previous week calc
            const startOfPrevWeek = new Date(startOfWeek);
            startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
            const prevWeekSessions = olderSessions.filter(s => {
                const d = new Date(s.date);
                return d >= startOfPrevWeek && d < startOfWeek;
            });
            const prevWeekVol = prevWeekSessions.reduce((acc, s) => acc + (s.volumeLoad || 0), 0);

            if (thisWeekVol > prevWeekVol && prevWeekVol > 0) progressScore = 100;
            else if (thisWeekVol === 0 && prevWeekVol === 0) progressScore = 0;
            else if (thisWeekVol >= prevWeekVol * 0.9) progressScore = 75; // Maintenance
            else progressScore = 40;

        } else {
            // MAIN LOGIC
            const ratio = successCount / comparisonsCount;
            if (ratio >= 0.6) progressScore = 100;
            else if (ratio >= 0.3) progressScore = 75;
            else progressScore = 40;
        }

        if (isNaN(progressScore)) progressScore = 0;
        scores[2].A = Math.round(progressScore);


        // 4. INTENSITY (Esforço / RPE)
        // Average RPE of all sets in this week's sessions
        // Requires session.details[].setDetails[].rir (or rpe?)
        // The type Set has 'rir'. SavedSession has 'rpe' (session RPE).
        // Let's use Session RPE first as it's cleaner, fallback to converted RIR if needed?
        // Plan says: "Média de RPE de todas as séries".

        let totalRPE = 0;
        let setCounts = 0;

        thisWeekSessions.forEach(s => {
            // If we have granular set RIR/RPE
            s.details.forEach((d: any) => {
                if (d.setDetails && Array.isArray(d.setDetails)) {
                    d.setDetails.forEach((set: any) => {
                        // Convert RIR to RPE if RPE not present?
                        // RPE = 10 - RIR. 
                        // If we have 'rir', use it.
                        let val = 0;
                        if (set.rpe !== undefined) val = parseFloat(set.rpe);
                        else if (set.rir !== undefined) val = 10 - parseFloat(set.rir);

                        if (val > 0) {
                            totalRPE += val;
                            setCounts++;
                        }
                    });
                }
            });
        });

        let avgRPE = 0;
        if (setCounts > 0) avgRPE = totalRPE / setCounts;
        else {
            // Fallback: Session RPE if available
            const sessionRPEs = thisWeekSessions.map(s => s.rpe).filter(r => r !== undefined && r > 0) as number[];
            if (sessionRPEs.length) {
                avgRPE = sessionRPEs.reduce((a, b) => a + b, 0) / sessionRPEs.length;
            }
        }

        let effortScore = 0;
        if (avgRPE > 0) {
            if (avgRPE >= 8.0 && avgRPE <= 9.5) effortScore = 100;
            else if (avgRPE >= 7.0 && avgRPE < 8.0) effortScore = 85;
            else if (avgRPE > 9.5) effortScore = 70; // Too hard penalty
            else if (avgRPE < 6.0) effortScore = 40; // Too easy
            else effortScore = 60; // 6-7 zone
        } else {
            // No RPE data? Default to 0? Or Neutral?
            effortScore = 0;
        }

        if (isNaN(effortScore)) effortScore = 0;
        scores[3].A = Math.round(effortScore);

        return scores;

    }, [dashboardStats, analyticsMetrics, client, completedSessions]);
};
