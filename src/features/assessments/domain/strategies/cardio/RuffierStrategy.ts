import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class RuffierStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Teste de Agachamento Ruffier';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'p1', label: 'P1 - Repouso (bpm)', type: 'number', placeholder: 'Ex: 70' },
            { name: 'p2', label: 'P2 - Imediato (bpm)', type: 'number', placeholder: 'Ex: 130' },
            { name: 'p3', label: 'P3 - 1 min Rec (bpm)', type: 'number', placeholder: 'Ex: 90' }
        ];
    }

    validate(data: any): boolean {
        return data.p1 > 0 && data.p2 > 0 && data.p3 > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const { p1, p2, p3 } = data;
        const age = new Date().getFullYear() - new Date(client.birthDate).getFullYear();
        const heightM = (client.height || 170) / 100;
        const sexFactor = client.gender === 'male' ? 1 : 0;

        // Formula: VO2max = 3.0143 + 1.1585 * (sexo) - 0.0268 * (P1 / altura) + 118.7611 * ((P2 - P3) / idade^3)
        // Caution: logic check ((P2 - P3) / idade^3) seems to produce tiny numbers. 
        // Let's implement as written in manual.

        const term1 = 3.0143;
        const term2 = 1.1585 * sexFactor;
        const term3 = 0.0268 * (p1 / heightM);
        const term4 = 118.7611 * ((p2 - p3) / Math.pow(age, 3));

        const vo2max = term1 + term2 - term3 + term4;

        // Ruffier Index Calculation (Common alternative)
        // IR = (P1 + P2 + P3 - 200) / 10
        const ruffierIndex = (p1 + p2 + p3 - 200) / 10;

        return {
            score: Number(ruffierIndex.toFixed(1)),
            classification: 'Aguardando Tabela', // Usually IR < 0 Excellent, 0-5 Good, etc.
            metrics: {
                ruffier_index: ruffierIndex.toFixed(1),
                estimated_vo2: `${vo2max.toFixed(2)} ml/kg/min`
            }
        };
    }
}
