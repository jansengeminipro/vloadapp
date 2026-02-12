import { AssessmentStrategy } from './AssessmentStrategy';
import { RockportStrategy } from './cardio/RockportStrategy';
import { CooperStrategy } from './cardio/CooperStrategy';
import { BruceStrategy } from './cardio/BruceStrategy';
import { BalkeWareStrategy } from './cardio/BalkeWareStrategy';
import { MSSRTStrategy } from './cardio/MSSRTStrategy';
import { TC6MStrategy } from './cardio/TC6MStrategy';
import { YMCAStrategy } from './cardio/YMCAStrategy';
import { RuffierStrategy } from './cardio/RuffierStrategy';
import { Pollock3Strategy } from './anthropometry/Pollock3Strategy';
import { Pollock7Strategy } from './anthropometry/Pollock7Strategy';
import { FaulknerStrategy } from './anthropometry/FaulknerStrategy';
import { GuedesStrategy } from './anthropometry/GuedesStrategy';
import { BIAStrategy } from './anthropometry/BIAStrategy';
import { RCQStrategy } from './anthropometry/RCQStrategy';
import { BMIStrategy } from './anthropometry/BMIStrategy';
import { RCEStrategy } from './anthropometry/RCEStrategy';
import { OneRMStrategy } from './strength/OneRMStrategy';
import { DynamometryStrategy } from './strength/DynamometryStrategy';
import { ArmCurlStrategy } from './strength/ArmCurlStrategy';
import { ChairStandStrategy } from './strength/ChairStandStrategy';

export const AssessmentFactory = {
    getStrategy(type: string): AssessmentStrategy {
        switch (type) {
            case 'rockport':
                return new RockportStrategy();
            case 'cooper':
                return new CooperStrategy();
            case 'bruce':
                return new BruceStrategy();
            case 'balke':
                return new BalkeWareStrategy();
            case 'mssrt':
                return new MSSRTStrategy();
            case 'tc6m':
                return new TC6MStrategy();
            case 'ymca':
                return new YMCAStrategy();
            case 'ruffier':
                return new RuffierStrategy();
            case 'pollock3':
                return new Pollock3Strategy();
            case 'pollock7':
                return new Pollock7Strategy();
            case 'faulkner':
                return new FaulknerStrategy();
            case 'guedes':
                return new GuedesStrategy();
            case 'bia':
                return new BIAStrategy();
            case 'rcq':
                return new RCQStrategy();
            case 'bmi':
                return new BMIStrategy();
            case 'rce':
                return new RCEStrategy();
            case 'onerm':
                return new OneRMStrategy();
            case 'dynamometry':
                return new DynamometryStrategy();
            case 'armcurl':
                return new ArmCurlStrategy();
            case 'chairstand':
                return new ChairStandStrategy();
            default:
                throw new Error(`Strategy for type '${type}' not implemented.`);
        }
    }
};

export const AVAILABLE_TESTS = [
    { id: 'rockport', label: 'Teste de 1 Milha (Rockport)', category: 'cardio' },
    { id: 'cooper', label: 'Teste de Cooper (12 min)', category: 'cardio' },
    { id: 'bruce', label: 'Protocolo de Bruce (Esteira)', category: 'cardio' },
    { id: 'balke', label: 'Protocolo de Balke e Ware', category: 'cardio' },
    { id: 'mssrt', label: 'Shuttle Run 20m', category: 'cardio' },
    { id: 'tc6m', label: 'Caminhada de 6 Minutos (TC6M)', category: 'cardio' },
    { id: 'ymca', label: 'Cicloergômetro YMCA / Astrand', category: 'cardio' },
    { id: 'ruffier', label: 'Agachamento de Ruffier', category: 'cardio' },
    { id: 'pollock3', label: 'Pollock 3 Dobras', category: 'anthropometry' },
    { id: 'pollock7', label: 'Pollock 7 Dobras', category: 'anthropometry' },
    { id: 'faulkner', label: 'Faulkner (4 Dobras)', category: 'anthropometry' },
    { id: 'guedes', label: 'Guedes (3 Dobras)', category: 'anthropometry' },
    { id: 'bia', label: 'Bioimpedância (BIA)', category: 'anthropometry' },
    { id: 'bmi', label: 'Índice de Massa Corporal (IMC)', category: 'anthropometry' },
    { id: 'rce', label: 'Relação Cintura-Estatura (RCE)', category: 'anthropometry' },
    { id: 'rcq', label: 'Relação Cintura-Quadril (RCQ)', category: 'anthropometry' },
    { id: 'onerm', label: 'Teste de 1-RM (Máxima)', category: 'strength' },
    { id: 'dynamometry', label: 'Dinamometria Joelho', category: 'strength' },
    { id: 'armcurl', label: 'Flexão de Braço (30s)', category: 'strength' },
    { id: 'chairstand', label: 'Sentar e Levantar (30s)', category: 'strength' },
    // more to come...
];

export const TEST_CATEGORIES = [
    { id: 'cardio', label: 'Cardiorrespiratório' },
    { id: 'anthropometry', label: 'Composição Corporal' },
    { id: 'strength', label: 'Aptidão Muscular' },
    { id: 'mobility', label: 'Mobilidade e Equilíbrio' }
];

export const CARDIO_TYPES = AVAILABLE_TESTS.filter(t => t.category === 'cardio').map(t => t.id);
export const STRENGTH_TYPES = AVAILABLE_TESTS.filter(t => t.category === 'strength').map(t => t.id);
export const BODY_COMP_TYPES = AVAILABLE_TESTS.filter(t => t.category === 'anthropometry').map(t => t.id);
