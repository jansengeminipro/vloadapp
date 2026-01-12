import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class Pollock7Strategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Pollock 7 Dobras';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'chest', label: 'Peitoral (mm)', type: 'number' },
            { name: 'axillary', label: 'Axilar Média (mm)', type: 'number' },
            { name: 'triceps', label: 'Tríceps (mm)', type: 'number' },
            { name: 'subscapular', label: 'Subescapular (mm)', type: 'number' },
            { name: 'abdominal', label: 'Abdominal (mm)', type: 'number' },
            { name: 'suprailiac', label: 'Supra-ilíaca (mm)', type: 'number' },
            { name: 'thigh', label: 'Coxa (mm)', type: 'number' }
        ];
    }

    validate(data: any): boolean {
        // Simple check: most folds should be > 0
        return Object.values(data).some((v: any) => v > 0);
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const sum7 = Number(data.chest) + Number(data.axillary) + Number(data.triceps) +
            Number(data.subscapular) + Number(data.abdominal) + Number(data.suprailiac) + Number(data.thigh);

        const age = new Date().getFullYear() - new Date(client.birthDate).getFullYear();
        let bodyDensity = 0;

        // Jackson & Pollock 7-site equations
        if (client.gender === 'male') {
            bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age);
        } else {
            bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age);
        }

        // Siri Equation
        const bodyFat = ((4.95 / bodyDensity) - 4.50) * 100;

        return {
            score: Number(bodyFat.toFixed(1)),
            classification: 'Aguardando Tabela',
            metrics: {
                body_fat: `${bodyFat.toFixed(1)} %`,
                sum_7_folds: `${sum7} mm`,
                body_density: bodyDensity.toFixed(4)
            }
        };
    }
}
