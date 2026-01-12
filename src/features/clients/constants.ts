import { MuscleGroup, WorkoutTemplate } from '@/shared/types';
import { EXERCISE_DB } from '@/shared/data/exercises';

export const MUSCLE_COLORS: Record<string, string> = {
    [MuscleGroup.Chest]: '#3b82f6',
    [MuscleGroup.Back]: '#10b981',
    [MuscleGroup.Quads]: '#fbbf24',
    [MuscleGroup.Hamstrings]: '#f97316',
    [MuscleGroup.Shoulders]: '#8b5cf6',
    [MuscleGroup.Triceps]: '#ec4899',
    [MuscleGroup.Biceps]: '#06b6d4',
    [MuscleGroup.Calves]: '#64748b',
    [MuscleGroup.Glutes]: '#db2777',
    [MuscleGroup.Abs]: '#a8a29e',
    [MuscleGroup.Adductors]: '#84cc16',
};

export const ANALYTICS_COLORS = {
    LOW: '#22d3ee',        // Cyan
    MEDIUM: '#6366f1',     // Indigo
    HIGH: '#a855f7',       // Purple
    ALERT: '#ef4444',      // Red
    VINHO: '#7f1d1d',      // Dark Vinho (for over-limit)
    SLATE: {
        500: '#64748b',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
    }
};

export const CHART_COLORS = [
    '#3b82f6', '#10b981', '#fbbf24', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4',
    '#ef4444', '#84cc16', '#14b8a6', '#6366f1', '#d946ef', '#f43f5e'
];

export const WEEKDAYS = [
    { label: 'D', val: 0 },
    { label: 'S', val: 1 },
    { label: 'T', val: 2 },
    { label: 'Q', val: 3 },
    { label: 'Q', val: 4 },
    { label: 'S', val: 5 },
    { label: 'S', val: 6 },
];

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [];
