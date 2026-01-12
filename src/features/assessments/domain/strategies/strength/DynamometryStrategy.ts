import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class DynamometryStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Dinamometria (Extensão de Joelho)';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'peak_force_kgf', label: 'Pico de Força (kgf)', type: 'number', placeholder: 'Ex: 45' },
            { name: 'limb', label: 'Membro', type: 'select', options: [{ label: 'Direito', value: 'R' }, { label: 'Esquerdo', value: 'L' }] }
        ];
    }

    validate(data: any): boolean {
        return data.peak_force_kgf > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const force = data.peak_force_kgf;

        return {
            score: force,
            classification: 'Aguardando Tabela',
            metrics: {
                force: `${force} kgf`,
                limb: data.limb === 'R' ? 'Direito' : 'Esquerdo'
            }
        };
    }
}
