import React from 'react';
import { MuscleGroup } from '@/shared/types';
import DetailedBodySVG from './DetailedBodySVG';

interface BodyHeatmapProps {
    muscleVolumes: Record<string, number>;
}

const BodyHeatmap = React.memo(({ muscleVolumes }: BodyHeatmapProps) => {
    const BASE_COLOR = '#334155'; // Slate 700
    const STROKE_COLOR = '#0f172a'; // Slate 900


    const getColor = React.useCallback((muscle: MuscleGroup) => {
        const vol = muscleVolumes[muscle] || 0;

        if (vol === 0) return BASE_COLOR;

        // Discrete Categories (Electric Indigo Palette):
        if (vol <= 8) return '#22d3ee'; // Cyan (Baixo)
        if (vol <= 16) return '#6366f1'; // Indigo (Médio)
        if (vol <= 24) return '#a855f7'; // Purple (Alto)
        return '#ef4444'; // Red (Intenso)
    }, [muscleVolumes]);

    return (
        <div className="flex flex-col items-center w-full">
            <div className="relative w-full max-w-2xl">
                <DetailedBodySVG
                    getColor={getColor}
                    BASE_COLOR={BASE_COLOR}
                    STROKE_COLOR={STROKE_COLOR}
                    muscleVolumes={muscleVolumes}
                />
            </div>

            <div className="mt-8 w-full max-w-sm px-4">
                {/* Labels Row */}
                <div className="flex w-full text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2.5">
                    <div className="flex-1 text-center leading-tight px-1">Baixo<br />Vol.</div>
                    <div className="flex-1 text-center leading-tight px-1">Médio<br />Vol.</div>
                    <div className="flex-1 text-center leading-tight px-1">Alto<br />Vol.</div>
                    <div className="flex-1 text-center flex items-center justify-center px-1">Intenso</div>
                </div>

                {/* Color Blocks Row */}
                <div className="flex h-1.5 w-full rounded-full overflow-hidden border border-slate-800 shadow-inner">
                    <div className="flex-1 bg-[#22d3ee]" />
                    <div className="flex-1 bg-[#6366f1]" />
                    <div className="flex-1 bg-[#a855f7]" />
                    <div className="flex-1 bg-[#ef4444]" />
                </div>

                {/* Values Row */}
                <div className="flex w-full text-[9px] text-slate-600 font-medium mt-2">
                    <div className="flex-1 text-center">1-8s</div>
                    <div className="flex-1 text-center">9-16s</div>
                    <div className="flex-1 text-center">17-24s</div>
                    <div className="flex-1 text-center">25s+</div>
                </div>
            </div>
        </div>
    );
});

export default BodyHeatmap;
