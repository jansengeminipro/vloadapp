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
export {
    saveAssessment,
    getClientAssessments,
    deleteAssessment
} from './assessmentsService';

// Clients
export {
    getClientProfile,
    updateClientProfile
} from './clientService';

// Programs
export {
    saveClientProgram,
    deleteClientProgram,
    getActiveProgram,
    getCoachTemplates
} from './programService';
