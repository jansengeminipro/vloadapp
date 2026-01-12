import { AssessmentStrategy } from '../AssessmentStrategy';
import { AnalysisResult, FormField } from '../../models';

export class TC6MStrategy implements AssessmentStrategy {
    getTitle(): string {
        return 'Teste de Caminhada de 6 Minutos (TC6M)';
    }

    getFormSchema(): FormField[] {
        return [
            { name: 'distance_meters', label: 'Distância (m)', type: 'number', placeholder: 'Ex: 450' },
            { name: 'final_hr', label: 'FC Final (bpm)', type: 'number', placeholder: 'Ex: 110' },
            { name: 'systolic_bp', label: 'PA Sistólica Final (mmHg)', type: 'number', placeholder: 'Ex: 140' },
            { name: 'weight_kg', label: 'Peso Atual (kg)', type: 'number', placeholder: 'Ex: 70' }
        ];
    }

    validate(data: any): boolean {
        return data.distance_meters > 0 && data.weight_kg > 0;
    }

    calculateResults(data: any, client: any): AnalysisResult {
        const dist = data.distance_meters;
        const hr = data.final_hr || 0;
        const sbp = data.systolic_bp || 120;
        const rpp = hr * sbp;
        const weight = data.weight_kg;
        const age = new Date().getFullYear() - new Date(client.birthDate).getFullYear();
        const heightCm = client.height || 170; // Fallback if missing

        // VO2pico formula from Riebe et al (2017)
        // VO2pico = (0.02 * dist) - (0.191 * idade) - (0.07 * peso) + (0.09 * alt) + (0.26 * RPP * 0.001) + 2.45
        const vo2peak = (0.02 * dist) - (0.191 * age) - (0.07 * weight) + (0.09 * heightCm) + (0.26 * rpp * 0.001) + 2.45;

        return {
            score: dist, // Score usually implies specific meaningful value, here distance is primary result, vo2 is calculated
            classification: 'Aguardando Tabela', // TODO: Norms for dist relative to age/sex
            metrics: {
                distance: `${dist} m`,
                estimated_vo2_peak: `${vo2peak.toFixed(2)} ml/kg/min`,
                rpp: rpp.toString()
            }
        };
    }
}
