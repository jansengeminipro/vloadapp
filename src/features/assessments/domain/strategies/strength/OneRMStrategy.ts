import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class OneRMStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Teste de 1-RM (Supino/Leg Press)';
    }

    getFormSchema(): FormField[] {
        return [
            {
                name: 'exercise_type',
                label: 'Exercício',
                type: 'select',
                options: [
                    { label: 'Supino Reto', value: 'bench_press' },
                    { label: 'Leg Press', value: 'leg_press' }
                ]
            },
            { name: 'max_load_kg', label: 'Carga Máxima (kg)', type: 'number', placeholder: 'Ex: 80' },
            { name: 'body_weight_kg', label: 'Peso Corporal (kg)', type: 'number', placeholder: 'Ex: 75' }
        ];
    }

    validate(data: any): boolean {
        return data.max_load_kg > 0 && data.body_weight_kg > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const relativeStrength = data.max_load_kg / data.body_weight_kg;

        return {
            score: Number(relativeStrength.toFixed(2)),
            classification: 'Aguardando Tabela', // Needs Age/Sex/Exercise specific tables
            metrics: {
                max_load: `${data.max_load_kg} kg`,
                relative_strength: relativeStrength.toFixed(2)
            }
        };
    }
}
