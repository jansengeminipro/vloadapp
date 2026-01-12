import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class FaulknerStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Faulkner (4 Dobras)';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'triceps', label: 'Tríceps (mm)', type: 'number' },
            { name: 'subscapular', label: 'Subescapular (mm)', type: 'number' },
            { name: 'suprailiac', label: 'Supra-ilíaca (mm)', type: 'number' },
            { name: 'abdominal', label: 'Abdominal (mm)', type: 'number' }
        ];
    }

    validate(data: any): boolean {
        return data.triceps > 0 && data.subscapular > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const sum4 = Number(data.triceps) + Number(data.subscapular) + Number(data.suprailiac) + Number(data.abdominal);

        // Faulkner Equation: %G = 0.153 * (Soma 4 dobras) + 5.783
        const bodyFat = 0.153 * sum4 + 5.783;

        return {
            score: Number(bodyFat.toFixed(1)),
            classification: 'Aguardando Tabela',
            metrics: {
                body_fat: `${bodyFat.toFixed(1)} %`,
                sum_4_folds: `${sum4} mm`
            }
        };
    }
}
