export type AssessmentType = 'anthropometry' | 'strength' | 'cardio' | 'postural' | 'flexibility' | 'mobility';

export interface Assessment {
    id: string;
    client_id: string;
    coach_id: string;
    date: string;
    type: AssessmentType;
    data: Record<string, any>; // JSONB
    notes?: string;
    created_at: string;
}

export interface AnalysisResult {
    score?: number;
    classification: string;
    metrics: Record<string, number | string>;
    warnings?: string[];
}

export interface FormField {
    name: string;
    label: string;
    type: 'number' | 'text' | 'select' | 'date' | 'radio';
    unit?: string;
    options?: { label: string; value: string }[];
    group?: string;
    required?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
}
