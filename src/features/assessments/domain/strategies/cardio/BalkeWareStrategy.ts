import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class BalkeWareStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Protocolo de Balke e Ware';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'duration_minutes', label: 'Tempo Total (min)', type: 'number', placeholder: 'Ex: 15' },
            { name: 'final_hr', label: 'FC Final (bpm)', type: 'number', placeholder: 'Ex: 175' }
        ];
    }

    validate(data: any): boolean {
        return data.duration_minutes > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const time = data.duration_minutes;
        const sex = client.gender === 'female' ? 'female' : 'male';

        let vo2max = 0;
        if (sex === 'male') {
            vo2max = 1.444 * time + 14.99;
        } else {
            vo2max = 1.38 * time + 5.22;
        }

        return {
            score: Number(vo2max.toFixed(2)),
            classification: 'Aguardando Tabela', // TODO: Implement reference table
            metrics: {
                vo2max: `${vo2max.toFixed(2)} ml/kg/min`,
                duration: `${time} min`
            }
        };
    }
}
