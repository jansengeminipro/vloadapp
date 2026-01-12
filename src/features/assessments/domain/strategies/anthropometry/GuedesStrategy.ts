import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class GuedesStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Guedes (3 Dobras)';
    }

    getFormSchema(): FormField[] {
        // Guedes sites differ by sex, strictly we should show all fields or dynamic fields.
        // For simplicity now, showing fields for both sexes and logic handles selection.
        return [
            { name: 'triceps', label: 'Tríceps (mm)', type: 'number' },
            { name: 'suprailiac', label: 'Supra-ilíaca (mm)', type: 'number' },
            { name: 'abdominal', label: 'Abdominal (mm)', type: 'number' }, // Men
            { name: 'thigh', label: 'Coxa (mm)', type: 'number' }, // Women
            { name: 'subscapular', label: 'Subescapular (mm)', type: 'number' } // Women
        ];
    }

    validate(data: any): boolean {
        return true;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        let sum3 = 0;
        let bodyDensity = 0;

        if (client.gender === 'male') {
            // Men: Triceps + Suprailiac + Abdominal
            sum3 = Number(data.triceps) + Number(data.suprailiac) + Number(data.abdominal);
        } else {
            // Women: Thigh + Suprailiac + Subscapular
            sum3 = Number(data.thigh) + Number(data.suprailiac) + Number(data.subscapular);
        }

        // Densidade Corporal = 1.1714 - 0.0671 * Log10 (Soma 3 dobras)
        if (sum3 > 0) {
            bodyDensity = 1.1714 - 0.0671 * Math.log10(sum3);
        }

        // Siri
        const bodyFat = ((4.95 / bodyDensity) - 4.50) * 100;

        return {
            score: Number(bodyFat.toFixed(1)),
            classification: 'Aguardando Tabela',
            metrics: {
                body_fat: `${bodyFat.toFixed(1)} %`,
                body_density: bodyDensity.toFixed(4),
                sum_3_folds: `${sum3} mm`
            }
        };
    }
}
