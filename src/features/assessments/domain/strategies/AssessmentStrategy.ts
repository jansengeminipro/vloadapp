import { AnalysisResult, FormField } from '../models';

export interface AssessmentStrategy {
    /**
     * Calculates the results and classification based on the input data and client profile.
     */
    calculateResults(data: any, clientProfile: any): AnalysisResult;

    /**
     * Validates if the input data is sufficient and correct for the calculation.
     */
    validate(data: any): boolean;

    /**
     * Returns the schema for generating the UI form.
     */
    getFormSchema(): FormField[];

    /**
     * Helper to get the display title of the specific test/protocol
     */
    getTitle(): string;
}
