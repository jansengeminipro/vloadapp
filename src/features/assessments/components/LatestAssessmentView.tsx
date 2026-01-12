
import React, { useState } from 'react';
import { Activity, Dumbbell, Ruler, TrendingUp, ChevronRight, Info } from 'lucide-react';
import { Assessment, AnalysisResult } from '../domain/models';
import { AVAILABLE_TESTS, TEST_CATEGORIES } from '../domain/strategies';
import NormalityBar from './NormalityBar';
import AssessmentDetailModal from './AssessmentDetailModal';

interface LatestAssessmentViewProps {
    history: Assessment[];
}

// Helper to estimate visual percentage based on textual classification
// Helper to estimate visual percentage based on textual classification
const getPseudoValueFromClassification = (classification: string, isHigherBetter: boolean): number => {
    const c = classification.toLowerCase();

    if (isHigherBetter) {
        // Para testes onde MAIOR é MELHOR (VO2, Força):
        // Excelente/Alto = Direita (90%)
        // Fraco/Baixo = Esquerda (10%)
        if (c.includes('excelente') || c.includes('atleta')) return 90;
        if (c.includes('bom') || c.includes('fitness')) return 75;
        if (c.includes('médio') || c.includes('normal')) return 50;
        if (c.includes('ruim') || c.includes('baixo')) return 25;
        if (c.includes('muito fraco')) return 10;
    } else {
        // Para testes onde MENOR é MELHOR (Gordura, IMC, RCE):
        // Obeso/Alto/Risco = Direita (90%) - Representa ALTA Quantidade/Volume
        // Excelente/Baixo = Esquerda (10%) - Representa BAIXA Quantidade/Volume
        if (c.includes('obeso') || c.includes('obesidade') || c.includes('muito alto') || c.includes('risco aumentado')) return 90;
        if (c.includes('alto') || c.includes('sobrepeso')) return 75;
        if (c.includes('médio') || c.includes('normal')) return 50;
        if (c.includes('bom') || c.includes('fitness')) return 25;
        if (c.includes('excelente') || c.includes('atleta') || c.includes('baixo') || c.includes('essencial') || c.includes('abaixo do peso')) return 10;
    }
    return 50;
};

// Helper: Check if HIGHER score is BETTER (e.g. VO2) or WORSE (e.g. Fat)
const isHigherBetterForTest = (testId: string): boolean => {
    // Cardio tests (VO2) -> Higher is better
    if (['rockport', 'cooper', 'bruce'].includes(testId)) return true;
    // Strength -> Higher is better
    if (testId === 'pushups' || testId === 'situps') return true;
    // Body Composition (Fat, BMI) -> Lower is usually "better" (or distinct logic). 
    // NormalityBar handles "isHigherBetter" to swap colors.
    // For Fat: High is Red (Bad). So isHigherBetter = false. 
    return false;
};

const LatestAssessmentView: React.FC<LatestAssessmentViewProps> = ({ history }) => {
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

    // Group Assessments by Category
    const grouped = React.useMemo(() => {
        const categories: Record<string, Assessment[]> = {};

        // Use predefined categories to ensure order
        TEST_CATEGORIES.forEach(cat => categories[cat.id] = []);

        // Get latest for each specific test type
        const latestByType: Record<string, Assessment> = {};
        const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        sorted.forEach(ass => {
            latestByType[ass.type] = ass;
        });

        // Distribute into categories
        Object.values(latestByType).forEach(ass => {
            const testInfo = AVAILABLE_TESTS.find(t => t.id === ass.type);
            const catId = testInfo?.category || 'other';
            if (!categories[catId]) categories[catId] = [];
            categories[catId].push(ass);
        });

        // Filter empty categories
        return Object.entries(categories).filter(([_, items]) => items.length > 0);
    }, [history]);

    // Find previous assessment for diff
    const getPreviousScore = (current: Assessment) => {
        const sameType = history
            .filter(a => a.type === current.type && new Date(a.date) < new Date(current.date))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (sameType.length > 0) {
            const prevResult = sameType[0].data._result as AnalysisResult;
            return prevResult?.score;
        }
        return null;
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 italic bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                Nenhuma avaliação realizada ainda.
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {grouped.map(([catId, assessments]) => {
                const catLabel = TEST_CATEGORIES.find(c => c.id === catId)?.label || 'Outros';

                return (
                    <div key={catId} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {catId === 'cardio' && <Activity className="text-primary-500" />}
                                {catId === 'anthropometry' && <Ruler className="text-primary-500" />}
                                {catId === 'strength' && <Dumbbell className="text-primary-500" />}
                                {catLabel}
                            </h3>

                        </div>

                        <div className="divide-y divide-slate-800/50">
                            {assessments.map(assessment => {
                                const testInfo = AVAILABLE_TESTS.find(t => t.id === assessment.type);
                                const result = assessment.data._result as AnalysisResult;
                                if (!result) return null;

                                const prevScore = getPreviousScore(assessment);
                                const diff = prevScore !== null && result.score !== undefined ? result.score - prevScore : 0;
                                const hasEvolution = prevScore !== null;

                                // Pseudo-visuals for bar
                                const isBetter = isHigherBetterForTest(assessment.type);
                                const visualValue = getPseudoValueFromClassification(result.classification, isBetter);

                                return (
                                    <button
                                        key={assessment.id}
                                        onClick={() => setSelectedAssessment(assessment)}
                                        className="w-full text-left p-6 hover:bg-slate-800/50 transition-all group flex flex-col md:flex-row md:items-center gap-6"
                                    >
                                        {/* Left: Label & Value */}
                                        <div className="md:w-1/3 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                                    {testInfo?.label || assessment.type}
                                                </span>
                                                <Info size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="flex items-end gap-3">
                                                <span className="text-3xl font-black text-white leading-none">
                                                    {result.score}
                                                </span>
                                                {hasEvolution && (
                                                    <span className={`text-xs font-bold mb-1 px-1.5 py-0.5 rounded ${(isBetter && diff > 0) || (!isBetter && diff < 0)
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : (diff === 0)
                                                            ? 'bg-slate-700 text-slate-400'
                                                            : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">
                                                {result.classification}
                                            </div>
                                        </div>

                                        {/* Right: Normality Bar */}
                                        <div className="flex-1 w-full md:mt-0 pt-2 md:pt-0">
                                            <NormalityBar
                                                value={visualValue}
                                                min={0}
                                                max={100}
                                                lowThreshold={33}
                                                highThreshold={66}
                                                isHigherBetter={isBetter}
                                                formatValue={() => ''} // Hide pseudo value
                                            />
                                        </div>

                                        <div className="hidden md:block text-slate-600 group-hover:text-primary-500 transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Modal de Detalhes */}
            {selectedAssessment && (() => {
                const testInfo = AVAILABLE_TESTS.find(t => t.id === selectedAssessment.type);
                const category = TEST_CATEGORIES.find(c => c.id === testInfo?.category);
                const result = selectedAssessment.data._result as AnalysisResult;

                // Get history for this type
                const historyForType = history.filter(h => h.type === selectedAssessment.type);

                return (
                    <AssessmentDetailModal
                        isOpen={!!selectedAssessment}
                        onClose={() => setSelectedAssessment(null)}
                        metricLabel={testInfo?.label || selectedAssessment.type}
                        metricKey="score" // Main score
                        currentValue={result.score || 0}
                        unit={
                            testInfo?.category === 'anthropometry'
                                ? (selectedAssessment.type === 'bmi' || selectedAssessment.type === 'rce' ? '' : '%')
                                : testInfo?.category === 'cardio' ? 'ml/kg/min' : 'pts'
                        }
                        categoryLabel={category?.label || 'Geral'}
                        dataHistory={historyForType}
                    />
                );
            })()}
        </div>
    );
};

export default LatestAssessmentView;
