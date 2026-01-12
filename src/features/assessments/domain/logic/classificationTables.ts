
export type Gender = 'male' | 'female';

export interface ClassificationTable {
    getVO2Classification(vo2: number, age: number, gender: string): string;
    getBFClassification(bf: number, age: number, gender: string): string;
}

export const ClassificationLogic = {
    /**
     * Classificação de VO2max baseada no ACSM (valores aproximados)
     */
    getVO2Classification(vo2: number, age: number, gender: string): string {
        const isMale = gender === 'male';

        if (isMale) {
            if (age < 30) {
                if (vo2 > 51) return 'Excelente';
                if (vo2 > 43) return 'Bom';
                if (vo2 > 35) return 'Médio';
                if (vo2 > 30) return 'Fraco';
                return 'Muito Fraco';
            } else if (age < 40) {
                if (vo2 > 50) return 'Excelente';
                if (vo2 > 40) return 'Bom';
                if (vo2 > 34) return 'Médio';
                if (vo2 > 26) return 'Fraco';
                return 'Muito Fraco';
            } else if (age < 50) {
                if (vo2 > 45) return 'Excelente';
                if (vo2 > 36) return 'Bom';
                if (vo2 > 31) return 'Médio';
                if (vo2 > 25) return 'Fraco';
                return 'Muito Fraco';
            } else {
                if (vo2 > 40) return 'Excelente';
                if (vo2 > 32) return 'Bom';
                if (vo2 > 26) return 'Médio';
                if (vo2 > 20) return 'Fraco';
                return 'Muito Fraco';
            }
        } else {
            // Female
            if (age < 30) {
                if (vo2 > 44) return 'Excelente';
                if (vo2 > 36) return 'Bom';
                if (vo2 > 31) return 'Médio';
                if (vo2 > 27) return 'Fraco';
                return 'Muito Fraco';
            } else if (age < 40) {
                if (vo2 > 41) return 'Excelente';
                if (vo2 > 34) return 'Bom';
                if (vo2 > 29) return 'Médio';
                if (vo2 > 24) return 'Fraco';
                return 'Muito Fraco';
            } else if (age < 50) {
                if (vo2 > 38) return 'Excelente';
                if (vo2 > 31) return 'Bom';
                if (vo2 > 26) return 'Médio';
                if (vo2 > 22) return 'Fraco';
                return 'Muito Fraco';
            } else {
                if (vo2 > 32) return 'Excelente';
                if (vo2 > 25) return 'Bom';
                if (vo2 > 21) return 'Médio';
                if (vo2 > 17) return 'Fraco';
                return 'Muito Fraco';
            }
        }
    },

    /**
     * Classificação de % de Gordura baseada em Pollock/Lohman
     */
    getBFClassification(bf: number, age: number, gender: string): string {
        const isMale = gender === 'male';

        if (isMale) {
            if (age < 30) {
                if (bf < 10) return 'Excelente';
                if (bf < 15) return 'Bom';
                if (bf < 19) return 'Médio';
                if (bf < 23) return 'Alto';
                return 'Muito Alto';
            } else if (age < 40) {
                if (bf < 12) return 'Excelente';
                if (bf < 17) return 'Bom';
                if (bf < 21) return 'Médio';
                if (bf < 25) return 'Alto';
                return 'Muito Alto';
            } else if (age < 50) {
                if (bf < 15) return 'Excelente';
                if (bf < 20) return 'Bom';
                if (bf < 24) return 'Médio';
                if (bf < 28) return 'Alto';
                return 'Muito Alto';
            } else {
                if (bf < 18) return 'Excelente';
                if (bf < 23) return 'Bom';
                if (bf < 26) return 'Médio';
                if (bf < 30) return 'Alto';
                return 'Muito Alto';
            }
        } else {
            // Female
            if (age < 30) {
                if (bf < 16) return 'Excelente';
                if (bf < 21) return 'Bom';
                if (bf < 25) return 'Médio';
                if (bf < 29) return 'Alto';
                return 'Muito Alto';
            } else if (age < 40) {
                if (bf < 18) return 'Excelente';
                if (bf < 23) return 'Bom';
                if (bf < 27) return 'Médio';
                if (bf < 31) return 'Alto';
                return 'Muito Alto';
            } else if (age < 50) {
                if (bf < 21) return 'Excelente';
                if (bf < 26) return 'Bom';
                if (bf < 30) return 'Médio';
                if (bf < 34) return 'Alto';
                return 'Muito Alto';
            } else {
                if (bf < 24) return 'Excelente';
                if (bf < 29) return 'Bom';
                if (bf < 33) return 'Médio';
                if (bf < 37) return 'Alto';
                return 'Muito Alto';
            }
        }
    }
};
