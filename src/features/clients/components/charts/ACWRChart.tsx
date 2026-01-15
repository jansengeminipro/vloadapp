import React from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceArea, Cell
} from 'recharts';
import { getACWRStatus } from '@/shared/utils/analytics';
import { Calendar, AlertCircle } from 'lucide-react';

interface ACWRChartProps {
    data: any[];
}

export const ACWRChart: React.FC<ACWRChartProps> = ({
    data
}) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    return (
        <div className="h-80 w-full select-none">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    onMouseMove={(state: any) => {
                        if (state && state.activeTooltipIndex !== undefined) {
                            setActiveIndex(state.activeTooltipIndex);
                        }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                    onTouchStart={(state: any) => {
                        if (state && state.activeTooltipIndex !== undefined) {
                            setActiveIndex(state.activeTooltipIndex);
                        }
                    }}
                    onTouchMove={(state: any) => {
                        if (state && state.activeTooltipIndex !== undefined) {
                            setActiveIndex(state.activeTooltipIndex);
                        }
                    }}
                    onTouchEnd={() => setActiveIndex(null)}
                    onTouchCancel={() => setActiveIndex(null)}
                >
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
                        yAxisId="left"
                        stroke="#94a3b8"
                        fontSize={10}
                        label={{ value: 'Carga Interna (UA)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                        tick={{ fontSize: 10 }}
                        width={35}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#94a3b8"
                        fontSize={10}
                        domain={[0, 2.5]}
                        label={{ value: 'Ratio ACWR', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10 }}
                        tick={{ fontSize: 10 }}
                        width={30}
                    />

                    <RechartsTooltip
                        active={activeIndex !== null}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const status = getACWRStatus(data.acwr);

                                return (
                                    <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl min-w-[180px] max-w-[250px] pointer-events-none">
                                        <p className="text-xs font-bold text-white mb-2 pb-2 border-b border-slate-800 flex items-center gap-2">
                                            <Calendar size={12} className="text-slate-400" /> {label}
                                        </p>

                                        <div className="space-y-2 text-[10px]">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Carga Diária (UA)</span>
                                                <span className="font-mono font-bold text-white bg-slate-800 px-1.5 rounded">{data.dailyLoad}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 my-2">
                                                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800">
                                                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Aguda (7d)</span>
                                                    <span className="font-mono text-slate-300">{data.acuteLoad}</span>
                                                </div>
                                                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800">
                                                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Crônica (28d)</span>
                                                    <span className="font-mono text-slate-300">{data.chronicLoad}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-800">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-slate-300 font-medium">Ratio ACWR</span>
                                                    <span className="font-mono font-bold text-sm" style={{ color: status.color }}>{data.acwr}</span>
                                                </div>
                                                <div className="text-right text-[9px] font-bold uppercase tracking-wider" style={{ color: status.color }}>
                                                    {status.label}
                                                </div>
                                            </div>
                                        </div>

                                        {data.avgRir > 4 && (
                                            <div className="mt-2 text-[9px] text-amber-400 font-bold bg-amber-950/30 px-2 py-1.5 rounded border border-amber-900/50 flex items-start gap-2 leading-tight">
                                                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                                <span>RIR Médio {data.avgRir}: Baixa intensidade.</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        }}
                        cursor={{ fill: '#334155', opacity: 0.2 }}
                    />

                    <ReferenceArea yAxisId="right" y1={0.8} y2={1.3} fillOpacity={0.1} style={{ fill: '#6366f1' }} />

                    <Bar yAxisId="left" dataKey="dailyLoad" barSize={8} radius={[2, 2, 0, 0]}>
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.acwr > 1.5 ? '#ef4444' : '#6366f1'} fillOpacity={0.8} />
                        ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="acwr" stroke="#fbbf24" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
