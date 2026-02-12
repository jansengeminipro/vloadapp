/**
 * Service Layer Barrel File
 * 
 * Centralizes all service exports for easy importing throughout the app.
 * Usage: import { getClientSessions, saveAssessment } from '@/services';
 */

// Analytics & Sessions
export {
    getClientSessions,
    getLatestAssessment,
    getLatestAssessmentsByCategory,
    CARDIO_TYPES,
    STRENGTH_TYPES,
    BODY_COMP_TYPES
} from './analyticsService';

// Assessments




// Programs
export {
    saveClientProgram,
    deleteClientProgram,
    getActiveProgram,
    getCoachTemplates
} from './programService';
