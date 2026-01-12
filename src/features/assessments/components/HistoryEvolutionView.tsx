import React, { useState, useMemo } from 'react';
import { Assessment, AnalysisResult } from '../domain/models';
import { AVAILABLE_TESTS } from '../domain/strategies';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';

interface HistoryEvolutionViewProps {
    history: Assessment[];
}

const HistoryEvolutionView: React.FC<HistoryEvolutionViewProps> = ({ history }) => {
    // Determine available test types from history to generate tabs/select
    const availableTypes = useMemo(() => {
        const types = new Set(history.map(h => h.type));
        return Array.from(types).map(typeId => AVAILABLE_TESTS.find(t => t.id === typeId)).filter(Boolean);
    }, [history]);

    const [selectedTypeId, setSelectedTypeId] = useState<string>(availableTypes[0]?.id || '');

    // Prepare data for the chart based on selected type
    const chartData = useMemo(() => {
        if (!selectedTypeId) return [];
        return history
            .filter(h => h.type === selectedTypeId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(h => {
                const result = h.data._result as AnalysisResult;
                return {
                    date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                    fullDate: new Date(h.date).toLocaleDateString(),
                    score: result?.score || 0,
                    classification: result?.classification || '',
                    id: h.id
                };
            });
    }, [history, selectedTypeId]);

    if (history.length === 0) {
        return <div className="text-center py-12 text-slate-500">Nenhum dado para exibir no gráfico.</div>;
    }

    if (availableTypes.length === 0) return null;

    // Set initial selection if empty
    if (!selectedTypeId && availableTypes.length > 0) {
        setSelectedTypeId(availableTypes[0]!.id);
    }

    const currentTestLabel = AVAILABLE_TESTS.find(t => t.id === selectedTypeId)?.label;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-primary-500" size={20} />
                        Evolução por Teste
                    </h3>
                    <p className="text-sm text-slate-500">Acompanhe o progresso ao longo do tempo.</p>
                </div>

                {/* Test Selector */}
                <div className="relative">
                    <select
                        value={selectedTypeId}
                        onChange={(e) => setSelectedTypeId(e.target.value)}
                        className="appearance-none bg-slate-950 border border-slate-700 text-white pl-4 pr-10 py-2 rounded-lg font-medium focus:outline-none focus:border-primary-500 cursor-pointer"
                    >
                        {availableTypes.map(t => (
                            <option key={t!.id} value={t!.id}>{t!.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            {chartData.length < 2 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
                    <Calendar className="mb-2 opacity-50" size={32} />
                    <p>Dados insuficientes para gráfico.</p>
                    <p className="text-xs">Realize pelo menos 2 avaliações deste tipo.</p>
                </div>
            ) : (
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={12}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                                itemStyle={{ color: '#a78bfa' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                formatter={(value: number) => [value, 'Score']}
                                labelFormatter={(label) => `Data: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="mt-4 flex justify-between items-center text-xs text-slate-500 px-4">
                <span>Primeira Avaliação: {chartData[0]?.date}</span>
                <span>Última Avaliação: {chartData[chartData.length - 1]?.date}</span>
            </div>
        </div>
    );
};

export default HistoryEvolutionView;
