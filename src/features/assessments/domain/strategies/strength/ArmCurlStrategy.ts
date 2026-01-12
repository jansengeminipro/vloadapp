import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class ArmCurlStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Teste de Flexão de Braço (30s)';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'repetitions', label: 'Repetições', type: 'number', placeholder: 'Ex: 18' }
        ];
    }

    validate(data: any): boolean {
        return data.repetitions >= 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const reps = data.repetitions;

        return {
            score: reps,
            classification: 'Aguardando Tabela', // Rikli & Jones (2001) norms needed
            metrics: {
                repetitions: reps.toString()
            }
        };
    }
}
