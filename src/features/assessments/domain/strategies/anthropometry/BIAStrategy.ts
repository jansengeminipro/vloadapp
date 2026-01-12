import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class BIAStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Bioimpedância Elétrica (BIA)';
    }

    getFormSchema(): FormField[] {
        // User inputs results directly from the device
        return [
            { name: 'body_fat_percent', label: 'Gordura Corporal (%)', type: 'number' },
            { name: 'muscle_mass_kg', label: 'Massa Muscular (kg)', type: 'number' },
            { name: 'water_percent', label: 'Água Corporal (%)', type: 'number' },
            { name: 'visceral_fat', label: 'Gordura Visceral', type: 'number' },
            { name: 'basal_metabolic_rate', label: 'Taxa Metabólica Basal (kcal)', type: 'number' }
        ];
    }

    validate(data: any): boolean {
        return data.body_fat_percent > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        return {
            score: Number(data.body_fat_percent),
            classification: 'Aguardando Tabela', // BIA devices usually have their own scales
            metrics: {
                body_fat: `${data.body_fat_percent} %`,
                muscle_mass: `${data.muscle_mass_kg} kg`,
                visceral_level: data.visceral_fat,
                water: `${data.water_percent} %`
            }
        };
    }
}
