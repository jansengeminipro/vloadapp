import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class BMIStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Índice de Massa Corporal (IMC)';
    }

    getFormSchema(): FormField[] {
        return [
            {
                name: 'weight_kg',
                label: 'Peso',
                type: 'number',
                unit: 'kg',
                required: true,
                min: 0,
                max: 300,
                placeholder: 'Ex: 80',
                group: 'Dados Básicos'
            },
            {
                name: 'height_cm',
                label: 'Altura',
                type: 'number',
                unit: 'cm',
                required: true,
                min: 0,
                max: 250,
                placeholder: 'Ex: 175',
                group: 'Dados Básicos'
            }
        ];
    }

    validate(data: any): boolean {
        return !!(data.weight_kg && data.height_cm);
    }

    calculateResults(data: any, clientProfile: any): AnalysisResult {
        const weight = Number(data.weight_kg);
        const heightM = Number(data.height_cm) / 100;

        const bmi = weight / (heightM * heightM);
        const bmiFixed = Number(bmi.toFixed(2));

        return {
            score: bmiFixed,
            classification: this.classifyBMI(bmiFixed),
            metrics: {
                bmi: `${bmiFixed} kg/m²`,
                weight: `${weight} kg`,
                height: `${heightM} m`
            }
        };
    }

    private classifyBMI(bmi: number): string {
        if (bmi < 18.5) return 'Abaixo do Peso';
        if (bmi < 24.9) return 'Peso Normal';
        if (bmi < 29.9) return 'Sobrepeso';
        if (bmi < 34.9) return 'Obesidade Grau 1';
        if (bmi < 39.9) return 'Obesidade Grau 2';
        return 'Obesidade Grau 3';
    }
}
