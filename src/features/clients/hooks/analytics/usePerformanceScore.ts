import { useMemo } from 'react';
import { Client } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';

interface PerformanceScoreHookProps {
    dashboardStats: any; // Ideally typed from useClientDashboardStats
    analyticsMetrics: any; // Ideally typed from useClientDashboardData
    latestAssessment?: Assessment;
    client: Client | null;
}

export const usePerformanceScore = ({
    dashboardStats,
    analyticsMetrics,
    latestAssessment,
    client
}: PerformanceScoreHookProps) => {
    return useMemo(() => {
        const scores = [
            { subject: 'Consistência', A: 0, fullMark: 100 },
            { subject: 'Volume', A: 0, fullMark: 100 },
            { subject: 'Composição', A: 0, fullMark: 100 },
            { subject: 'Carga/Resist.', A: 0, fullMark: 100 },
            { subject: 'Intensidade', A: 0, fullMark: 100 },
        ];

        if (!dashboardStats) return scores;

        // 1. CONSISTENCY (Consistência)
        // (Completed / Planned) * 100
        const plannedSessions = Number(dashboardStats.plannedWeeklySessions) || 1;
        const currentSessions = Number(dashboardStats.weekSessionsCount) || 0;
        let consistencyScore = (currentSessions / plannedSessions) * 100;
        if (isNaN(consistencyScore)) consistencyScore = 0;
        if (consistencyScore > 100) consistencyScore = 100;
        scores[0].A = Math.round(consistencyScore);

        // 2. VOLUME
        // (Current Sets / Planned Sets) * 100
        const plannedSets = Number(dashboardStats.plannedWeeklySets) || 1;
        const currentSets = Number(dashboardStats.currentWeeklySets) || 0;
        let volumeScore = (currentSets / plannedSets) * 100;
        if (isNaN(volumeScore)) volumeScore = 0;
        if (volumeScore > 100) volumeScore = 100;
        scores[1].A = Math.round(volumeScore);

        // 3. COMPOSITION (Composição Corporal)
        let compScore = 60; // Default average
        if (latestAssessment && latestAssessment.data) {
            // Try to handle both string and number inputs safely
            // Sometimes _result.score is pre-calculated BF depending on protocol
            const rawBf = latestAssessment.data.metrics?.body_fat || latestAssessment.data._result?.score;
            const bf = typeof rawBf === 'string' ? parseFloat(rawBf) : Number(rawBf);

            if (!isNaN(bf) && bf > 0) {
                const gender = client?.gender || 'male';
                if (gender === 'female') {
                    // Female Logic
                    if (bf <= 23) compScore = 100;
                    else if (bf >= 40) compScore = 20;
                    else {
                        compScore = 100 - ((bf - 23) * (80 / 17));
                    }
                } else {
                    // Male Logic
                    if (bf <= 15) compScore = 100;
                    else if (bf >= 30) compScore = 20;
                    else {
                        compScore = 100 - ((bf - 15) * (80 / 15));
                    }
                }
            }
        }
        if (isNaN(compScore)) compScore = 60;
        scores[2].A = Math.round(compScore);

        // 4. LOAD MANAGEMENT (Carga/Resistência)
        if (!analyticsMetrics) {
            scores[3].A = 0;
            scores[4].A = 0;
            return scores;
        }

        const acwr = Number(analyticsMetrics.latest?.acwr) || 0;
        let loadScore = 0;
        if (acwr > 0) {
            if (acwr >= 0.8 && acwr <= 1.3) {
                loadScore = 100;
            } else if (acwr < 0.8) {
                loadScore = (acwr / 0.8) * 100;
            } else {
                loadScore = Math.max(0, 100 - ((acwr - 1.3) * (100 / 0.7)));
            }
        }
        if (isNaN(loadScore)) loadScore = 0;
        scores[3].A = Math.round(loadScore);


        // 5. INTENSITY (Intensidade)
        const zoneColor = analyticsMetrics.loadZone?.color;
        let intScore = 70;
        if (zoneColor === '#22c55e') intScore = 100; // Optimal
        else if (zoneColor === '#eab308') intScore = 90; // High
        else if (zoneColor === '#ef4444') intScore = 80; // Very High
        else if (zoneColor === '#94a3b8') intScore = 50; // Low

        if (isNaN(intScore)) intScore = 50;
        scores[4].A = intScore;

        return scores;

    }, [dashboardStats, analyticsMetrics, latestAssessment, client]);
};
