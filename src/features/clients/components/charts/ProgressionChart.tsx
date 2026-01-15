import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { CHART_COLORS } from '@/features/clients/constants';

interface ProgressionChartProps {
    data: any[];
    selectedExercises: string[];
}

export const ProgressionChart: React.FC<ProgressionChartProps> = ({
    data,
    selectedExercises
}) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    return (
        <>
            <div className="h-64 w-full touch-none select-none">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
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
                            stroke="#94a3b8"
                            fontSize={10}
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 10 }}
                            width={35}
                        />
                        <RechartsTooltip
                            active={activeIndex !== null}
                            cursor={{ stroke: '#334155', strokeWidth: 1 }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl min-w-[180px] z-50 pointer-events-none">
                                            <p className="text-[11px] font-bold text-white mb-1.5 pb-1.5 border-b border-slate-800 leading-none">{label}</p>
                                            <div className="space-y-1">
                                                {payload.map((entry: any) => (
                                                    <div key={entry.name} className="flex items-center justify-between gap-3 text-[10px] leading-tight">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.stroke }}></div>
                                                            <span className="text-slate-300 truncate max-w-[120px]">{entry.name}</span>
                                                        </div>
                                                        <span className="font-mono font-bold text-white whitespace-nowrap">
                                                            {entry.value}kg <span className="text-slate-500 font-normal">({entry.payload[`${entry.name}_reps`] || 0}r)</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {selectedExercises.map((ex, i) => (
                            <Line
                                key={ex}
                                type="monotone"
                                dataKey={ex}
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                strokeWidth={3}
                                dot={{ r: 3 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                {selectedExercises.map((ex, i) => (
                    <div key={ex} className="flex items-center gap-1.5 min-w-max">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                        <span className="text-[10px] text-slate-300 font-medium leading-none">{ex}</span>
                    </div>
                ))}
            </div>
        </>
    );
};
