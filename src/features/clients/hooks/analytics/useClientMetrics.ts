import { useMemo } from 'react';
import { SavedSession } from '@/shared/types';
import { calculateACWRMetrics } from '@/shared/utils/analytics';

export const useClientMetrics = (sessions: SavedSession[], startDate: Date) => {

    // Systemic Load (Advanced Metrics)
    const advancedAnalyticsData = useMemo(() => {
        return sessions
            .filter(s => new Date(s.date) >= startDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(session => {
                let totalSets = 0;
                let totalRir = 0;

                session.details.forEach((ex: any) => {
                    if (ex.setDetails) {
                        ex.setDetails.forEach((set: any) => {
                            const rir = parseFloat(set.rir);
                            const safeRIR = isNaN(rir) ? 0 : rir;

                            totalSets++;
                            totalRir += safeRIR;
                        });
                    } else {
                        const sets = ex.sets || 0;
                        totalSets += sets;
                        totalRir += (2 * sets);
                    }
                });

                const avgRir = totalSets > 0 ? totalRir / totalSets : 0;
                const internalLoad = Math.round(totalSets * (10 - avgRir));

                return {
                    date: new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                    fullDate: new Date(session.date).toLocaleDateString(),
                    internalLoad: internalLoad,
                    avgRir: avgRir.toFixed(1),
                    totalSets: totalSets
                };
            });
    }, [sessions, startDate]);

    // ACWR
    const acwrData = useMemo(() => {
        const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const metrics = calculateACWRMetrics(sortedSessions);
        return metrics.filter(m => m.timestamp >= startDate.getTime());
    }, [sessions, startDate]);

    return {
        advancedAnalyticsData,
        acwrData
    };
};
