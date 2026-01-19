import { Exercise, MuscleGroup } from '../types';

const RAW_DB = {
  "Peito": {
    "Supino reto com barra": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Barra" },
    "Supino reto com halteres": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino reto com halteres (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino reto com halteres (alternado)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino reto na máquina": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino reto na máquina (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino reto articulado": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino reto articulado (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino reto no Smith": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino vertical com elástico": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Elástico" },
    "Supino no chão (Floor Press) com barra": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Barra" },
    "Supino no chão (Floor Press) com halteres": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino guilhotina (barra no pescoço)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Barra" },
    "Flexão de braços tradicional": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Flexão de braços com palmada": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Flexão de braços (joelhos no chão)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Flexão arqueiro (Archer Push-up)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Supino inclinado com barra": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Barra" },
    "Supino inclinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino inclinado com halteres (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino inclinado com halteres (alternado)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino inclinado com halteres (pegada neutra)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino inclinado na máquina": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino inclinado na máquina (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino inclinado articulado": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino inclinado articulado (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino inclinado no Smith": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Flexão inclinada (mãos em banco)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Supino declinado com barra": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Barra" },
    "Supino declinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Halteres" },
    "Supino declinado na máquina": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino declinado articulado": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Supino declinado no Smith": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Paralelas (tronco inclinado à frente)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Paralelas no Graviton (foco peitoral)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Máquina" },
    "Flexão declinada (pés em banco)": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Crucifixo reto com halteres": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Halteres" },
    "Crucifixo inclinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Halteres" },
    "Crucifixo declinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Halteres" },
    "Peck deck (máquina)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Máquina" },
    "Crossover (polia alta)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Máquina" },
    "Crossover (polia média)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Máquina" },
    "Crossover (polia baixa)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Máquina" },
    "Crucifixo na polia (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Máquina" },
    "Crucifixo com elástico": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Elástico" },
    "Crucifixo articulado": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Máquina" },
    "Flexão com braços abertos (Fly Push-up)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Peso Corporal" },
    "Svend Press com anilha": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"], "tipo": "Halteres" }
  },
  "Ombro": {
    "Desenvolvimento militar com barra (em pé)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Barra" },
    "Desenvolvimento com barra (sentado)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Barra" },
    "Desenvolvimento com halteres (sentado)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Halteres" },
    "Desenvolvimento com halteres (em pé)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Halteres" },
    "Desenvolvimento com halteres (unilateral)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Halteres" },
    "Desenvolvimento com halteres (alternado)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Halteres" },
    "Desenvolvimento Arnold": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Halteres" },
    "Desenvolvimento na máquina (pegada pronada)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Máquina" },
    "Desenvolvimento na máquina (pegada neutra)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Máquina" },
    "Desenvolvimento na máquina (unilateral)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Máquina" },
    "Desenvolvimento articulado (Viking Press)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Articulada" },
    "Desenvolvimento articulado (unilateral)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Articulada" },
    "Desenvolvimento no Smith": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Máquina" },
    "Desenvolvimento na Landmine (unilateral)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Barra" },
    "Desenvolvimento com elástico": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"], "tipo": "Elástico" },
    "Flexão pike": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps"], "tipo": "Peso Corporal" },
    "Flexão pike com pés elevados": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps"], "tipo": "Peso Corporal" },
    "Handstand Push-up (HSPU)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps"], "tipo": "Peso Corporal" },
    "Elevação lateral com halteres (em pé)": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Halteres" },
    "Elevação lateral com halteres (sentado)": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Halteres" },
    "Elevação lateral com halteres (unilateral)": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Halteres" },
    "Elevação lateral na máquina": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Máquina" },
    "Elevação lateral na polia baixa (frente do corpo)": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Máquina" },
    "Elevação lateral na polia baixa (trás do corpo)": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Máquina" },
    "Elevação lateral com elástico": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Elástico" },
    "Remada alta com barra (pegada aberta)": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Barra" },
    "Remada alta com halteres": { "agonista": ["Deltoide medial"], "sinergista": [], "tipo": "Halteres" },
    "Elevação frontal com barra": { "agonista": ["Deltoide anterior"], "sinergista": [], "tipo": "Barra" },
    "Elevação frontal com halteres (pegada pronada)": { "agonista": ["Deltoide anterior"], "sinergista": [], "tipo": "Halteres" },
    "Elevação frontal com halteres (pegada neutra/martelo)": { "agonista": ["Deltoide anterior"], "sinergista": [], "tipo": "Halteres" },
    "Elevação frontal com halteres (alternada)": { "agonista": ["Deltoide anterior"], "sinergista": [], "tipo": "Halteres" },
    "Elevação frontal com anilha": { "agonista": ["Deltoide anterior"], "sinergista": [], "tipo": "Halteres" },
    "Elevação frontal na polia (barra)": { "agonista": ["Deltoide anterior"], "sinergista": [], "tipo": "Máquina" },
    "Elevação frontal na polia (corda)": { "agonista": ["Deltoide anterior"], "sinergista": [], "tipo": "Máquina" },
    "Crucifixo inverso com halteres (em pé)": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Halteres" },
    "Crucifixo inverso com halteres (sentado)": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Halteres" },
    "Crucifixo inverso com halteres (peito apoiado)": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Halteres" },
    "Crucifixo inverso na máquina (Peck Deck Inverso)": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Máquina" },
    "Crucifixo inverso na máquina (unilateral)": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Máquina" },
    "Crucifixo inverso na polia alta": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Máquina" },
    "Crucifixo inverso na polia (crossover unilateral)": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Máquina" },
    "Face pull com corda": { "agonista": ["Rombóides"], "sinergista": ["Deltoide posterior", "Trapézio médio"], "tipo": "Máquina" },
    "Face pull com elástico": { "agonista": ["Rombóides"], "sinergista": ["Deltoide posterior", "Trapézio médio"], "tipo": "Elástico" }
  },
  "Costas": {
    "Barra fixa pronada": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Peso Corporal" },
    "Barra fixa supinada (Chin-up)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Peso Corporal" },
    "Barra fixa neutra": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Peso Corporal" },
    "Puxada frontal na polia (barra reta)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada frontal na polia (barra W)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada frontal na polia (triângulo)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada frontal na polia (pegada neutra aberta)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada frontal na polia (supinada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada frontal na polia (unilateral)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada articulada (High Row)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada articulada unilateral": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Puxada com elástico (ajoelhado)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Elástico" },
    "Graviton (Barra assistida pronada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Graviton (Barra assistida neutra)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Remada curvada com barra (pronada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Barra" },
    "Remada curvada com barra (supinada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Barra" },
    "Remada Yates (tronco mais ereto)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Barra" },
    "Remada Pendlay (apoiando no chão)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Barra" },
    "Remada curvada com halteres (bilateral)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Halteres" },
    "Remada curvada com halteres (unilateral/Serrote)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Halteres" },
    "Remada Kroc (unilateral alta carga)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Halteres" },
    "Remada no banco inclinado (Chest supported)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Halteres" },
    "Remada baixa na polia (triângulo)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada baixa na polia (barra reta pronada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada baixa na polia (barra reta supinada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada baixa na polia (corda)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada baixa na polia (unilateral)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada cavalinho (barra livre)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Barra" },
    "Remada cavalinho (máquina)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada máquina Hammer": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada máquina Hammer (unilateral)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Remada na Landmine (Mina terrestre)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Barra" },
    "Remada Meadows (Landmine unilateral)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Barra" },
    "Australian pull-up (barra baixa pronada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Peso Corporal" },
    "Australian pull-up (barra baixa supinada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Peso Corporal" },
    "Australian pull-up (argolas)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"], "tipo": "Peso Corporal" },
    "Pulldown com braços estendidos (corda)": { "agonista": ["Dorsal"], "sinergista": ["Peitoral maior", "Tríceps longo"], "tipo": "Máquina" },
    "Pulldown com braços estendidos (barra reta)": { "agonista": ["Dorsal"], "sinergista": ["Peitoral maior", "Tríceps longo"], "tipo": "Máquina" },
    "Levantamento terra": { "agonista": ["Dorsal"], "sinergista": ["Glúteo máximo", "Eretor da espinha", "Trapézio", "Posterior da coxa"], "tipo": "Barra" },
    "Levantamento terra (sumô)": { "agonista": ["Dorsal"], "sinergista": ["Glúteo máximo", "Eretor da espinha", "Trapézio", "Posterior da coxa"], "tipo": "Barra" },
    "Levantamento terra (trap bar)": { "agonista": ["Dorsal"], "sinergista": ["Glúteo máximo", "Eretor da espinha", "Trapézio", "Posterior da coxa"], "tipo": "Barra" },
    "Encolhimento de ombros com barra (frente)": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Barra" },
    "Encolhimento de ombros com barra (trás)": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Barra" },
    "Encolhimento com halteres": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Halteres" },
    "Encolhimento no Smith": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Máquina" },
    "Retratação escapular na polia": { "agonista": ["Rombóides"], "sinergista": ["Trapézio médio"], "tipo": "Máquina" },
    "Remada aberta (cotovelos altos)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"], "tipo": "Máquina" }
  },
  "Bíceps": {
    "Rosca direta com barra reta": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Barra" },
    "Rosca direta com barra W": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Barra" },
    "Rosca direta com halteres (simultânea)": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Halteres" },
    "Rosca direta com halteres (alternada)": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Halteres" },
    "Rosca direta com halteres (sentado)": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Halteres" },
    "Rosca direta com halteres (banco inclinado 45º)": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Halteres" },
    "Rosca direta na polia baixa (barra reta)": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Máquina" },
    "Rosca direta na polia baixa (barra W)": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Máquina" },
    "Rosca na polia (unilateral)": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Máquina" },
    "Rosca 21 com barra": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Barra" },
    "Rosca com elástico": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"], "tipo": "Elástico" },
    "Rosca Scott com barra W": { "agonista": ["Bíceps"], "sinergista": ["Braquial"], "tipo": "Barra" },
    "Rosca Scott com halteres (unilateral)": { "agonista": ["Bíceps"], "sinergista": ["Braquial"], "tipo": "Halteres" },
    "Rosca Scott na máquina": { "agonista": ["Bíceps"], "sinergista": ["Braquial"], "tipo": "Máquina" },
    "Rosca concentrada com halter": { "agonista": ["Bíceps"], "sinergista": ["Braquial"], "tipo": "Halteres" },
    "Rosca spider (peito apoiado no banco)": { "agonista": ["Bíceps"], "sinergista": ["Braquial"], "tipo": "Halteres" },
    "Rosca Hércules na polia (polia alta dupla)": { "agonista": ["Bíceps"], "sinergista": ["Braquial"], "tipo": "Máquina" },
    "Rosca martelo com halteres (em pé)": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"], "tipo": "Halteres" },
    "Rosca martelo com halteres (alternada)": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"], "tipo": "Halteres" },
    "Rosca martelo com halteres (banco inclinado)": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"], "tipo": "Halteres" },
    "Rosca martelo na polia (corda)": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"], "tipo": "Máquina" },
    "Rosca martelo com barra H (barra romana)": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"], "tipo": "Barra" },
    "Rosca inversa com barra (pronada)": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"], "tipo": "Barra" },
    "Rosca inversa na polia": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"], "tipo": "Máquina" }
  },
  "Tríceps": {
    "Tríceps testa com barra reta": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"], "tipo": "Barra" },
    "Tríceps testa com barra W": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"], "tipo": "Barra" },
    "Tríceps testa com halteres (pegada neutra)": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"], "tipo": "Halteres" },
    "Tríceps testa com halteres (pronada)": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"], "tipo": "Halteres" },
    "Tríceps testa na polia (corda)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps testa na polia (barra)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps na polia com barra reta": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps na polia com barra V": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps na polia com corda": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps na polia pegada inversa (supinada)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps na polia unilateral": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps com elástico": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Elástico" },
    "Tríceps coice com halter (unilateral)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Halteres" },
    "Tríceps coice com halteres (bilateral)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Halteres" },
    "Tríceps coice na polia": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Tríceps francês com barra W (em pé)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Barra" },
    "Tríceps francês com halter (sentado unilateral)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Halteres" },
    "Tríceps francês com halter (sentado bilateral)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Halteres" },
    "Tríceps francês na polia (corda)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Máquina" },
    "Paralelas (foco tríceps - corpo reto)": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Mergulho entre bancos": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"], "tipo": "Peso Corporal" },
    "Mergulho na máquina": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"], "tipo": "Máquina" },
    "Flexão de braços fechada (diamante)": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Deltoide anterior"], "tipo": "Peso Corporal" },
    "Supino fechado com barra": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Deltoide anterior"], "tipo": "Barra" }
  },
  "Glúteo médio": {
    "Glúteo 4 apoios com elevação lateral (cachorrinho)": { "agonista": ["Glúteo médio"], "sinergista": [] },
    "Abdução de quadril com miniband (em pé)": { "agonista": ["Glúteo médio"], "sinergista": [] },
    "Abdução de quadril com miniband (sentado)": { "agonista": ["Glúteo médio"], "sinergista": [] },
    "Abdução de quadril em decúbito lateral": { "agonista": ["Glúteo médio"], "sinergista": [] },
    "Máquina abdutora": { "agonista": ["Glúteo médio"], "sinergista": ["Tensor da fáscia lata"] },
    "Abdução de quadril na polia": { "agonista": ["Glúteo médio"], "sinergista": [] },
    "Abdução de quadril com miniband": { "agonista": ["Glúteo médio"], "sinergista": [] },
    "Elevação lateral de perna em decúbito lateral": { "agonista": ["Glúteo médio"], "sinergista": [] }
  },
  "Quadríceps": {
    "Agachamento livre (barra alta)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Eretores da espinha"], "tipo": "Barra" },
    "Agachamento livre (barra baixa)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Eretores da espinha"], "tipo": "Barra" },
    "Agachamento frontal com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Eretores da espinha"], "tipo": "Barra" },
    "Agachamento sumô com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Eretores da espinha"], "tipo": "Barra" },
    "Agachamento Zercher": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Eretores da espinha"], "tipo": "Barra" },
    "Agachamento com halteres (Goblet)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core"], "tipo": "Halteres" },
    "Agachamento com halteres (laterais)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core"], "tipo": "Halteres" },
    "Agachamento na máquina Smith": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Agachamento Hack Machine": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Agachamento Hack Invertido": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Agachamento articulado (V-Squat)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Articulada" },
    "Agachamento Belt Squat (com cinto)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Agachamento unilateral (Pistol Squat)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core", "Isquiotibiais"], "tipo": "Peso Corporal" },
    "Agachamento Sissy (peso corporal)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Peso Corporal" },
    "Agachamento Sissy (máquina)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Leg Press 45": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Leg Press 45 (pés altos - foco glúteo)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Leg Press 45 (unilateral)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Leg Press Horizontal": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Leg Press Vertical": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Avanço com barra (passada)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Barra" },
    "Avanço com halteres (passada)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Halteres" },
    "Afundo estático com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Barra" },
    "Afundo estático com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Halteres" },
    "Afundo no Smith": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Afundo Búlgaro com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Barra" },
    "Afundo Búlgaro com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Halteres" },
    "Subida no banco (Step-up) com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Halteres" },
    "Afundo reverso (passo atrás) com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Halteres" },
    "Cadeira extensora (bilateral)": { "agonista": ["Quadríceps"], "sinergista": [], "tipo": "Máquina" },
    "Cadeira extensora (unilateral)": { "agonista": ["Quadríceps"], "sinergista": [], "tipo": "Máquina" },
    "Extensão de joelho com elástico": { "agonista": ["Quadríceps"], "sinergista": [], "tipo": "Elástico" }
  },
  "Isquiotibiais": {
    "Stiff com barra": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"], "tipo": "Barra" },
    "Stiff com halteres": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"], "tipo": "Halteres" },
    "Stiff unilateral com halter": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"], "tipo": "Halteres" },
    "Stiff com elástico": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"], "tipo": "Elástico" },
    "Levantamento terra romeno (RDL) com barra": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"], "tipo": "Barra" },
    "Levantamento terra romeno (RDL) com halteres": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"], "tipo": "Halteres" },
    "Good Morning com barra": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"], "tipo": "Barra" },
    "Mesa flexora deitada": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Máquina" },
    "Mesa flexora unilateral": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Máquina" },
    "Cadeira flexora (sentada)": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Máquina" },
    "Cadeira flexora unilateral": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Máquina" },
    "Flexora em pé unilateral (máquina)": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Máquina" },
    "Flexora em pé com caneleira": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Peso Corporal" },
    "Flexora com elástico": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Elástico" },
    "Flexão nórdica (Nordic Curl)": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Peso Corporal" },
    "Flexão de pernas na bola suíça": { "agonista": ["Isquiotibiais"], "sinergista": [], "tipo": "Peso Corporal" }
  },
  "Glúteo máximo": {
    "Levantamento terra tradicional com barra": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha", "Core"], "tipo": "Barra" },
    "Levantamento terra com halteres": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha", "Core"], "tipo": "Halteres" },
    "Levantamento terra sumô": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha", "Core"], "tipo": "Barra" },
    "Elevação pélvica (Hip thrust) com barra": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Barra" },
    "Elevação pélvica na máquina": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Máquina" },
    "Elevação pélvica no Smith": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Máquina" },
    "Elevação pélvica unilateral": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Peso Corporal" },
    "Ponte de glúteo (Glute Bridge) solo": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Peso Corporal" },
    "Ponte de glúteo com pés elevados": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Peso Corporal" },
    "Ponte de glúteo com elástico (abduzindo)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"], "tipo": "Elástico" },
    "Glúteo máquina (kickback)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Glúteo na polia (coice)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" },
    "Glúteo 4 apoios com caneleira (perna estendida)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Peso Corporal" },
    "Glúteo 4 apoios com caneleira (perna flexionada)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Peso Corporal" },
    "Extensão de quadril no banco romano (Hyperextension)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Peso Corporal" },
    "Pull-through na polia": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"], "tipo": "Máquina" }
  },
  "Panturrilha": {
    "Elevação de panturrilhas sentado na máquina": { "agonista": ["Sóleo"], "sinergista": [] },
    "Elevação de panturrilhas em pé na máquina": { "agonista": ["Gastrocnêmio"], "sinergista": [] },
    "Elevação de panturrilhas no leg press": { "agonista": ["Gastrocnêmio"], "sinergista": [] },
    "Elevação de panturrilhas em pé com halteres": { "agonista": ["Gastrocnêmio"], "sinergista": [] },
    "Elevação de panturrilhas unilateral com halter": { "agonista": ["Gastrocnêmio"], "sinergista": ["Sóleo"] },
    "Elevação de panturrilhas com barra nas costas": { "agonista": ["Gastrocnêmio"], "sinergista": [] },
    "Elevação de panturrilhas em degrau": { "agonista": ["Gastrocnêmio"], "sinergista": ["Sóleo"] },
    "Elevação de panturrilhas isométrica": { "agonista": ["Gastrocnêmio"], "sinergista": ["Sóleo"] },
    "Saltos com os pés (panturrilha pliométrica)": { "agonista": ["Gastrocnêmio"], "sinergista": ["Glúteo máximo"] }
  },
  "Adutores": {
    "Máquina adutora (pernas para dentro)": { "agonista": ["Adutores"], "sinergista": [] },
    "Adução de quadril na polia": { "agonista": ["Adutores"], "sinergista": [] },
    "Adução de quadril com miniband": { "agonista": ["Adutores"], "sinergista": [] },
    "Elevação medial de perna em decúbito lateral": { "agonista": ["Adutores"], "sinergista": [] }
  },
  "Abdômen": {
    "Abdominal tradicional (solo)": { "agonista": ["Reto abdominal"], "sinergista": [], "tipo": "Peso Corporal" },
    "Abdominal com carga (anilha no peito)": { "agonista": ["Reto abdominal"], "sinergista": [], "tipo": "Halteres" },
    "Abdominal declinado": { "agonista": ["Reto abdominal"], "sinergista": [], "tipo": "Peso Corporal" },
    "Abdominal na máquina": { "agonista": ["Reto abdominal"], "sinergista": [], "tipo": "Máquina" },
    "Abdominal na polia (Crunch)": { "agonista": ["Reto abdominal"], "sinergista": [], "tipo": "Máquina" },
    "Elevação de pernas no solo": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco"], "tipo": "Peso Corporal" },
    "Elevação de pernas na barra fixa": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco"], "tipo": "Peso Corporal" },
    "Elevação de joelhos na paralela": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco"], "tipo": "Peso Corporal" },
    "Abdominal canivete (V-up)": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco"], "tipo": "Peso Corporal" },
    "Abdominal bicicleta": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco"], "tipo": "Peso Corporal" },
    "Prancha isométrica": { "agonista": ["Transverso abdominal"], "sinergista": ["Reto abdominal", "Oblíquos", "Glúteo máximo"], "tipo": "Peso Corporal" },
    "Prancha com elevação de perna": { "agonista": ["Transverso abdominal"], "sinergista": ["Reto abdominal", "Oblíquos", "Glúteo máximo"], "tipo": "Peso Corporal" },
    "Ab wheel (rodinha)": { "agonista": ["Reto abdominal"], "sinergista": ["Transverso abdominal", "Eretores da espinha"], "tipo": "Peso Corporal" },
    "Dead Bug": { "agonista": ["Transverso abdominal"], "sinergista": ["Reto abdominal"], "tipo": "Peso Corporal" },
    "Escalador (Mountain Climber)": { "agonista": ["Reto abdominal"], "sinergista": ["Oblíquos"], "tipo": "Peso Corporal" },
    "Prancha lateral": { "agonista": ["Oblíquos"], "sinergista": ["Transverso abdominal", "Glúteo médio"], "tipo": "Peso Corporal" },
    "Rotação com cabo (Woodchop)": { "agonista": ["Oblíquos"], "sinergista": ["Transverso abdominal"], "tipo": "Máquina" },
    "Russian Twist (com peso)": { "agonista": ["Oblíquos"], "sinergista": ["Transverso abdominal"], "tipo": "Halteres" },
    "Abdominal oblíquo no solo (cruzado)": { "agonista": ["Oblíquos"], "sinergista": ["Reto abdominal"], "tipo": "Peso Corporal" }
  }
};

// Normalize Muscle Group Names from Raw DB to Enum/Chart Friendly Names
const mapMuscleGroup = (rawName: string): string => {
  if (rawName === 'Peito') return MuscleGroup.Chest;
  if (rawName === 'Ombro') return MuscleGroup.Shoulders;
  if (rawName === 'Costas') return MuscleGroup.Back;
  if (rawName === 'Bíceps') return MuscleGroup.Biceps;
  if (rawName === 'Tríceps') return MuscleGroup.Triceps;
  if (rawName === 'Quadríceps') return MuscleGroup.Quads;
  if (rawName === 'Isquiotibiais') return MuscleGroup.Hamstrings;
  if (rawName === 'Glúteo máximo' || rawName === 'Glúteo médio') return MuscleGroup.Glutes;
  if (rawName === 'Panturrilha') return MuscleGroup.Calves;
  if (rawName === 'Adutores') return MuscleGroup.Adductors;
  if (rawName === 'Abdômen') return MuscleGroup.Abs;
  return rawName;
};

// Map tipo to equipment
const mapEquipment = (tipo: string | undefined, exerciseName: string): string => {
  if (tipo) {
    switch (tipo) {
      case 'Barra': return 'Barra';
      case 'Halteres': return 'Halter';
      case 'Máquina': return 'Máquina';
      case 'Articulada': return 'Articulada';
      case 'Peso Corporal': return 'Peso do Corpo';
      case 'Elástico': return 'Elástico';
      default: return tipo;
    }
  }
  // Fallback for entries without tipo field
  const name = exerciseName.toLowerCase();
  if (name.includes('miniband') || name.includes('elástico')) return 'Elástico';
  if (name.includes('barra')) return 'Barra';
  if (name.includes('halter')) return 'Halter';
  if (name.includes('smith') || name.includes('multipower')) return 'Máquina';
  if (name.includes('articulad')) return 'Máquina';
  if (name.includes('máquina')) return 'Máquina';
  if (name.includes('polia') || name.includes('cabo') || name.includes('cross')) return 'Cabo';
  if (name.includes('bola')) return 'Acessório';
  return 'Peso do Corpo';
};

// Flatten the structure
export const EXERCISE_DB: Exercise[] = [];
export const EXERCISE_MAP = new Map<string, Exercise>();
let idCounter = 1;

Object.entries(RAW_DB).forEach(([muscleGroupRaw, exercises]) => {
  Object.entries(exercises).forEach(([exerciseName, details]: [string, any]) => {
    const ex: Exercise = {
      id: `ex_${idCounter++}`,
      name: exerciseName,
      muscleGroup: mapMuscleGroup(muscleGroupRaw),
      equipment: mapEquipment(details.tipo, exerciseName),
      agonists: details.agonista,
      synergists: details.sinergista
    };
    EXERCISE_DB.push(ex);
    EXERCISE_MAP.set(exerciseName, ex);
  });
});

export const getExerciseByName = (name: string): Exercise | undefined => {
  return EXERCISE_MAP.get(name);
};
