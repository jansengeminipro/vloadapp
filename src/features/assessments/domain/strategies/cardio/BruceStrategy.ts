import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';
import { ClassificationLogic } from '../../logic/classificationTables';

export class BruceStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Protocolo de Bruce (Esteira)';
    }

    getFormSchema(): FormField[] {
        return [
            {
                name: 'total_time_minutes',
                label: 'Tempo Total de Teste',
                type: 'number',
                unit: 'min',
                required: true,
                placeholder: 'Ex: 9.5',
                group: 'Resultados'
            }
        ];
    }

    validate(data: any): boolean {
        return !!data.total_time_minutes;
    }

    calculateResults(data: any, clientProfile: any): AnalysisResult {
        // VO2max for Men = 14.8 - (1.379 * T) + (0.451 * T^2) - (0.012 * T^3)
        // Women: VO2max = 4.38 * T - 3.9

        const T = Number(data.total_time_minutes);
        let vo2max = 0;

        if (clientProfile.gender === 'male') {
            vo2max = 14.8 - (1.379 * T) + (0.451 * T * T) - (0.012 * T * T * T);
        } else {
            vo2max = 4.38 * T - 3.9;
        }

        if (vo2max < 0) vo2max = 0;
        const age = this.calculateAge(clientProfile.birth_date);

        return {
            score: Number(vo2max.toFixed(2)),
            classification: ClassificationLogic.getVO2Classification(vo2max, age, clientProfile.gender),
            metrics: {
                vo2max: `${vo2max.toFixed(2)} ml/kg/min`,
                duration: `${T} min`
            }
        };
    }

    private calculateAge(birthDateString: string): number {
        if (!birthDateString) return 30;
        const today = new Date();
        const birthDate = new Date(birthDateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}
