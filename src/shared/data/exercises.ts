import { Exercise, MuscleGroup } from '../types';

const RAW_DB = {
  "Peito": {
    "Supino reto com barra": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Supino inclinado com barra": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Supino declinado com barra": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Supino reto com halteres": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Supino inclinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Supino declinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Crucifixo reto com halteres": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"] },
    "Crucifixo inclinado com halteres": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"] },
    "Peck deck (crucifixo máquina)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"] },
    "Crossover (cabo alto)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"] },
    "Crossover (cabo médio)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"] },
    "Crossover (cabo baixo)": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"] },
    "Supino máquina articulada": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Supino inclinado máquina": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Supino declinado máquina": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Flexão de braços tradicional": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Flexão declinada": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Flexão inclinada": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Flexão com braços abertos": { "agonista": ["Peitoral"], "sinergista": ["Deltoide anterior"] },
    "Flexão com palmas": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] },
    "Paralelas com inclinação para peitoral": { "agonista": ["Peitoral"], "sinergista": ["Tríceps", "Deltoide anterior"] }
  },
  "Ombro": {
    "Desenvolvimento com barra (frente)": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"] },
    "Desenvolvimento com halteres": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"] },
    "Desenvolvimento Arnold": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps", "Peitoral superior"] },
    "Elevação frontal com halteres": { "agonista": ["Deltoide anterior"], "sinergista": [] },
    "Elevação frontal com barra": { "agonista": ["Deltoide anterior"], "sinergista": [] },
    "Elevação frontal com polia": { "agonista": ["Deltoide anterior"], "sinergista": [] },
    "Flexão pike": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps"] },
    "Flexão em parada de mão": { "agonista": ["Deltoide anterior"], "sinergista": ["Tríceps"] },
    "Elevação lateral com halteres": { "agonista": ["Deltoide medial"], "sinergista": [] },
    "Elevação lateral na máquina": { "agonista": ["Deltoide medial"], "sinergista": [] },
    "Elevação lateral com polia": { "agonista": ["Deltoide medial"], "sinergista": [] },
    "Desenvolvimento militar": { "agonista": ["Deltoide medial"], "sinergista": ["Deltoide anterior", "Tríceps"] },
    "Crucifixo inverso com halteres": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"] },
    "Crucifixo inverso na máquina": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"] },
    "Face pull com corda": { "agonista": ["Rombóides"], "sinergista": ["Deltoide posterior", "Trapézio médio"] },
    "Crucifixo inverso na polia": { "agonista": ["Deltoide posterior", "Rombóides"], "sinergista": ["Trapézio médio"] },
    "Remada alta com barra (pegada fechada)": { "agonista": ["Deltoide medial"], "sinergista": ["Trapézio superior", "Bíceps"] },
    "Remada alta com halteres (pegada fechada)": { "agonista": ["Deltoide medial"], "sinergista": ["Trapézio superior", "Bíceps"] },
    "Remada alta pegada aberta (pegada fechada)": { "agonista": ["Deltoide posterior"], "sinergista": ["Trapézio superior", "Bíceps"] },
    "Remada curvada (pegada fechada)": { "agonista": ["Deltoide posterior"], "sinergista": ["Dorsal", "Bíceps"] }
  },
  "Costas": {
    "Puxada frontal na polia (pegada aberta)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"] },
    "Puxada frontal na polia (pegada neutra)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"] },
    "Puxada atrás da nuca": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"] },
    "Barra fixa pronada": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"] },
    "Barra fixa neutra": { "agonista": ["Dorsal"], "sinergista": ["Bíceps"] },
    "Australian pull-up (barra baixa)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Pulldown com braços estendidos (pullover na polia)": { "agonista": ["Dorsal"], "sinergista": ["Peitoral maior", "Tríceps longo"] },
    "Levantamento terra": { "agonista": ["Dorsal"], "sinergista": ["Glúteo máximo", "Eretor da espinha", "Trapézio", "Posterior da coxa"] },
    "Encolhimento de ombros com barra": { "agonista": ["Trapézio superior"], "sinergista": [] },
    "Encolhimento com halteres": { "agonista": ["Trapézio superior"], "sinergista": [] },
    "Encolhimento na máquina": { "agonista": ["Trapézio superior"], "sinergista": [] },
    "Retratação escapular na polia": { "agonista": ["Rombóides"], "sinergista": ["Trapézio médio"] },
    "Superman com foco em escápulas": { "agonista": ["Rombóides"], "sinergista": ["Trapézio médio", "Eretores da espinha"] },
    "Prancha com retração escapular": { "agonista": ["Rombóides"], "sinergista": ["Trapézio médio", "Serrátil anterior"] },
    "Remada curvada com barra (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada unilateral com halteres (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada baixa na polia (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada cavalinho (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada máquina Hammer (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada baixa (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada com barra T (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada sentado com halteres (pegada fechada)": { "agonista": ["Dorsal"], "sinergista": ["Bíceps", "Trapézio médio"] },
    "Remada aberta (escapular)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada curvada (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada curvada com barra (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada unilateral com halteres (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada baixa na polia (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada cavalinho (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada máquina Hammer (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada baixa com pegada neutra (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada com barra T (pegada neutra) (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada curvada com barra (pegada média) (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada sentado com halteres (pegada neutra) (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada escapular (remo com escápula) (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] },
    "Remada em pé com polia para romboides (pegada aberta)": { "agonista": ["Romboides"], "sinergista": ["Bíceps", "Deltoide posterior", "Trapézio médio"] }
  },
  "Bíceps": {
    "Barra fixa supinada": { "agonista": ["Bíceps"], "sinergista": ["Dorsal", "Braquial"] },
    "Rosca direta com barra": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"] },
    "Rosca direta com halteres": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"] },
    "Rosca alternada com halteres": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"] },
    "Rosca martelo com halteres": { "agonista": ["Braquiorradial"], "sinergista": ["Bíceps", "Braquial"] },
    "Rosca concentrada": { "agonista": ["Bíceps"], "sinergista": ["Braquial"] },
    "Rosca 21": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"] },
    "Rosca Scott com barra": { "agonista": ["Bíceps"], "sinergista": ["Braquial"] },
    "Rosca Scott com halteres": { "agonista": ["Bíceps"], "sinergista": ["Braquial"] },
    "Rosca direta na polia baixa": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"] },
    "Rosca unilateral na polia": { "agonista": ["Bíceps"], "sinergista": ["Braquial"] },
    "Rosca Scott na máquina": { "agonista": ["Bíceps"], "sinergista": ["Braquial"] },
    "Rosca com corda na polia": { "agonista": ["Bíceps"], "sinergista": ["Braquial", "Braquiorradial"] },
    "Australian pull-up (pegada supinada)": { "agonista": ["Bíceps"], "sinergista": ["Dorsal", "Braquial"] }
  },
  "Tríceps": {
    "Tríceps testa com barra": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"] },
    "Tríceps testa com halteres": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"] },
    "Tríceps coice com halteres": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps francês com halteres": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps francês com barra": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps unilateral com halter": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps na polia com barra reta": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps na polia com corda": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps na polia com barra V": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps na polia unilateral": { "agonista": ["Tríceps"], "sinergista": [] },
    "Tríceps testa na polia": { "agonista": ["Tríceps"], "sinergista": [] },
    "Paralelas com foco em tríceps": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Deltoide anterior"] },
    "Mergulho entre bancos": { "agonista": ["Tríceps"], "sinergista": ["Deltoide anterior"] },
    "Flexão com pegada fechada": { "agonista": ["Tríceps"], "sinergista": ["Peitoral", "Deltoide anterior"] }
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
    "Cadeira extensora": { "agonista": ["Quadríceps"], "sinergista": [] },
    "Agachamento livre": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Eretores da espinha"] },
    "Agachamento sumô": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Adutores"] },
    "Agachamento frontal com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Eretores da espinha"] },
    "Agachamento overhead (com barra acima da cabeça)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core", "Deltoide anterior"] },
    "Agachamento com halteres (goblet)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core"] },
    "Agachamento com kettlebell (goblet)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core"] },
    "Agachamento búlgaro com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Agachamento unilateral (pistol squat)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core", "Isquiotibiais"] },
    "Agachamento na máquina Smith": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Agachamento Hack Machine": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Agachamento na Multipower": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Agachamento livre (peso corporal)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Agachamento isométrico na parede": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": [] },
    "Air squat (agachamento dinâmico)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Core"] },
    "Agachamento com salto": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Panturrilhas"] },
    "Avanço com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Avanço com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Afundo com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Afundo com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Afundo búlgaro com barra": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Afundo búlgaro com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Avanço na esteira (dinâmico)": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Afundo no Smith": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Afundo reverso com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Afundo lateral com halteres": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Adutores", "Core"] },
    "Afundo lateral com peso corporal": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Adutores"] },
    "Avanço com peso corporal": { "agonista": ["Quadríceps", "Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] }
  },
  "Isquiotibiais": {
    "Stiff com barra": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"] },
    "Stiff com halteres": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"] },
    "Stiff unilateral com halteres": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha", "Core"] },
    "Good morning com barra": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"] },
    "Levantamento terra romeno": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Eretores da espinha"] },
    "Mesa flexora deitada": { "agonista": ["Isquiotibiais"], "sinergista": [] },
    "Mesa flexora sentada": { "agonista": ["Isquiotibiais"], "sinergista": [] },
    "Flexora em pé unilateral": { "agonista": ["Isquiotibiais"], "sinergista": [] },
    "Elevação de quadril com bola suíça": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Core"] },
    "Nordic curl": { "agonista": ["Isquiotibiais"], "sinergista": [] },
    "Ponte unilateral": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": ["Core"] },
    "Ponte com apoio nos calcanhares": { "agonista": ["Isquiotibiais", "Glúteo máximo"], "sinergista": [] }
  },
  "Glúteo máximo": {
    "Levantamento terra tradicional com barra": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha", "Core"] },
    "Levantamento terra sumô": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Adutores", "Eretores da espinha", "Isquiotibiais"] },
    "Levantamento terra com halteres": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha", "Core"] },
    "Levantamento terra com kettlebell": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha", "Core"] },
    "Levantamento terra com trap bar": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha"] },
    "Levantamento terra com resistência elástica": { "agonista": ["Glúteo máximo", "Quadríceps"], "sinergista": ["Eretores da espinha"] },
    "Glúteo na polia (extensão de quadril)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Glúteo máquina (kickback)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Extensão de quadril no solo com caneleira": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Elevação de quadril (ponte de glúteo)": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Elevação de quadril com peso": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"] },
    "Hip thrust com barra": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Hip thrust unilateral": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Elevação pélvica com bola suíça": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais", "Core"] },
    "Glúteo 4 apoios com elevação de perna (coice)": { "agonista": ["Glúteo máximo"], "sinergista": [] },
    "Glúteo 4 apoios com caneleira": { "agonista": ["Glúteo máximo"], "sinergista": ["Isquiotibiais"] }
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
    "Abdominal tradicional": { "agonista": ["Reto abdominal"], "sinergista": [] },
    "Abdominal supra no solo": { "agonista": ["Reto abdominal"], "sinergista": [] },
    "Abdominal infra com pernas elevadas": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco"] },
    "Abdominal canivete": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco"] },
    "Abdominal na prancha declinada": { "agonista": ["Reto abdominal"], "sinergista": [] },
    "Prancha isométrica": { "agonista": ["Transverso abdominal"], "sinergista": ["Reto abdominal", "Oblíquos", "Glúteo máximo"] },
    "Prancha lateral": { "agonista": ["Oblíquos"], "sinergista": ["Transverso abdominal", "Glúteo médio"] },
    "Prancha com elevação de perna": { "agonista": ["Transverso abdominal"], "sinergista": ["Glúteo máximo", "Reto abdominal"] },
    "Abdominal oblíquo no solo": { "agonista": ["Oblíquos"], "sinergista": ["Reto abdominal"] },
    "Rotação com cabo (cable twist)": { "agonista": ["Oblíquos"], "sinergista": ["Transverso abdominal"] },
    "Pallof press (anti-rotação)": { "agonista": ["Transverso abdominal"], "sinergista": ["Oblíquos"] },
    "Ab wheel (rodinha abdominal)": { "agonista": ["Reto abdominal"], "sinergista": ["Transverso abdominal", "Eretores da espinha"] },
    "Escalador (mountain climber)": { "agonista": ["Reto abdominal"], "sinergista": ["Oblíquos"] },
    "Dead bug": { "agonista": ["Transverso abdominal"], "sinergista": ["Reto abdominal"] },
    "Hollow body hold": { "agonista": ["Transverso abdominal"], "sinergista": ["Reto abdominal"] },
    "Elevação de pernas na barra": { "agonista": ["Reto abdominal"], "sinergista": ["Psoas-ilíaco", "Oblíquos"] }
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

// Flatten the structure
export const EXERCISE_DB: Exercise[] = [];
export const EXERCISE_MAP = new Map<string, Exercise>();
let idCounter = 1;

Object.entries(RAW_DB).forEach(([muscleGroupRaw, exercises]) => {
  Object.entries(exercises).forEach(([exerciseName, details]) => {
    const ex: Exercise = {
      id: `ex_${idCounter++}`,
      name: exerciseName,
      muscleGroup: mapMuscleGroup(muscleGroupRaw),
      equipment: exerciseName.toLowerCase().includes('barra') ? 'Barra' :
        exerciseName.toLowerCase().includes('halter') ? 'Halter' :
          exerciseName.toLowerCase().includes('máquina') ? 'Máquina' :
            exerciseName.toLowerCase().includes('polia') || exerciseName.toLowerCase().includes('cabo') ? 'Cabo' :
              'Peso do Corpo',
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
