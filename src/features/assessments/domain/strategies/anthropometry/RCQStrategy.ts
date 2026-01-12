import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class RCQStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Relação Cintura-Quadril (RCQ)';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'waist_cm', label: 'Cintura (cm)', type: 'number', placeholder: 'Ex: 80' },
            { name: 'hip_cm', label: 'Quadril (cm)', type: 'number', placeholder: 'Ex: 100' }
        ];
    }

    validate(data: any): boolean {
        return data.waist_cm > 0 && data.hip_cm > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const rcq = Number(data.waist_cm) / Number(data.hip_cm);

        let classification = 'Normal';
        // Risk > 102cm men / > 88cm women for waist alone, 
        // RCQ norms vary (e.g. > 0.95 men, > 0.86 women = risk)
        // Implementing basic ACSM check for now or 'Pending' as we primarily want the value

        return {
            score: Number(rcq.toFixed(2)),
            classification: 'Aguardando Tabela',
            metrics: {
                rcq: rcq.toFixed(2),
                waist: `${data.waist_cm} cm`,
                hip: `${data.hip_cm} cm`
            }
        };
    }
}
