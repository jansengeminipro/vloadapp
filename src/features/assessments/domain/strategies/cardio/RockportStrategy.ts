import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';
import { ClassificationLogic } from '../../logic/classificationTables';

export class RockportStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Teste de 1 Milha (Rockport)';
    }

    getFormSchema(): FormField[] {
        return [
            {
                name: 'weight_kg',
                label: 'Peso Corporal',
                type: 'number',
                unit: 'kg',
                required: true,
                min: 30,
                max: 200,
                group: 'Dados Básicos'
            },
            {
                name: 'time_minutes',
                label: 'Tempo Total',
                type: 'number',
                unit: 'min',
                required: true,
                placeholder: 'Ex: 15.5',
                group: 'Resultados do Teste'
            },
            {
                name: 'heart_rate',
                label: 'FC Final',
                type: 'number',
                unit: 'bpm',
                required: true,
                min: 40,
                max: 220,
                group: 'Resultados do Teste'
            }
        ];
    }

    validate(data: any): boolean {
        return !!(data.weight_kg && data.time_minutes && data.heart_rate);
    }

    calculateResults(data: any, clientProfile: any): AnalysisResult {
        // Safe defaults from profile if not provided in data (though form usually asks for weight to be current)
        const age = this.calculateAge(clientProfile.birth_date);
        const genderFactor = clientProfile.gender === 'male' ? 1 : 0;
        const weightLb = data.weight_kg * 2.20462;

        // VO2max = 132.853 - (0.0769 × Weight_lb) - (0.3877 × Age) + (6.315 × Sex) - (3.2649 × Time) - (0.1565 × HR)
        const vo2max = 132.853
            - (0.0769 * weightLb)
            - (0.3877 * age)
            + (6.315 * genderFactor)
            - (3.2649 * data.time_minutes)
            - (0.1565 * data.heart_rate);

        return {
            score: Number(vo2max.toFixed(2)),
            classification: ClassificationLogic.getVO2Classification(vo2max, age, clientProfile.gender),
            metrics: {
                vo2max: `${vo2max.toFixed(2)} ml/kg/min`,
                age_used: age,
                weight_used: `${data.weight_kg} kg`
            }
        };
    }

    private calculateAge(birthDateString: string): number {
        if (!birthDateString) return 30; // Default fallback
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
