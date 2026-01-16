# VolumeLoad - Guia Completo das Métricas

Este documento explica detalhadamente todas as métricas utilizadas no aplicativo VolumeLoad, incluindo suas fórmulas, lógicas de cálculo, e como interpretá-las para otimizar o treinamento dos seus alunos.

---

## 📊 Sumário

1. [Aba Dashboard](#aba-dashboard)
   - [Cards de Estatísticas](#cards-de-estatísticas)
   - [Mapa de Calor Muscular](#mapa-de-calor-muscular)
   - [Distribuição de Volume](#distribuição-de-volume)
   - [Carga de Trabalho Recente](#carga-de-trabalho-recente)
   - [Performance Radar](#performance-radar)
   - [Carrossel de Avaliações](#carrossel-de-avaliações)
2. [Aba Analytics](#aba-analytics)
   - [Gráfico ACWR](#gráfico-acwr)
   - [Progressão de Exercícios](#progressão-de-exercícios)
   - [Evolução de Volume](#evolução-de-volume)
3. [Aba Avaliações](#aba-avaliações)
   - [Protocolos de Composição Corporal](#protocolos-de-composição-corporal)
   - [Testes Cardiorrespiratórios](#testes-cardiorrespiratórios)
   - [Testes de Força](#testes-de-força)

---

## Aba Dashboard

O Dashboard é o centro de comando do perfil do aluno. Ele oferece uma visão rápida e holística do progresso semanal, permitindo decisões informadas sobre ajustes no programa.

---

### Cards de Estatísticas

Os três cards no topo do Dashboard fornecem informações essenciais de forma instantânea.

#### 1. Treinos na Semana

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Quantidade de sessões de treino completadas na semana atual vs. o planejado. |
| **Cálculo** | `Atual / Planejado` |
| **Exemplo** | Se o programa tem 4 treinos/semana e o aluno fez 3, exibe `3/4`. |
| **Por que importa** | A consistência é o fator #1 para resultados. Este card mostra imediatamente se o aluno está aderindo ao plano. |

> [!TIP]
> Se um aluno constantemente completa menos treinos do que o planejado, considere reduzir a frequência do programa para algo mais realista.

---

#### 2. Volume Semanal (Séries)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Total de séries executadas na semana vs. o planejado pelo programa. |
| **Cálculo** | Soma de todas as séries de todos os exercícios em todas as sessões da semana. |
| **Base de Planejamento** | Soma das séries de cada treino do programa × frequência semanal de cada treino. |
| **Por que importa** | O volume é o principal driver de hipertrofia. Este card indica se o aluno está atingindo o estímulo necessário. |

> [!NOTE]
> O valor "planejado" considera a frequência semanal definida no agendamento do programa. Se um treino é feito 2x/semana, suas séries contam duas vezes.

---

#### 3. Status ACWR

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Razão entre Carga Aguda (últimos 7 dias) e Carga Crônica (últimos 28 dias). |
| **Fórmula** | `ACWR = Carga Aguda / Carga Crônica` |
| **Interpretação** | Ver tabela abaixo. |

| Faixa ACWR | Status | Cor | Significado |
|------------|--------|-----|-------------|
| < 0.80 | Subtreinamento | 🔵 Ciano | O aluno está treinando menos do que o habitual. Pode estar em descarga, mas se persistir, indica perda de adaptação. |
| 0.80 - 1.30 | Sweet Spot | 🟣 Índigo | Zona ideal. O estímulo atual é proporcional à capacidade construída. Maximiza adaptação, minimiza risco. |
| 1.31 - 1.50 | Risco Aumentado | 🟣 Roxo | Carga recente está elevada em relação ao condicionamento. Atenção redobrada a sinais de fadiga. |
| > 1.50 | Alto Risco | 🔴 Vermelho | Perigo de lesão. A carga aguda está muito acima da crônica. Recomenda-se reduzir intensidade/volume imediatamente. |

> [!CAUTION]
> Um ACWR > 1.50 por mais de 2 dias consecutivos é um alerta sério. Reavalie o programa imediatamente.

---

### Mapa de Calor Muscular

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Distribuição do volume de treino por grupo muscular na semana atual. |
| **Visualização** | Corpo humano com músculos coloridos por intensidade de volume (baixo → alto). |
| **Cálculo** | Soma das séries de cada exercício, atribuídas ao músculo agonista principal. Sinergistas recebem 50% do crédito. |

#### Escala de Cores

| Faixa de Séries | Cor | Indicação |
|-----------------|-----|-----------|
| 0 - 5 | Azul escuro | Volume Baixo |
| 6 - 10 | Ciano | Volume Médio-Baixo |
| 11 - 15 | Verde | Volume Alvo |
| 16 - 20 | Amarelo | Volume Alto |
| > 20 | Vermelho | Volume Muito Alto |

> [!TIP]
> Use o heatmap para identificar desequilíbrios. Por exemplo, se o peito está vermelho e as costas azul escuro, há um desbalanceamento que pode levar a problemas posturais.

---

### Distribuição de Volume

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Volume por grupo muscular em formato de gráfico de barras. |
| **Modos** | **Séries** (contagem de séries) ou **Carga** (volume-load = peso × reps). |
| **Comparativo** | Mostra a semana atual vs. a semana anterior para análise de tendências. |

> [!NOTE]
> A métrica "Carga" é mais precisa para medir estímulo real, pois considera peso e repetições. A métrica "Séries" é mais simples e rápida de analisar.

---

### Carga de Trabalho Recente

Este card aprofunda a análise de carga, essencial para gestão de fadiga e prevenção de lesões.

#### Carga Interna (Acumulada 7d)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Soma da carga interna de todas as sessões dos últimos 7 dias. |
| **Fórmula** | `Carga Interna = Σ (Séries × RPE)` para cada sessão |
| **Conversão RIR → RPE** | `RPE = 10 - RIR` |
| **Unidade** | UA (Unidades Arbitrárias) |

**Exemplo de Cálculo:**
- Sessão com 20 séries totais, RIR médio de 2
- RPE = 10 - 2 = 8
- Carga Interna = 20 × 8 = 160 UA

#### Zonas de Carga Interna

| Zona | Faixa (UA) | Cor | Indicação |
|------|-----------|-----|-----------|
| Baixa (Recuperativa) | < 80 | 🔵 Ciano | Sessão leve, foco em recuperação ou técnica. |
| Moderada (Alvo) | 80 - 150 | 🟣 Índigo | Zona ideal para a maioria das sessões. Bom estímulo com recuperação adequada. |
| Alta | 151 - 220 | 🟣 Roxo | Sessões intensas. Limitar frequência para evitar overreaching. |
| Extrema (Alerta) | > 220 | 🔴 Vermelho | Muito raro. Apenas em situações específicas (ex: testes de máximos). |

---

#### Carga Aguda (7d)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Média da carga interna diária nos últimos 7 dias. |
| **Fórmula** | `Carga Aguda = Soma das cargas diárias (7 dias) / 7` |
| **Representa** | Estado de fadiga atual do atleta. |

---

#### Carga Crônica (28d)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Média da carga interna diária nos últimos 28 dias. |
| **Fórmula** | `Carga Crônica = Soma das cargas diárias (28 dias) / 28` |
| **Representa** | Capacidade de trabalho construída (condicionamento). |

> [!IMPORTANT]
> A Carga Crônica é a "base de sustentação" do atleta. Aumentá-la gradualmente ao longo das semanas permite que ele tolere cargas agudas maiores sem risco.

---

### Performance Radar

O gráfico radar oferece uma visão holística de 5 dimensões do desempenho semanal, cada uma pontuada de 0 a 100.

#### Eixo 1: Consistência

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Adesão às sessões planejadas. |
| **Fórmula** | `(Sessões Realizadas / Sessões Planejadas) × 100` |
| **Score 100** | Todas as sessões planejadas foram realizadas. |
| **Score 0** | Nenhuma sessão foi realizada. |

---

#### Eixo 2: Vol. MMSS (Membros Superiores)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Adesão ao volume planejado para músculos superiores (Peito, Costas, Ombros, Bíceps, Tríceps). |
| **Fórmula** | `(Séries Realizadas MMSS / Séries Planejadas MMSS) × 100` |
| **Score 100** | Volume planejado atingido ou superado (cap de 100). |

---

#### Eixo 3: Vol. MMII (Membros Inferiores)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Adesão ao volume planejado para músculos inferiores (Quadríceps, Posteriores, Glúteos, Panturrilhas). |
| **Fórmula** | `(Séries Realizadas MMII / Séries Planejadas MMII) × 100` |
| **Score 100** | Volume planejado atingido ou superado. |

> [!TIP]
> Se MMSS está sempre acima de MMII, o aluno pode estar negligenciando perna. Use isso para ajustar a priorização do programa.

---

#### Eixo 4: Evolução (Progressão)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Taxa de progressão de carga nos exercícios. |
| **Método Principal** | Compara E1RM (1RM Estimado) da semana atual com histórico anterior. |
| **Fórmula E1RM** | `E1RM = Peso × (1 + 0.0333 × Repetições)` (Fórmula de Brzycki simplificada) |
| **Score 100** | ≥60% dos exercícios comparáveis mostraram progressão. |
| **Score 75** | 30-59% dos exercícios comparáveis mostraram progressão. |
| **Score 40** | <30% dos exercícios comparáveis mostraram progressão. |

**Fallback (se <3 exercícios comparáveis):**
- Compara volume total da semana atual vs. anterior.
- Se houve aumento: 100 pontos.
- Se manteve ±10%: 75 pontos.
- Se caiu: 40 pontos.

---

#### Eixo 5: Intensidade (Esforço)

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Nível médio de esforço percebido nas séries da semana. |
| **Base** | Média do RPE de todas as séries (ou conversão de RIR). |
| **Fórmula** | `RPE Médio = Σ RPE / Número de Séries` |

| RPE Médio | Score | Indicação |
|-----------|-------|-----------|
| 8.0 - 9.5 | 100 | Zona ideal de intensidade para hipertrofia. |
| 7.0 - 7.9 | 85 | Bom, mas poderia empurrar um pouco mais. |
| > 9.5 | 70 | Pode estar exagerando. Atenção à recuperação. |
| 6.0 - 6.9 | 60 | Esforço moderado. Pode ser intencional (descarga) ou falta de foco. |
| < 6.0 | 40 | Esforço baixo. As séries estão muito fáceis. |

> [!NOTE]
> O objetivo não é sempre ter 100 em todos os eixos. Um mesociclo pode ter fases de descarga (intensidade baixa proposital) ou foco em volume (evolução pode estagnar temporariamente).

---

### Carrossel de Avaliações

Exibe os resultados mais recentes de avaliações físicas em 3 categorias:

#### Slide 1: Capacidade Cardiorrespiratória

| Métrica | Descrição |
|---------|-----------|
| **VO2 Máx** | Consumo máximo de oxigênio em ml/kg/min. Indicador de aptidão aeróbica. |
| **Distância** | Distância percorrida em testes de campo (ex: Cooper). |
| **Protocolo** | Tipo de teste utilizado (Cooper, Rockport, Bruce, etc.). |

---

#### Slide 2: Força & Resistência

| Métrica | Descrição |
|---------|-----------|
| **Resultado** | Carga máxima (1RM), repetições máximas, ou score do teste. |
| **Classificação** | Avaliação qualitativa baseada em tabelas normativas. |
| **Teste** | Protocolo utilizado (1RM Supino, Flexões, Dinamometria, etc.). |

---

#### Slide 3: Composição Corporal

| Métrica | Descrição |
|---------|-----------|
| **Gordura Corporal (%)** | Percentual de gordura estimado pelo protocolo utilizado. |
| **Peso Atual** | Peso corporal em kg. |
| **Massa Magra** | Massa corporal livre de gordura (se disponível no protocolo). |

---

## Aba Analytics

A aba Analytics oferece análises mais profundas e longitudinais do treinamento.

---

### Gráfico ACWR

#### Componentes do Gráfico

| Elemento | Descrição |
|----------|-----------|
| **Barras** | Carga interna diária (UA). Cor varia conforme a zona (Baixa → Extrema). |
| **Linha** | Carga Crônica (média móvel de 28 dias). Mostra a tendência de condicionamento. |
| **Área Sombreada** | Zona "Sweet Spot" (ACWR 0.80 - 1.30). Quando as barras estão nessa faixa proporcional, o risco é minimizado. |

#### Como Interpretar

```
Cenário Ideal:
- Barras crescendo gradualmente ao longo das semanas.
- Linha crônica acompanhando o crescimento.
- Pontuais picos (barras altas) seguidos de dias mais leves.

Cenário de Risco:
- Pico abrupto de barras muito acima da linha crônica.
- Barras vermelhas por vários dias consecutivos.
- ACWR consistentemente > 1.50.
```

---

### Progressão de Exercícios

| Propriedade | Descrição |
|-------------|-----------|
| **O que mostra** | Evolução da carga levantada em um exercício específico ao longo do tempo. |
| **Métrica Primária** | E1RM (1RM Estimado) = Peso × (1 + 0.0333 × Reps) |
| **Filtros** | Por grupo muscular, por exercício específico. |

> [!TIP]
> Use este gráfico para identificar platôs. Se a linha está flat por mais de 3-4 semanas, é hora de mudar alguma variável (exercício, técnica, volume, ou intensidade).

---

### Evolução de Volume

| Propriedade | Descrição |
|-------------|-----------|
| **O que mostra** | Total de séries semanais por grupo muscular ao longo do tempo. |
| **Análise** | Identificar tendências de aumento/diminuição de volume. |
| **Filtros** | Por grupo muscular. |

---

## Aba Avaliações

A aba de avaliações contém testes padronizados para mensurar diferentes capacidades físicas.

---

### Protocolos de Composição Corporal

#### Pollock 3 Dobras

| Propriedade | Descrição |
|-------------|-----------|
| **Medidas** | Tríceps, Suprailíaca, Coxa (mulheres) ou Peito, Abdômen, Coxa (homens). |
| **Fórmula** | Densidade corporal → % Gordura via equação de Siri. |
| **Precisão** | Erro padrão ~3-4%. |

#### Pollock 7 Dobras

| Propriedade | Descrição |
|-------------|-----------|
| **Medidas** | Peito, Axilar Média, Tríceps, Subescapular, Abdômen, Suprailíaca, Coxa. |
| **Vantagem** | Maior precisão por usar mais pontos de referência. |

#### Faulkner

| Propriedade | Descrição |
|-------------|-----------|
| **Medidas** | Tríceps, Subescapular, Suprailíaca, Abdômen. |
| **Uso** | Popular no Brasil para avaliações rápidas.

#### BIA (Bioimpedância)

| Propriedade | Descrição |
|-------------|-----------|
| **Método** | Passagem de corrente elétrica pelo corpo. |
| **Limitações** | Sensível a hidratação, alimentação recente, exercício prévio. |
| **Vantagem** | Rápido e não invasivo.

---

### Testes Cardiorrespiratórios

#### Teste de Cooper (12 minutos)

| Propriedade | Descrição |
|-------------|-----------|
| **Protocolo** | Correr a maior distância possível em 12 minutos. |
| **Fórmula VO2** | `VO2max = (Distância em metros - 504.9) / 44.73` |
| **Classificação** | Tabelas por idade e sexo.

#### Rockport (Caminhada 1 Milha)

| Propriedade | Descrição |
|-------------|-----------|
| **Protocolo** | Caminhar 1.609 metros o mais rápido possível. |
| **Variáveis** | Tempo, FC final, peso corporal, idade, sexo. |
| **Uso** | Ideal para iniciantes ou idosos que não podem correr.

#### Bruce (Esteira)

| Propriedade | Descrição |
|-------------|-----------|
| **Protocolo** | Teste em esteira com incrementos de inclinação e velocidade a cada 3 minutos. |
| **Endpoint** | Exaustão voluntária ou FC máxima. |
| **Precisão** | Alta (teste laboratorial).

---

### Testes de Força

#### Teste de 1RM

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Carga máxima que o indivíduo consegue levantar uma única vez. |
| **Exercícios Comuns** | Supino, Leg Press, Agachamento. |
| **Força Relativa** | `1RM / Peso Corporal` - Permite comparar indivíduos de diferentes pesos.

#### Dinamometria Manual

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Força de preensão manual (indicador de força geral). |
| **Equipamento** | Dinamômetro de mão. |
| **Classificação** | Tabelas por idade e sexo.

#### Flexões / Abdominais

| Propriedade | Descrição |
|-------------|-----------|
| **O que mede** | Resistência muscular localizada. |
| **Protocolo** | Número máximo de repetições em tempo determinado (ou até falha). |
| **Classificação** | Tabelas normativas.

---

## 📖 Glossário

| Termo | Definição |
|-------|-----------|
| **ACWR** | Acute:Chronic Workload Ratio - Razão entre carga aguda e crônica. |
| **E1RM** | Estimated 1 Rep Max - 1RM estimado a partir de submáximos. |
| **MMSS** | Membros Superiores. |
| **MMII** | Membros Inferiores. |
| **RIR** | Reps In Reserve - Repetições restantes até a falha. |
| **RPE** | Rate of Perceived Exertion - Escala de esforço percebido (0-10). |
| **UA** | Unidades Arbitrárias - Unidade de medida para carga interna. |
| **Volume-Load** | Peso × Repetições × Séries - Medida de trabalho total. |
| **VO2max** | Consumo máximo de oxigênio - Indicador de aptidão aeróbica. |

---

> [!NOTE]
> Este documento deve ser atualizado conforme novas métricas ou análises sejam adicionadas ao aplicativo.

---

*Documento gerado automaticamente pelo sistema VolumeLoad.*
