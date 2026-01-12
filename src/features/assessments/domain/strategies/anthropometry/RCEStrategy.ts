import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class RCEStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Relação Cintura-Estatura (RCE)';
    }

    getFormSchema(): FormField[] {
        return [
            {
                name: 'waist_cm',
                label: 'Circunferência da Cintura',
                type: 'number',
                unit: 'cm',
                required: true,
                group: 'Medidas'
            },
            {
                name: 'height_cm',
                label: 'Altura',
                type: 'number',
                unit: 'cm',
                required: true,
                group: 'Medidas'
            }
        ];
    }

    validate(data: any): boolean {
        return !!(data.waist_cm && data.height_cm);
    }

    calculateResults(data: any, clientProfile: any): AnalysisResult {
        const waist = Number(data.waist_cm);
        const height = Number(data.height_cm);

        const rce = waist / height;
        const rceFixed = Number(rce.toFixed(2));

        return {
            score: rceFixed,
            classification: this.classifyRCE(rceFixed, clientProfile.age, clientProfile.gender),
            metrics: {
                rce: rceFixed.toString(),
                risk_level: rceFixed > 0.5 ? 'Aumentado' : 'Baixo'
            }
        };
    }

    private classifyRCE(rce: number, age: number, gender: string): string {
        // General cutoff is 0.5 for health risk
        if (rce <= 0.5) return 'Baixo Risco';
        return 'Risco Aumentado';
    }
}
