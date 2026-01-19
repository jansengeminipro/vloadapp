

export enum MuscleGroup {
  Chest = 'Peitoral',
  Back = 'Costas',
  Quads = 'Quadríceps',
  Hamstrings = 'Posteriores',
  Shoulders = 'Ombros',
  Triceps = 'Tríceps',
  Biceps = 'Bíceps',
  Calves = 'Panturrilhas',
  Glutes = 'Glúteos',
  Abs = 'Abdômen',
  Adductors = 'Adutores'
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup | string; // Allow string for mapping flexibility
  equipment: string;
  videoUrl?: string;
  agonists: string[];
  synergists: string[];

  // Multi-tenant fields
  isGlobal?: boolean;
  ownerId?: string;
}


export interface WorkoutExercise extends Exercise {
  sets: number;
  targetReps: string; // e.g. "8-12"
  targetRIR: number; // e.g. 2
  restSeconds: number;
  alternatives?: WorkoutExercise[];
}

export interface Set {
  id: string;
  weight: number;
  reps: number;
  rir: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: Set[];
  restTimerSeconds: number;
  lastSessionSummary?: string; // e.g., "80kg x 10 @ RIR 2"
}

export interface ClientProgram {
  id: string;
  name: string; // e.g., "Mesociclo de Força 1"
  startDate: string;
  endDate: string;
  workoutIds: string[]; // List of Template IDs belonging to this program
  schedule?: Record<string, number[]>; // templateId -> array of days [0-6] (0=Mon, 6=Sun)
}

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastWorkout: string; // ISO Date
  nextWorkout: string;
  avatarUrl: string;
  activeProgram?: ClientProgram;

  // New Fields
  email?: string;
  phone?: string;
  birthDate?: string; // YYYY-MM-DD
  weight?: number; // kg
  height?: number; // cm
  gender?: 'male' | 'female';
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'pr' | 'stagnation' | 'optimization';
  clientId: string;
  clientName: string;
  message: string;
  date: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  lastModified: string;
  focus: string; // e.g. "Hypertrophy", "Strength"
  exercises: WorkoutExercise[];
}

export interface SavedSession {
  id: string;
  clientId: string;
  templateId: string;
  templateName: string;
  date: string;
  durationSeconds: number;
  totalSets: number;
  volumeLoad: number;
  details: any[];
  rpe?: number;
  status: 'completed' | 'planned' | 'missed';
}