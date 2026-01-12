import { useMemo } from 'react';
import { SavedSession } from '@/shared/types';
import { calculateACWRMetrics, getACWRStatus, getInternalLoadZone, safeGetMonday } from '@/shared/utils/analytics';

export const useClientDashboardData = (completedSessions: SavedSession[]) => {
    return useMemo(() => {
        if (!completedSessions.length) return null;

        const metrics = calculateACWRMetrics(completedSessions);
        if (!metrics.length) return null;

        const latest = metrics[metrics.length - 1];
        const status = getACWRStatus(latest.acwr);
        const loadZone = getInternalLoadZone(latest.dailyLoad);

        // Previous Reference (Average of the week before last)
        const prevCycleIdx = metrics.length > 7 ? metrics.length - 8 : 0;
        const prevLatest = metrics[prevCycleIdx] || latest;

        // Calculate weekly internal load (Current: last 7 days, Previous: 7-14 days ago)
        const weeklyLoadSum = metrics.slice(-7).reduce((acc, curr) => acc + curr.dailyLoad, 0);
        const weeklyLoadSumPrev = metrics.length >= 14 ? metrics.slice(-14, -7).reduce((acc, curr) => acc + curr.dailyLoad, 0) : 0;

        // Acute/Chronic previous references for deltas
        // We'll use the values from 7 days ago as a baseline for the boxes
        const acutePrev = prevLatest.acuteLoad;
        const chronicPrev = prevLatest.chronicLoad;

        // Previous Week Reference (Calendar week)
        const now = new Date();
        const lastWeekStart = new Date(safeGetMonday(now));
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 7);

        const lastWeekSessions = completedSessions.filter(s => {
            const d = new Date(s.date);
            return d >= lastWeekStart && d < lastWeekEnd;
        });

        const lastWeekSets = lastWeekSessions.reduce((acc, s) => acc + s.totalSets, 0);

        return {
            latest,
            status,
            loadZone,
            weeklyLoadSum,
            weeklyLoadSumPrev,
            acutePrev,
            chronicPrev,
            prevSessionsCount: lastWeekSessions.length,
            prevSetsCount: lastWeekSets
        };
    }, [completedSessions]);
};
