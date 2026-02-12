import { Exercise, MuscleGroup } from '../types';

const RAW_DB = {
  "Peito": {
    "Supino reto com barra": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Barra" },
    "Supino reto com halteres": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino reto com halteres (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino reto com halteres (alternado)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino reto na máquina": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino reto na máquina (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino reto articulado": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino reto articulado (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino reto no Smith": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino vertical com elástico": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Elástico" },
    "Supino no chão (Floor Press) com barra": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Barra" },
    "Supino no chão (Floor Press) com halteres": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino guilhotina (barra no pescoço)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Barra" },
    "Flexão de braços tradicional": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Peso Corporal" },
    "Flexão de braços com palmada": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Peso Corporal" },
    "Flexão de braços (joelhos no chão)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Peso Corporal" },
    "Flexão arqueiro (Archer Push-up)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Peso Corporal" },
    "Supino inclinado com barra": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Barra" },
    "Supino inclinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino inclinado com halteres (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino inclinado com halteres (alternado)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino inclinado com halteres (pegada neutra)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino inclinado na máquina": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino inclinado na máquina (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino inclinado articulado": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino inclinado articulado (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino inclinado no Smith": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Flexão inclinada (mãos em banco)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Peso Corporal" },
    "Supino declinado com barra": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Barra" },
    "Supino declinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" },
    "Supino declinado na máquina": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino declinado articulado": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Supino declinado no Smith": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Máquina" },
    "Flexão declinada (pés em banco)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Peso Corporal" },
    "Crucifixo reto com halteres": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Halteres" },
    "Crucifixo inclinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Halteres" },
    "Crucifixo declinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Halteres" },
    "Peck deck (máquina)": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Máquina" },
    "Crossover (polia alta)": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Máquina" },
    "Crossover (polia média)": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Máquina" },
    "Crossover (polia baixa)": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Máquina" },
    "Crucifixo na polia (unilateral)": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Máquina" },
    "Crucifixo com elástico": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Elástico" },
    "Crucifixo articulado": { "agonista": ["Peitoral"], "sinergista": ["Ombros"], "tipo": "Máquina" },
    "Flexão com braços abertos (Fly Push-up)": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Peso Corporal" },
    "Svend Press com anilha": { "agonista": ["Peitoral"], "sinergista": ["Ombros", "Tríceps"], "tipo": "Halteres" }
  },
  "Ombro": {
    "Desenvolvimento militar com barra (em pé)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Barra" },
    "Desenvolvimento com barra (sentado)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Barra" },
    "Desenvolvimento com halteres (sentado)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Halteres" },
    "Desenvolvimento com halteres (em pé)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Halteres" },
    "Desenvolvimento com halteres (unilateral)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Halteres" },
    "Desenvolvimento com halteres (alternado)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Halteres" },
    "Desenvolvimento Arnold": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Halteres" },
    "Desenvolvimento na máquina (pegada pronada)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Máquina" },
    "Desenvolvimento na máquina (pegada neutra)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Máquina" },
    "Desenvolvimento na máquina (unilateral)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Máquina" },
    "Desenvolvimento articulado (Viking Press)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Articulada" },
    "Desenvolvimento articulado (unilateral)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Articulada" },
    "Desenvolvimento no Smith": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Máquina" },
    "Desenvolvimento na Landmine (unilateral)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Barra" },
    "Desenvolvimento com elástico": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Elástico" },
    "Flexão pike": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Peso Corporal" },
    "Flexão pike com pés elevados": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Peso Corporal" },
    "Handstand Push-up (HSPU)": { "agonista": ["Ombros"], "sinergista": ["Tríceps"], "tipo": "Peso Corporal" },
    "Elevação lateral com halteres (em pé)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Halteres" },
    "Elevação lateral com halteres (sentado)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Halteres" },
    "Elevação lateral com halteres (unilateral)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Halteres" },
    "Elevação lateral na máquina": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Máquina" },
    "Elevação lateral na polia baixa (frente do corpo)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Máquina" },
    "Elevação lateral na polia baixa (trás do corpo)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Máquina" },
    "Elevação lateral com elástico": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Elástico" },
    "Remada alta com barra (pegada aberta)": { "agonista": ["Ombros"], "sinergista": ["Trapézio", "Bíceps", "Antebraço", "Dorso Superior"], "tipo": "Barra" },
    "Remada alta com halteres": { "agonista": ["Ombros"], "sinergista": ["Trapézio", "Bíceps", "Antebraço", "Dorso Superior"], "tipo": "Halteres" },
    "Elevação frontal com barra": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Barra" },
    "Elevação frontal com halteres (pegada pronada)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Halteres" },
    "Elevação frontal com halteres (pegada neutra/martelo)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Halteres" },
    "Elevação frontal com halteres (alternada)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Halteres" },
    "Elevação frontal com anilha": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Halteres" },
    "Elevação frontal na polia (barra)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Máquina" },
    "Elevação frontal na polia (corda)": { "agonista": ["Ombros"], "sinergista": ["Trapézio"], "tipo": "Máquina" }
  },
  "Dorso Superior": {
    "Crucifixo inverso com halteres (em pé)": { "agonista": ["Dorso Superior"], "sinergista": [], "tipo": "Halteres" },
    "Crucifixo inverso com halteres (sentado)": { "agonista": ["Dorso Superior"], "sinergista": [], "tipo": "Halteres" },
    "Crucifixo inverso com halteres (peito apoiado)": { "agonista": ["Dorso Superior"], "sinergista": [], "tipo": "Halteres" },
    "Crucifixo inverso na máquina (Peck Deck Inverso)": { "agonista": ["Dorso Superior"], "sinergista": [], "tipo": "Máquina" },
    "Crucifixo inverso na máquina (unilateral)": { "agonista": ["Dorso Superior"], "sinergista": [], "tipo": "Máquina" },
    "Crucifixo inverso na polia alta": { "agonista": ["Dorso Superior"], "sinergista": [], "tipo": "Máquina" },
    "Crucifixo inverso na polia (crossover unilateral)": { "agonista": ["Dorso Superior"], "sinergista": [], "tipo": "Máquina" },
    "Face pull com corda": { "agonista": ["Dorso Superior"], "sinergista": ["Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Face pull com elástico": { "agonista": ["Dorso Superior"], "sinergista": ["Bíceps", "Antebraço"], "tipo": "Elástico" },
    "Remada curvada com barra (pronada/aberta)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Barra" },
    "Remada curvada com barra (Yates/Média)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Barra" },
    "Remada Pendlay": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Barra" },
    "Remada curvada com halteres (pegada aberta/média)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Halteres" },
    "Remada no banco inclinado (pegada aberta)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Halteres" },
    "Remada baixa na polia (barra larga pronada)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada baixa na polia (corda/cotovelos altos)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada máquina (pegada pronada/média)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada articulada (pegada pronada/média)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada cavalinho (pegada aberta)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Barra" },
    "Australian pull-up (pegada aberta)": { "agonista": ["Dorso Superior"], "sinergista": ["Grande dorsal", "Bíceps", "Antebraço"], "tipo": "Peso Corporal" },

    "Retratação escapular na polia": { "agonista": ["Dorso Superior"], "sinergista": ["Trapézio"], "tipo": "Máquina" },
    "Remada aberta (cotovelos altos)": { "agonista": ["Dorso Superior"], "sinergista": ["Bíceps", "Trapézio"], "tipo": "Máquina" },
    "Face pull (polia)": { "agonista": ["Dorso Superior"], "sinergista": ["Bíceps", "Antebraço"], "tipo": "Máquina" }
  },
  "Grande Dorsal": {
    "Barra fixa pronada": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Peso Corporal" },
    "Barra fixa supinada (Chin-up)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Peso Corporal" },
    "Barra fixa neutra": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Peso Corporal" },
    "Puxada frontal na polia (barra reta)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada frontal na polia (barra W)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada frontal na polia (triângulo)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada frontal na polia (pegada neutra aberta)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada frontal na polia (supinada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada frontal na polia (unilateral)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada articulada (High Row)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada articulada unilateral": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada com elástico (ajoelhado)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Elástico" },
    "Graviton (Barra assistida pronada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Graviton (Barra assistida neutra)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Puxada alta articulada (Pegada neutra)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Puxada alta articulada (Pegada pronada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Puxada alta articulada (Pegada supinada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Trapézio médio"], "tipo": "Máquina" },
    "Pulldown com braços estendidos (corda)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Peitoral", "Tríceps"], "tipo": "Máquina" },
    "Pulldown com braços estendidos (barra reta)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Peitoral", "Tríceps"], "tipo": "Máquina" },
    "Remada curvada com barra (supinada/fechada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Barra" },
    "Remada curvada com halteres (pegada neutra/fechada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Halteres" },
    "Remada Serrote (Kroc Row)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Halteres" },
    "Remada baixa na polia (triângulo/fechada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada baixa na polia (barra supinada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada máquina (pegada neutra/baixa)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada articulada (pegada neutra/baixa)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Remada cavalinho (pegada fechada/neutra)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Máquina" },
    "Australian pull-up (pegada fechada)": { "agonista": ["Grande dorsal"], "sinergista": ["Dorso superior", "Bíceps", "Antebraço"], "tipo": "Peso Corporal" }
  },
  "Trapézio": {
    "Encolhimento de ombros com barra (frente)": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Barra" },
    "Encolhimento de ombros com barra (trás)": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Barra" },
    "Encolhimento com halteres": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Halteres" },
    "Encolhimento no Smith": { "agonista": ["Trapézio superior"], "sinergista": [], "tipo": "Máquina" }
  },
  "Bíceps": {
    "Rosca direta com barra reta": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Barra" },
    "Rosca direta com barra W": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Barra" },
    "Rosca direta com halteres (simultânea)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Halteres" },
    "Rosca direta com halteres (alternada)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Halteres" },
    "Rosca direta com halteres (sentado)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Halteres" },
    "Rosca direta com halteres (banco inclinado 45º)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Halteres" },
    "Rosca direta na polia baixa (barra reta)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Máquina" },
    "Rosca direta na polia baixa (barra W)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Máquina" },
    "Rosca na polia (unilateral)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Máquina" },
    "Rosca 21 com barra": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Barra" },
    "Rosca com elástico": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Elástico" },
    "Rosca Scott com barra W": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Barra" },
    "Rosca Scott com halteres (unilateral)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Halteres" },
    "Rosca Scott na máquina": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Máquina" },
    "Rosca concentrada com halter": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Halteres" },
    "Rosca spider (peito apoiado no banco)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Halteres" },
    "Rosca Hércules na polia (polia alta dupla)": { "agonista": ["Bíceps"], "sinergista": ["Antebraço"], "tipo": "Máquina" }
  },
  "Antebraço": {
    "Rosca martelo com halteres (em pé)": { "agonista": ["Antebraço"], "sinergista": ["Bíceps"], "tipo": "Halteres" },
    "Rosca martelo com halteres (alternada)": { "agonista": ["Antebraço"], "sinergista": ["Bíceps"], "tipo": "Halteres" },
    "Rosca martelo com halteres (banco inclinado)": { "agonista": ["Antebraço"], "sinergista": ["Bíceps"], "tipo": "Halteres" },
    "Rosca martelo na polia (corda)": { "agonista": ["Antebraço"], "sinergista": ["Bíceps"], "tipo": "Máquina" },
    "Rosca martelo com barra H (barra romana)": { "agonista": ["Antebraço"], "sinergista": ["Bíceps"], "tipo": "Barra" },
    "Rosca inversa com barra (pronada)": { "agonista": ["Antebraço"], "sinergista": ["Bíceps"], "tipo": "Barra" },
    "Rosca inversa na polia": { "agonista": ["Antebraço"], "sinergista": ["Bíceps"], "tipo": "Máquina" }
  },
  "Tríceps": {
    "Tríceps testa com barra reta": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Barra" },
    "Tríceps testa com barra W": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Barra" },
    "Tríceps testa com halteres (pegada neutra)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Halteres" },
    "Tríceps testa com halteres (pronada)": { "agonista": ["Tríceps"], "sinergista": [], "tipo": "Halteres" },
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
    "Paralelas": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Ombros"], "tipo": "Peso Corporal" },
    "Mergulho entre bancos": { "agonista": ["Tríceps"], "sinergista": ["Ombros", "Peitoral"], "tipo": "Peso Corporal" },
    "Mergulho na máquina": { "agonista": ["Tríceps"], "sinergista": ["Ombros", "Peitoral"], "tipo": "Máquina" },
    "Flexão de braços fechada (diamante)": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Ombros"], "tipo": "Peso Corporal" },
    "Supino fechado com barra": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Ombros"], "tipo": "Barra" }
  },
  "Abdutores": {
    "Máquina abdutora (bilateral)": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Máquina" },
    "Máquina abdutora (tronco inclinado)": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Máquina" },
    "Abdução de quadril na polia baixa": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Máquina" },
    "Abdução de quadril em decúbito lateral (solo)": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Peso Corporal" },
    "Abdução de quadril com caneleira (solo)": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Peso Corporal" },
    "Abdução de quadril com miniband (em pé)": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Elástico" },
    "Abdução de quadril com miniband (sentado)": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Elástico" },
    "Clamshell (ostra) com miniband": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Elástico" },
    "Glúteo 4 apoios com elevação lateral (Cachorrinho)": { "agonista": ["Abdutores"], "sinergista": [], "tipo": "Peso Corporal" }
  },
  "Quadríceps": {
    "Agachamento livre (barra alta)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Barra" },
    "Agachamento livre (barra baixa)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Barra" },
    "Agachamento frontal com barra": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Barra" },
    "Agachamento sumô com barra": { "agonista": ["Quadríceps", "Glúteos", "Adutores"], "sinergista": ["Posteriores", "Abdutores", "Core"], "tipo": "Barra" },
    "Agachamento Zercher": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Barra" },
    "Agachamento com halteres (Goblet)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Halteres" },
    "Agachamento com halteres (laterais)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Halteres" },
    "Agachamento na máquina Smith": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Máquina" },
    "Agachamento Hack Machine": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Máquina" },
    "Agachamento Hack Invertido": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Máquina" },
    "Agachamento articulado (V-Squat)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Articulada" },
    "Agachamento Belt Squat (com cinto)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Máquina" },
    "Agachamento unilateral (Pistol Squat)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Peso Corporal" },
    "Agachamento Sissy (peso corporal)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Peso Corporal" },
    "Agachamento Sissy (máquina)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Máquina" },
    "Leg Press 45": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" },
    "Leg Press 45 (pés altos - foco glúteo)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" },
    "Leg Press 45 (unilateral)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" },
    "Leg Press Horizontal": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" },
    "Leg Press Vertical": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" },
    "Avanço com barra (passada)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Barra" },
    "Avanço com halteres (passada)": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Halteres" },
    "Afundo estático com barra": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Barra" },
    "Afundo estático com halteres": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Halteres" },
    "Afundo no Smith": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Máquina" },
    "Afundo Búlgaro com barra": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Barra" },
    "Afundo Búlgaro com halteres": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Halteres" },
    "Subida no banco (Step-up) com halteres": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Halteres" },
    "Recuo com halteres": { "agonista": ["Quadríceps", "Glúteos"], "sinergista": ["Posteriores", "Adutores", "Abdutores", "Core"], "tipo": "Halteres" },
    "Cadeira extensora (bilateral)": { "agonista": ["Quadríceps"], "sinergista": [], "tipo": "Máquina" },
    "Cadeira extensora (unilateral)": { "agonista": ["Quadríceps"], "sinergista": [], "tipo": "Máquina" },
    "Extensão de joelho com elástico": { "agonista": ["Quadríceps"], "sinergista": [], "tipo": "Elástico" }
  },
  "Posteriores": {
    "Stiff com barra": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Dorso Superior", "Panturrilhas", "Trapézio"], "tipo": "Barra" },
    "Stiff com halteres": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Dorso Superior", "Panturrilhas", "Trapézio"], "tipo": "Halteres" },
    "Stiff unilateral com halter": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Dorso Superior", "Panturrilhas", "Trapézio"], "tipo": "Halteres" },
    "Stiff com elástico": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Dorso Superior", "Panturrilhas", "Trapézio"], "tipo": "Elástico" },
    "Levantamento terra romeno (RDL) com barra": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Dorso Superior", "Panturrilhas", "Trapézio"], "tipo": "Barra" },
    "Levantamento terra romeno (RDL) com halteres": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Dorso Superior", "Panturrilhas", "Trapézio"], "tipo": "Halteres" },
    "Good Morning com barra": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Dorso Superior", "Panturrilhas", "Trapézio"], "tipo": "Barra" },
    "Mesa flexora deitada": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Máquina" },
    "Mesa flexora unilateral": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Máquina" },
    "Cadeira flexora (sentada)": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Máquina" },
    "Cadeira flexora unilateral": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Máquina" },
    "Flexora em pé unilateral (máquina)": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Máquina" },
    "Flexora em pé com caneleira": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Peso Corporal" },
    "Flexora com elástico": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Elástico" },
    "Flexão nórdica (Nordic Curl)": { "agonista": ["Posteriores"], "sinergista": ["Panturrilhas"], "tipo": "Peso Corporal" },
    "Flexão de pernas na bola suíça": { "agonista": ["Posteriores", "Glúteos", "Core"], "sinergista": ["Panturrilhas"], "tipo": "Peso Corporal" }
  },
  "Glúteos": {
    "Levantamento terra tradicional com barra": { "agonista": ["Glúteos", "Quadríceps"], "sinergista": ["Core", "Dorso Superior", "Posteriores", "Trapézio"], "tipo": "Barra" },
    "Levantamento terra com halteres": { "agonista": ["Glúteos", "Quadríceps"], "sinergista": ["Core", "Dorso Superior", "Posteriores", "Trapézio"], "tipo": "Halteres" },
    "Levantamento terra sumô": { "agonista": ["Glúteos", "Quadríceps"], "sinergista": ["Core", "Dorso Superior", "Posteriores", "Trapézio"], "tipo": "Barra" },
    "Levantamento terra (trap bar)": { "agonista": ["Glúteos", "Quadríceps"], "sinergista": ["Core", "Dorso Superior", "Posteriores", "Trapézio"], "tipo": "Barra" },
    "Elevação pélvica (Hip thrust) com barra": { "agonista": ["Glúteos"], "sinergista": ["Posteriores", "Quadríceps", "Core", "Adutores"], "tipo": "Barra" },
    "Elevação pélvica na máquina": { "agonista": ["Glúteos"], "sinergista": ["Posteriores", "Quadríceps", "Core", "Adutores"], "tipo": "Máquina" },
    "Elevação pélvica no Smith": { "agonista": ["Glúteos"], "sinergista": ["Posteriores", "Quadríceps", "Core", "Adutores"], "tipo": "Máquina" },
    "Elevação pélvica unilateral": { "agonista": ["Glúteos"], "sinergista": ["Posteriores", "Quadríceps", "Core", "Adutores"], "tipo": "Peso Corporal" },
    "Ponte de glúteo (Glute Bridge) solo": { "agonista": ["Glúteos"], "sinergista": ["Posteriores", "Quadríceps", "Core", "Adutores"], "tipo": "Peso Corporal" },
    "Ponte de glúteo com pés elevados": { "agonista": ["Glúteos"], "sinergista": ["Posteriores", "Quadríceps", "Core", "Adutores"], "tipo": "Peso Corporal" },
    "Ponte de glúteo com elástico (abduzindo)": { "agonista": ["Glúteos", "Abdutores"], "sinergista": ["Posteriores", "Quadríceps", "Core", "Adutores"], "tipo": "Elástico" },
    "Glúteo máquina (kickback)": { "agonista": ["Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" },
    "Glúteo na polia (coice)": { "agonista": ["Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" },
    "Glúteo 4 apoios com caneleira (perna estendida)": { "agonista": ["Glúteos"], "sinergista": ["Posteriores"], "tipo": "Peso Corporal" },
    "Glúteo 4 apoios com caneleira (perna flexionada)": { "agonista": ["Glúteos"], "sinergista": ["Posteriores"], "tipo": "Peso Corporal" },
    "Extensão de quadril no banco romano (Hyperextension)": { "agonista": ["Glúteos"], "sinergista": ["Posteriores"], "tipo": "Peso Corporal" },
    "Pull-through na polia": { "agonista": ["Glúteos"], "sinergista": ["Posteriores"], "tipo": "Máquina" }
  },
  "Panturrilhas": {
    "Elevação de panturrilhas em pé (máquina)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Máquina" },
    "Elevação de panturrilhas em pé (Smith)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Máquina" },
    "Elevação de panturrilhas em pé (barra)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Barra" },
    "Elevação de panturrilhas em pé (halter)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Halteres" },
    "Elevação de panturrilhas unilateral (halter)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Halteres" },
    "Elevação de panturrilhas sentado (máquina)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Máquina" },
    "Elevação de panturrilhas sentado (halter/anilha no joelho)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Halteres" },
    "Elevação de panturrilhas no Leg Press": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Máquina" },
    "Elevação de panturrilhas no degrau (peso corporal)": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Peso Corporal" },
    "Burrinho (Donkey Calf Raise) em pé": { "agonista": ["Panturrilhas"], "sinergista": [], "tipo": "Máquina" },

  },
  "Adutores": {
    "Máquina adutora (bilateral)": { "agonista": ["Adutores"], "sinergista": [], "tipo": "Máquina" },
    "Adução de quadril na polia baixa": { "agonista": ["Adutores"], "sinergista": [], "tipo": "Máquina" },
    "Adução de quadril com miniband": { "agonista": ["Adutores"], "sinergista": [], "tipo": "Elástico" },
    "Elevação medial de perna (solo)": { "agonista": ["Adutores"], "sinergista": [], "tipo": "Peso Corporal" },
    "Agachamento sumô (foco adutor) com halter": { "agonista": ["Quadríceps", "Glúteos", "Adutores"], "sinergista": ["Posteriores", "Abdutores", "Core"], "tipo": "Halteres" }
  },
  "Abdômen": {
    "Abdominal tradicional (solo)": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Peso Corporal" },
    "Abdominal com carga (anilha no peito)": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Halteres" },
    "Abdominal declinado": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Peso Corporal" },
    "Abdominal na máquina": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Máquina" },
    "Abdominal na polia (Crunch)": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Máquina" },
    "Elevação de pernas no solo": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Peso Corporal" },
    "Elevação de pernas na barra fixa": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Peso Corporal" },
    "Elevação de joelhos na paralela": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Peso Corporal" },
    "Abdominal canivete (V-up)": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Peso Corporal" },
    "Abdominal bicicleta": { "agonista": ["Abdômen"], "sinergista": ["Core"], "tipo": "Peso Corporal" },
    "Abdominal oblíquo no solo (cruzado)": { "agonista": ["Abdômen"], "sinergista": [], "tipo": "Peso Corporal" }
  },
  "Core": {
    "Prancha isométrica": { "agonista": ["Core"], "sinergista": [], "tipo": "Peso Corporal" },
    "Prancha com elevação de perna": { "agonista": ["Core"], "sinergista": [], "tipo": "Peso Corporal" },
    "Ab wheel (rodinha)": { "agonista": ["Core"], "sinergista": [], "tipo": "Peso Corporal" },
    "Dead Bug": { "agonista": ["Core"], "sinergista": ["Abdômen"], "tipo": "Peso Corporal" },
    "Escalador (Mountain Climber)": { "agonista": ["Core"], "sinergista": ["Abdômen"], "tipo": "Peso Corporal" },
    "Prancha lateral": { "agonista": ["Core"], "sinergista": ["Abdômen"], "tipo": "Peso Corporal" },
    "Rotação com cabo (Woodchop)": { "agonista": ["Core"], "sinergista": ["Abdômen"], "tipo": "Máquina" },
    "Russian Twist (com peso)": { "agonista": ["Core"], "sinergista": ["Abdômen"], "tipo": "Halteres" }
  }
};

// Normalize Muscle Group Names from Raw DB to Enum/Chart Friendly Names
const mapMuscleGroup = (rawName: string): string => {
  if (rawName === 'Peito') return MuscleGroup.Chest;
  if (rawName === 'Ombro') return MuscleGroup.Shoulders;
  if (rawName === 'Dorso Superior') return MuscleGroup.UpperBack;
  if (rawName === 'Grande Dorsal') return MuscleGroup.Lats;
  if (rawName === 'Trapézio') return MuscleGroup.Traps;
  if (rawName === 'Bíceps') return MuscleGroup.Biceps;
  if (rawName === 'Tríceps') return MuscleGroup.Triceps;
  if (rawName === 'Quadríceps') return MuscleGroup.Quads;
  if (rawName === 'Posteriores') return MuscleGroup.Hamstrings;
  if (rawName === 'Glúteos') return MuscleGroup.Glutes;
  if (rawName === 'Panturrilhas') return MuscleGroup.Calves;
  if (rawName === 'Adutores') return MuscleGroup.Adductors;
  if (rawName === 'Abdômen') return MuscleGroup.Abs;
  if (rawName === 'Core') return MuscleGroup.Core;
  if (rawName === 'Abdutores') return MuscleGroup.Abductors;
  if (rawName === 'Antebraço') return MuscleGroup.Forearms;
  return rawName;
};

// Map tipo to equipment
const mapEquipment = (tipo: string | undefined, exerciseName: string): string => {
  if (tipo) {
    switch (tipo) {
      case 'Barra': return 'Barra';
      case 'Halteres': return 'Halter';
      case 'Máquina': return 'Máquina';
      case 'Articulada': return 'Máquina';
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
    let muscleGroup = mapMuscleGroup(muscleGroupRaw);
    const agonists = (details.agonista || []).map((a: string) => a.toLowerCase());

    // Refine Muscle Groups based on Agonists
    if (muscleGroup === MuscleGroup.Shoulders) {
      // Check for Rear Delts / Rhomboids -> Upper Back or stay Shoulders?
      // Usually Rear Delts are trained with shoulders or back.
      // Let's keep them as Shoulders generally, unless it's clearly Upper Back.
      if (agonists.some((a: string) => a.includes('rombóides'))) {
        muscleGroup = MuscleGroup.UpperBack;
      }
    }

    // Auto-classify Core exercises
    if (muscleGroup === MuscleGroup.Abs) {
      if (agonists.some((a: string) => a.includes('transverso') || a.includes('core') || a.includes('lombar') || a.includes('eretor'))) {
        muscleGroup = MuscleGroup.Core;
      }
    }

    const ex: Exercise = {
      id: `ex_${idCounter++}`,
      name: exerciseName,
      muscleGroup: muscleGroup,
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
