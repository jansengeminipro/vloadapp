
import { ExerciseLog, MuscleGroup } from '../types';
import { EXERCISE_DB } from '../data/exercises';

export interface DailyLoadMetric {
  date: string; // YYYY-MM-DD
  timestamp: number;
  dailyLoad: number; // UA
  avgRir: number;
  acuteLoad: number; // 7-day avg
  chronicLoad: number; // 28-day avg
  acwr: number; // Ratio
}

// Helper to normalize dates to midnight
const getMidnight = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Generate date range array
const generateDateRange = (start: Date, end: Date) => {
  const arr = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

/**
 * Calculates Internal Load based on RPE derived from RIR.
 * Formula: Sets * (10 - RIR)
 */
export const calculateSessionInternalLoad = (totalSets: number, avgRir: number): number => {
  const rpe = Math.max(0, 10 - avgRir);
  return Math.round(totalSets * rpe);
};

/**
 * Returns color and label based on Internal Load Zones
 */
export const getInternalLoadZone = (load: number) => {
  if (load < 80) return { color: '#22d3ee', label: 'Baixa (Recuperativa)', fill: '#22d3ee' }; // Cyan
  if (load <= 150) return { color: '#6366f1', label: 'Moderada (Alvo)', fill: '#6366f1' }; // Indigo
  if (load <= 220) return { color: '#a855f7', label: 'Alta', fill: '#a855f7' }; // Purple
  return { color: '#ef4444', label: 'Extrema (Alerta)', fill: '#ef4444' }; // Red
};

export const calculateACWRMetrics = (sessions: any[]): DailyLoadMetric[] => {
  if (!sessions || sessions.length === 0) return [];

  // 1. Map sessions to daily loads
  const loadMap = new Map<string, { totalLoad: number; totalRir: number; setVolume: number }>();

  sessions.forEach(session => {
    // Defensive check for session.date
    if (!session || !session.date) return;

    const dateKey = getMidnight(new Date(session.date)).toISOString().split('T')[0];

    let sessionLoad = 0;
    let sessionRirSum = 0;
    let sessionSetCount = 0;

    if (session.details && Array.isArray(session.details)) {
      session.details.forEach((ex: any) => {
        if (ex.setDetails && Array.isArray(ex.setDetails)) {
          ex.setDetails.forEach((set: any) => {
            const rir = parseFloat(set.rir);
            const safeRIR = isNaN(rir) ? 0 : rir;

            // RPE Based on RIR (RPE = 10 - RIR)
            const rpe = Math.max(0, 10 - safeRIR);
            sessionLoad += rpe;
            sessionRirSum += safeRIR;
            sessionSetCount++;
          });
        } else {
          // Fallback if no detailed set data (using session totals)
          const sets = ex.sets || 0;
          sessionLoad += (8 * sets);
          sessionSetCount += sets;
          sessionRirSum += (2 * sets);
        }
      });
    }

    if (!loadMap.has(dateKey)) {
      loadMap.set(dateKey, { totalLoad: 0, totalRir: 0, setVolume: 0 });
    }

    const entry = loadMap.get(dateKey)!;
    entry.totalLoad += sessionLoad;
    entry.totalRir += sessionRirSum;
    entry.setVolume += sessionSetCount;
  });

  // 2. Create continuous timeline (filling gaps with 0)
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedSessions.length === 0) return [];

  const startDate = getMidnight(new Date(sortedSessions[0].date));
  const endDate = getMidnight(new Date()); // Up to today

  const timeline = generateDateRange(startDate, endDate);
  const result: DailyLoadMetric[] = [];

  // Optimized rolling averages using running sums
  let acuteSum = 0;
  let chronicSum = 0;
  const loadsArray: number[] = [];

  timeline.forEach((date, i) => {
    const dateKey = date.toISOString().split('T')[0];
    const data = loadMap.get(dateKey);

    const dailyLoad = data ? data.totalLoad : 0;
    const avgRir = data && data.setVolume > 0 ? data.totalRir / data.setVolume : 0;

    loadsArray.push(dailyLoad);

    // Update Acute Sum (7 days)
    acuteSum += dailyLoad;
    if (i >= 7) {
      acuteSum -= loadsArray[i - 7];
    }
    const acuteLoad = acuteSum / 7;

    // Update Chronic Sum (28 days)
    chronicSum += dailyLoad;
    if (i >= 28) {
      chronicSum -= loadsArray[i - 28];
    }
    const chronicLoad = chronicSum / 28;

    // ACWR Ratio
    const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;

    result.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      timestamp: date.getTime(),
      dailyLoad: Math.round(dailyLoad),
      avgRir: parseFloat(avgRir.toFixed(1)),
      acuteLoad: parseFloat(acuteLoad.toFixed(1)),
      chronicLoad: parseFloat(chronicLoad.toFixed(1)),
      acwr: parseFloat(acwr.toFixed(2))
    });
  });

  return result;
};

export const getACWRStatus = (ratio: number) => {
  if (ratio === 0) return { label: "Dados Insuficientes", color: "#64748b" }; // Slate 500
  if (ratio < 0.8) return { label: "Subtreinamento", color: "#22d3ee" }; // Cyan
  if (ratio <= 1.3) return { label: "Sweet Spot (Ideal)", color: "#6366f1" }; // Indigo
  if (ratio <= 1.5) return { label: "Risco Aumentado", color: "#a855f7" }; // Purple
  return { label: "Alto Risco de Lesão", color: "#ef4444" }; // Red
};

export const safeGetMonday = (d: Date | string) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const normalizeMuscleForChart = (specificMuscle: string): string => {
  if (!specificMuscle) return '';
  const m = specificMuscle.toLowerCase().trim();
  if (m.includes('peitoral') || m.includes('peito')) return MuscleGroup.Chest;
  if (m.includes('deltoide') || m.includes('ombro')) return MuscleGroup.Shoulders;
  if (m.includes('dorsal') || m.includes('trapézio') || m.includes('costas')) return MuscleGroup.Back;
  if (m.includes('bíceps') || m.includes('biceps')) return MuscleGroup.Biceps;
  if (m.includes('tríceps') || m.includes('triceps')) return MuscleGroup.Triceps;
  if (m.includes('quadríceps') || m.includes('quadriceps') || m.includes('coxa')) return MuscleGroup.Quads;
  if (m.includes('isquiotibiais') || m.includes('posterior')) return MuscleGroup.Hamstrings;
  if (m.includes('glúteo') || m.includes('gluteo')) return MuscleGroup.Glutes;
  if (m.includes('panturrilha')) return MuscleGroup.Calves;
  if (m.includes('adutor')) return MuscleGroup.Adductors;
  if (m.includes('abdominal') || m.includes('core') || m.includes('abdômen') || m.includes('abdomen')) return MuscleGroup.Abs;
  return specificMuscle.charAt(0).toUpperCase() + specificMuscle.slice(1);
};
