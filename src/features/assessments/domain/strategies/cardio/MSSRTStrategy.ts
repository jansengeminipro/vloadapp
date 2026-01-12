import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class MSSRTStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Shuttle Run 20m (MSSRT)';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'final_speed_kmh', label: 'Velocidade Final (km/h)', type: 'number', placeholder: 'Ex: 11.5' },
            { name: 'final_stage', label: 'Estágio Final', type: 'number', placeholder: 'Ex: 8' },
            { name: 'final_hr', label: 'FC Final (bpm)', type: 'number', placeholder: 'Ex: 185' }
        ];
    }

    validate(data: any): boolean {
        return data.final_speed_kmh > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const speed = data.final_speed_kmh;

        // VO2max = 5.857 * velocidade_máxima_kmh - 19.458
        const vo2max = 5.857 * speed - 19.458;

        return {
            score: Number(vo2max.toFixed(2)),
            classification: 'Aguardando Tabela', // TODO: Implement reference table
            metrics: {
                vo2max: `${vo2max.toFixed(2)} ml/kg/min`,
                final_speed: `${speed} km/h`,
                stage: data.final_stage
            }
        };
    }
}
