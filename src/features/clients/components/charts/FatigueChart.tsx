import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { getInternalLoadZone } from '@/shared/utils/analytics';

interface FatigueChartProps {
    data: any[];
}

export const FatigueChart: React.FC<FatigueChartProps> = ({
    data
}) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} syncId="rirMetrics" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        label={{ value: 'Carga Interna (UA)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                        tick={{ fontSize: 10 }}
                        width={35}
                    />
                    <RechartsTooltip
                        cursor={{ fill: '#334155', opacity: 0.2 }}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const zone = getInternalLoadZone(data.internalLoad);
                                return (
                                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl">
                                        <p className="text-sm font-bold text-white mb-2 pb-2 border-b border-slate-800">{label}</p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Total de Séries:</span>
                                                <span className="text-white font-mono">{data.totalSets}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">RIR Médio Informado:</span>
                                                <span className="text-white font-mono">{data.avgRir}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-slate-800">
                                                <span className="text-slate-300 font-bold">Carga Calculada:</span>
                                                <span className="font-mono font-bold" style={{ color: zone.color }}>{data.internalLoad} UA</span>
                                            </div>
                                            <div className="text-[10px] uppercase font-bold tracking-wider text-right mt-1" style={{ color: zone.color }}>
                                                {zone.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <ReferenceLine y={80} stroke="#22d3ee" strokeDasharray="3 3" label={{ value: 'Recuperativa', fill: '#22d3ee', fontSize: 10, position: 'insideTopLeft' }} />
                    <ReferenceLine y={150} stroke="#6366f1" strokeDasharray="3 3" label={{ value: 'Alvo', fill: '#6366f1', fontSize: 10, position: 'insideTopLeft' }} />
                    <ReferenceLine y={220} stroke="#a855f7" strokeDasharray="3 3" label={{ value: 'Alta', fill: '#a855f7', fontSize: 10, position: 'insideTopLeft' }} />

                    <Bar dataKey="internalLoad" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={getInternalLoadZone(entry.internalLoad).fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
