import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, Cell } from 'recharts';
import { TrendingUp, ArrowDownRight } from 'lucide-react';
import { CHART_COLORS } from '../../constants';

interface VolumeDistributionChartProps {
    data: any[];
    metric: 'sets' | 'load';
}

export const VolumeDistributionChart = React.memo(({ data, metric }: VolumeDistributionChartProps) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, left: 20, right: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                    <RechartsTooltip
                        cursor={{ fill: '#334155', opacity: 0.2 }}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const current = data.value;
                                const previous = data.prevValue;
                                const diff = current - previous;
                                const percent = previous > 0 ? ((diff / previous) * 100).toFixed(0) : 0;
                                const isPositive = diff > 0;
                                const isNeutral = diff === 0;

                                return (
                                    <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl min-w-[140px] z-50">
                                        <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{label}</p>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500">Atual:</span>
                                                <span className="text-white font-bold">{current} {metric === 'sets' ? 'Séries' : 'kg'}</span>
                                            </div>
                                            {!isNeutral && previous > 0 && (
                                                <div className={`flex items-center justify-between text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    <span>Semana Anterior:</span>
                                                    <span className="flex items-center gap-0.5">
                                                        {isPositive ? <TrendingUp size={10} /> : <ArrowDownRight size={10} />}
                                                        {isPositive ? '+' : ''}{percent}%
                                                    </span>
                                                </div>
                                            )}
                                            {previous === 0 && <p className="text-[9px] text-slate-600 italic">Sem dados anteriores</p>}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
});
