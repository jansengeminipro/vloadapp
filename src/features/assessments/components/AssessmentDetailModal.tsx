
import React from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Assessment, AnalysisResult } from '../domain/models';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssessmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    metricLabel: string;
    metricKey: string; // key path like 'data.weight_kg' or helper accessor
    dataHistory: Assessment[];
    currentValue: number | string;
    unit: string;
    categoryLabel: string;
}

const AssessmentDetailModal: React.FC<AssessmentDetailModalProps> = ({
    isOpen,
    onClose,
    metricLabel,
    metricKey, // e.g., 'metrics.body_fat' or 'score'
    dataHistory,
    currentValue,
    unit,
    categoryLabel
}) => {
    if (!isOpen) return null;

    // Prepare chart data
    const chartData = dataHistory
        .map(ass => {
            const result = ass.data._result as AnalysisResult;
            let val = 0;

            // Try extracting value from result metrics or score
            if (metricKey === 'score') {
                val = result.score || 0;
            } else if (metricKey.startsWith('metrics.')) {
                const key = metricKey.split('.')[1];
                const raw = result.metrics[key];
                val = parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
            }

            return {
                originalDate: new Date(ass.date).getTime(),
                date: new Date(ass.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }),
                fullDate: new Date(ass.date).toLocaleDateString(),
                value: val
            };
        })
        .sort((a, b) => a.originalDate - b.originalDate); // Ensure chronological order (oldest to newest)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold">{categoryLabel}</div>
                        <h3 className="text-lg font-bold text-white">{metricLabel}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <div className="text-sm text-slate-400 mb-1">Valor Atual</div>
                        <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
                            {currentValue} <span className="text-lg text-slate-500 font-medium">{unit}</span>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                            <TrendingUp size={16} className="text-primary-500" />
                            Histórico de Evolução
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-12 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <h4 className="text-sm font-bold text-white mb-2">Sobre esta métrica</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {metricLabel} é um indicador importante para {categoryLabel.toLowerCase()}.
                            Acompanhar sua evolução ajuda a entender a adaptação do corpo ao treinamento e orientar os próximos passos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentDetailModal;
