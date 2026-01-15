import React, { useState } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { Info, HelpCircle } from 'lucide-react';

interface PerformanceRadarProps {
    data: { subject: string; A: number; fullMark: number }[];
}

export const PerformanceRadarChart: React.FC<PerformanceRadarProps> = ({ data }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative h-full flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        Performance Radar
                    </h4>
                    <p className="text-[10px] text-slate-400">Análise holística da semana</p>
                </div>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-slate-500 hover:text-primary-400 transition-colors"
                >
                    <HelpCircle size={16} />
                </button>
            </div>

            <div className="flex-1 w-full min-h-[220px] relative">
                {showInfo && (
                    <div className="absolute inset-0 z-10 bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 flex flex-col justify-center animate-in fade-in zoom-in-95">
                        <h5 className="font-bold text-white mb-3 text-xs uppercase">Como ler este gráfico?</h5>
                        <ul className="space-y-2 text-[10px] text-slate-300">
                            <li><strong className="text-primary-400">Consistência:</strong> % de treinos realizados.</li>
                            <li><strong className="text-primary-400">Simetria:</strong> Equilíbrio entre Superior/Inferior.</li>
                            <li><strong className="text-primary-400">Evolução:</strong> % de exercícios com progresso de carga (e1RM).</li>
                            <li><strong className="text-primary-400">Intensidade:</strong> Qualidade do esforço (Zona RPE 8-9.5).</li>
                        </ul>
                        <button
                            onClick={() => setShowInfo(false)}
                            className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded"
                        >
                            Entendi
                        </button>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <Radar
                            name="Performance Atual"
                            dataKey="A"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="#6366f1"
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl">
                                            <p className="text-xs font-bold text-white mb-1">{d.subject}</p>
                                            <p className="text-lg font-mono font-bold text-primary-400">{d.A}<span className="text-xs text-slate-500 font-normal">/100</span></p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Quick Summary Footer */}
            <div className="mt-2 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Status Geral</span>
                </div>
                {/* Calculate Average Score */}
                <span className="text-sm font-bold text-white">
                    {Math.round(data.reduce((a, b) => a + b.A, 0) / 4)} <span className="text-xs text-slate-500 font-normal">pts</span>
                </span>
            </div>
        </div>
    );
};
