import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';
import { ClassificationLogic } from '../../logic/classificationTables';

export class CooperStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Teste de Cooper (12 min)';
    }

    getFormSchema(): FormField[] {
        return [
            {
                name: 'distance_meters',
                label: 'Distância Percorrida',
                type: 'number',
                unit: 'metros',
                required: true,
                min: 0,
                max: 5000,
                placeholder: 'Ex: 2400',
                group: 'Resultados do Teste'
            }
        ];
    }

    validate(data: any): boolean {
        return !!data.distance_meters;
    }

    calculateResults(data: any, clientProfile: any): AnalysisResult {
        // VO2max = (Distance_meters - 504.9) / 44.73
        const distance = data.distance_meters;
        const vo2max = (distance - 504.9) / 44.73;
        const age = this.calculateAge(clientProfile.birth_date);

        return {
            score: Number(vo2max.toFixed(2)),
            classification: ClassificationLogic.getVO2Classification(vo2max, age, clientProfile.gender),
            metrics: {
                vo2max: `${vo2max.toFixed(2)} ml/kg/min`,
                distance: `${distance} m`
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
