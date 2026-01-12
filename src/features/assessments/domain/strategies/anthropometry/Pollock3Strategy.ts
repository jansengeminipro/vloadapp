import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';
import { ClassificationLogic } from '../../logic/classificationTables';

export class Pollock3Strategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Protocolo de Pollock (3 Dobras)';
    }

    getFormSchema(): FormField[] {
        // This is tricky because fields depend on Gender. 
        // For now, I'll request the relevant 5 sites to cover both genders + weight/height
        return [
            { name: 'weight_kg', label: 'Peso', type: 'number', unit: 'kg', required: true, group: 'Geral' },
            { name: 'height_cm', label: 'Altura', type: 'number', unit: 'cm', required: true, group: 'Geral' },
            { name: 'chest', label: 'Peitoral (H)', type: 'number', unit: 'mm', group: 'Dobras (Homens)' },
            { name: 'abdomen', label: 'Abdominal (H)', type: 'number', unit: 'mm', group: 'Dobras (Homens)' },
            { name: 'thigh', label: 'Coxa (H/M)', type: 'number', unit: 'mm', required: true, group: 'Dobras (Geral)' },
            { name: 'triceps', label: 'Tríceps (M)', type: 'number', unit: 'mm', group: 'Dobras (Mulheres)' },
            { name: 'suprailiac', label: 'Supra-ilíaca (M)', type: 'number', unit: 'mm', group: 'Dobras (Mulheres)' },
        ];
    }

    validate(data: any): boolean {
        return !!(data.weight_kg && data.height_cm);
    }

    calculateResults(data: any, clientProfile: any): AnalysisResult {
        const age = this.calculateAge(clientProfile.birth_date);
        const { gender } = clientProfile;
        let sum = 0;
        let density = 0;

        if (gender === 'male') {
            // Chest, Abdomen, Thigh
            sum = (Number(data.chest) || 0) + (Number(data.abdomen) || 0) + (Number(data.thigh) || 0);
            // DC = 1.10938 - 0.0008267(Sum) + 0.0000016(Sum^2) - 0.0002574(Age)
            density = 1.10938 - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * age);
        } else {
            // Triceps, Suprailiac, Thigh
            sum = (Number(data.triceps) || 0) + (Number(data.suprailiac) || 0) + (Number(data.thigh) || 0);
            // DC = 1.0994921 - 0.0009929(Sum) + 0.0000023(Sum^2) - 0.0001392(Age)
            density = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * age);
        }

        // Siri Equation: %BF = (495 / Density) - 450
        const bodyFat = (495 / density) - 450;

        // Fat Mass and Lean Mass
        const fatMass = data.weight_kg * (bodyFat / 100);
        const leanMass = data.weight_kg - fatMass;

        return {
            score: Number(bodyFat.toFixed(2)),
            classification: ClassificationLogic.getBFClassification(bodyFat, age, gender),
            metrics: {
                body_fat: `${bodyFat.toFixed(2)} %`,
                fat_mass: `${fatMass.toFixed(2)} kg`,
                lean_mass: `${leanMass.toFixed(2)} kg`,
                sum_skinfolds: `${sum} mm`,
                density: density.toFixed(4)
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
