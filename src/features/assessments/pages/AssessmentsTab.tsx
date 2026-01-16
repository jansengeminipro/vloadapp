import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, History, X, LayoutDashboard, LineChart, ChevronDown, ChevronRight } from 'lucide-react';
import LatestAssessmentView from '../components/LatestAssessmentView';
import { useAuth } from '@/app/providers/AuthProvider';
import { Client } from '@/shared/types';
import { AVAILABLE_TESTS, TEST_CATEGORIES } from '../domain/strategies';
import { Assessment, AnalysisResult } from '../domain/models';
import { getClientAssessments, deleteAssessment } from '@/services';

interface AssessmentsTabProps {
    client: Client;
}

// Sub-component for Layered Accordion History
const ExpandableHistory: React.FC<{ history: Assessment[], handleDelete: (id: string) => void }> = ({ history, handleDelete }) => {
    const [expandedCat, setExpandedCat] = useState<string | null>(null);
    const [expandedTest, setExpandedTest] = useState<string | null>(null);

    const toggleCat = (catId: string) => {
        setExpandedCat(prev => prev === catId ? null : catId);
        setExpandedTest(null); // Reset expanded test when changing category for a cleaner UI
    };

    const toggleTest = (testId: string) => {
        setExpandedTest(prev => prev === testId ? null : testId);
    };

    // Grouping
    const categoriesMapped = React.useMemo(() => {
        const categories: Record<string, Record<string, Assessment[]>> = {};
        history.forEach(item => {
            const testInfo = AVAILABLE_TESTS.find(t => t.id === item.type);
            const catId = testInfo?.category || 'other';
            if (!categories[catId]) categories[catId] = {};
            if (!categories[catId][item.type]) categories[catId][item.type] = [];
            categories[catId][item.type].push(item);
        });
        return categories;
    }, [history]);

    const sortedCatIds = TEST_CATEGORIES.filter(c => categoriesMapped[c.id]).map(c => c.id);

    return (
        <div className="space-y-3">
            {sortedCatIds.map(catId => {
                const catLabel = TEST_CATEGORIES.find(c => c.id === catId)?.label;
                const testsInCat = categoriesMapped[catId];
                const isCatExpanded = expandedCat === catId;

                return (
                    <div key={catId} className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in duration-300">
                        {/* Level 1: Category Header */}
                        <button
                            onClick={() => toggleCat(catId)}
                            className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-800/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-950 rounded-lg text-primary-500 border border-slate-800">
                                    {catId === 'cardio' && <Activity size={18} />}
                                    {catId === 'anthropometry' && <History size={18} />}
                                    {catId === 'strength' && <Activity size={18} />}
                                </div>
                                <span className="font-black text-slate-300 uppercase tracking-widest text-xs">{catLabel}</span>
                            </div>
                            {isCatExpanded ? <ChevronDown size={18} className="text-slate-600" /> : <ChevronRight size={18} className="text-slate-600" />}
                        </button>

                        {/* Level 2: Tests in Category */}
                        {isCatExpanded && (
                            <div className="p-2 space-y-2 border-t border-slate-800/50 bg-slate-950/20">
                                {(Object.entries(testsInCat) as [string, Assessment[]][]).map(([typeId, records]) => {
                                    const testInfo = AVAILABLE_TESTS.find(t => t.id === typeId);
                                    const isTestExpanded = expandedTest === typeId;
                                    return (
                                        <div key={typeId} className="rounded-xl border border-slate-800/40 overflow-hidden">
                                            <button
                                                onClick={() => toggleTest(typeId)}
                                                className="w-full flex items-center justify-between p-3 bg-slate-900/20 hover:bg-slate-800/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-400">
                                                        {testInfo?.label || typeId}
                                                    </span>
                                                    <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
                                                        {records.length}
                                                    </span>
                                                </div>
                                                {isTestExpanded ? <ChevronDown size={14} className="text-slate-700" /> : <ChevronRight size={14} className="text-slate-700" />}
                                            </button>

                                            {/* Level 3: Historical Records */}
                                            {isTestExpanded && (
                                                <div className="p-3 space-y-3 bg-slate-950/40 animate-in slide-in-from-top-1 duration-200">
                                                    {[...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => {
                                                        const result = item.data._result as AnalysisResult;
                                                        const date = new Date(item.date);
                                                        return (
                                                            <div key={item.id} className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl relative group overflow-hidden">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                                    className="absolute top-2 right-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                                                                >
                                                                    <X size={14} />
                                                                </button>

                                                                <div className="flex gap-4 items-stretch">
                                                                    {/* Data Column */}
                                                                    <div className="flex flex-col items-center justify-center bg-slate-950/50 border border-slate-800/50 rounded-xl px-2.5 py-2 min-w-[58px]">
                                                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">
                                                                            {date.toLocaleString('default', { month: 'short' }).replace('.', '')}
                                                                        </span>
                                                                        <span className="text-xl font-black text-white leading-none my-1">
                                                                            {date.getDate()}
                                                                        </span>
                                                                        <span className="text-[8px] text-slate-600 font-bold">
                                                                            {date.getFullYear()}
                                                                        </span>
                                                                    </div>

                                                                    {/* Info Column - Vertical Stack */}
                                                                    <div className="flex-1 flex flex-col gap-3">
                                                                        {/* Main Results Stacked */}
                                                                        <div className="flex flex-col">
                                                                            <div className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest mb-0.5 leading-none">Classificação</div>
                                                                            <div className={`text-md font-black leading-tight ${['Excelente', 'Bom', 'Atleta', 'Vitamina', 'Peso Médio', 'Peso Normal'].includes(result.classification) ? 'text-emerald-500' :
                                                                                ['Ruim', 'Muito Fraco', 'Obeso', 'Obesidade', 'Sobrepeso'].includes(result.classification) ? 'text-red-500' : 'text-yellow-500'
                                                                                }`}>
                                                                                {result.classification}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex flex-col">
                                                                            <div className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest mb-0.5 leading-none">Score</div>
                                                                            <div className="text-md font-black text-white leading-tight">
                                                                                {result.score}
                                                                            </div>
                                                                        </div>

                                                                        {/* Specific Metrics - Full width list */}
                                                                        {result?.metrics && Object.keys(result.metrics).length > 0 && (
                                                                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/40">
                                                                                {(Object.entries(result.metrics).slice(0, 3) as [string, any][]).map(([k, v]) => (
                                                                                    <div key={k} className="flex items-center justify-between gap-2">
                                                                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide truncate">{k.replace('_', ' ')}</span>
                                                                                        <span className="text-[11px] text-slate-300 font-semibold text-right">{v}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const AssessmentsTab: React.FC<AssessmentsTabProps> = ({ client }) => {
    const { user } = useAuth();
    const [view, setView] = useState<'overview' | 'history'>('overview');
    const [history, setHistory] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    // Load History
    useEffect(() => {
        loadHistory();
    }, [client.id]);

    const loadHistory = async () => {
        try {
            const data = await getClientAssessments(client.id);
            setHistory(data);
        } catch (error) {
            console.error('Error loading assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir esta avaliação?')) return;
        try {
            await deleteAssessment(id);
            loadHistory();
        } catch (e) {
            alert('Erro ao excluir.');
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    {/* Header Text Removed */}
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
                    <button
                        onClick={() => setView('overview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'overview'
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <LayoutDashboard size={16} /> Visão Geral
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'history'
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <LineChart size={16} /> Detalhes
                    </button>
                </div>

                <Link
                    to={`/assessments?clientId=${client.id}`}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                    <Activity size={18} /> Nova Avaliação
                </Link>
            </div>

            {/* Header Removed as per user request */}

            {loading ? (
                <div className="text-center py-12 text-slate-500">Carregando histórico...</div>
            ) : history.length === 0 ? (
                <div className="text-center py-16 border border-slate-800 rounded-xl bg-slate-900/50">
                    <History className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <h4 className="text-white font-bold mb-1">Nenhuma avaliação registrada</h4>
                    <p className="text-slate-500 text-sm">Realize o primeiro teste deste aluno através do menu principal.</p>
                </div>
            ) : view === 'overview' ? (
                <LatestAssessmentView history={history} />
            ) : (
                <ExpandableHistory
                    history={history}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default AssessmentsTab;
