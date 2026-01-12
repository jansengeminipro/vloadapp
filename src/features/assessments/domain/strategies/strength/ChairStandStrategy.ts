import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class ChairStandStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Sentar e Levantar (30s)';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'repetitions', label: 'Repetições', type: 'number', placeholder: 'Ex: 14' }
        ];
    }

    validate(data: any): boolean {
        return data.repetitions >= 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const reps = data.repetitions;

        // Example norm check logic placeholder
        // const age = ...
        // const min = ... max = ...

        return {
            score: reps,
            classification: 'Aguardando Tabela', // Rikli & Jones (2001) norms needed
            metrics: {
                repetitions: reps.toString()
            }
        };
    }
}
