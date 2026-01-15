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

        if (!dashboardStats || !analyticsMetrics) return scores;

        // 1. CONSISTENCY (Consistência)
        // (Completed / Planned) * 100
        const plannedSessions = dashboardStats.plannedWeeklySessions || 1;
        const currentSessions = dashboardStats.weekSessionsCount || 0;
        let consistencyScore = (currentSessions / plannedSessions) * 100;
        if (consistencyScore > 100) consistencyScore = 100;
        scores[0].A = Math.round(consistencyScore);

        // 2. VOLUME
        // (Current Sets / Planned Sets) * 100
        const plannedSets = dashboardStats.plannedWeeklySets || 1;
        const currentSets = dashboardStats.currentWeeklySets || 0;
        let volumeScore = (currentSets / plannedSets) * 100;
        if (volumeScore > 100) volumeScore = 100;
        scores[1].A = Math.round(volumeScore);

        // 3. COMPOSITION (Composição Corporal)
        // Based on Body Fat % (Lower is better approx for fit/athletic context)
        // Male: 15% is excellent (100), 30% is poor (0)
        // Female: 23% is excellent (100), 40% is poor (0)
        let compScore = 60; // Default average
        if (latestAssessment?.data) {
            const bf = parseFloat(latestAssessment.data.metrics?.body_fat || latestAssessment.data._result?.score || 0);
            const gender = client?.gender || 'male';

            if (bf > 0) {
                if (gender === 'female') {
                    // Female Logic
                    if (bf <= 23) compScore = 100;
                    else if (bf >= 40) compScore = 20;
                    else {
                        // Linear interpolation between 23 (100pts) and 40 (20pts)
                        compScore = 100 - ((bf - 23) * (80 / 17));
                    }
                } else {
                    // Male Logic
                    if (bf <= 15) compScore = 100;
                    else if (bf >= 30) compScore = 20;
                    else {
                        // Linear interpolation between 15 (100pts) and 30 (20pts)
                        compScore = 100 - ((bf - 15) * (80 / 15));
                    }
                }
            }
        }
        scores[2].A = Math.round(compScore);

        // 4. LOAD MANAGEMENT (Carga/Resistência)
        // Based on ACWR Sweet Spot (0.8 - 1.3)
        // 1.0 = Perfect (100)
        // Deviation from 1.0 reduces score
        const acwr = analyticsMetrics.latest?.acwr || 0;
        let loadScore = 0;
        if (acwr > 0) {
            if (acwr >= 0.8 && acwr <= 1.3) {
                loadScore = 100;
                // Maybe minor penalty for exact 0.8 or 1.3 edge? Nah, keep simple.
            } else if (acwr < 0.8) {
                // Undertraining: 0.0 -> 0pts, 0.8 -> 100pts
                loadScore = (acwr / 0.8) * 100;
            } else {
                // Overtraining: 1.3 -> 100pts, 2.0 -> 0pts
                loadScore = Math.max(0, 100 - ((acwr - 1.3) * (100 / 0.7)));
            }
        }
        scores[3].A = Math.round(loadScore);


        // 5. INTENSITY (Intensidade)
        // Placeholder as we don't have RPE avg in dashboardStats yet.
        // Assuming 'load' zone color might indicate intensity, but let's be safer.
        // We'll calculate a proxy based on RPE if available in sessions, or default to 75.
        // dashboardStats doesn't strictly have RPE. analyticsMetrics might have load data.
        // Let's assume a good "Fit" user for now or try to extract RPE from `completedSessions` if feasible using a helper,
        // but since this hook receives high level stats, let's use a placeholder logic:
        // If they are training consistent + Volume is high, Intensity is likely decent.
        // IMPROVEMENT: Use the `loadZone` from analyticsMetrics.
        // green = optimal (100), yellow = high (90), red = very high (80 - careful), gray = low (50)
        const zoneColor = analyticsMetrics.loadZone?.color;
        let intScore = 70;
        if (zoneColor === '#22c55e') intScore = 100; // Optimal
        else if (zoneColor === '#eab308') intScore = 90; // High
        else if (zoneColor === '#ef4444') intScore = 80; // Very High
        else if (zoneColor === '#94a3b8') intScore = 50; // Low
        scores[4].A = intScore;

        return scores;

    }, [dashboardStats, analyticsMetrics, latestAssessment, client]);
};
