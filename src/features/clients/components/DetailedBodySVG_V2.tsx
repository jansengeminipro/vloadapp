import React from 'react';
import { MuscleGroup } from '@/shared/types';
import { BaseBodyPaths } from './BaseBodyPaths';
import { BODY_MUSCLE_PATHS } from './bodyMusclePaths';

interface DetailedBodySVGProps {
    getColor: (muscle: MuscleGroup) => string;
    BASE_COLOR?: string;
    STROKE_COLOR?: string;
    muscleVolumes?: Record<string, number>;
}

const DetailedBodySVG_V2 = React.memo(({ getColor, BASE_COLOR = '#e5e7eb', STROKE_COLOR = '#d1d5db', muscleVolumes }: DetailedBodySVGProps) => {
    return (
        <svg
            width="100%"
            height="auto"
            viewBox="0 0 2048 1898"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            className="h-full w-full overflow-visible"
            style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
        >
            <defs />
            <BaseBodyPaths color={BASE_COLOR} />
            {Object.entries(BODY_MUSCLE_PATHS).map(([muscle, paths]) => (
                <g key={muscle} id={muscle}>
                    {(paths as string[]).map((path, index) => (
                        <path 
                            key={index} 
                            d={path} 
                            fill={getColor(muscle as MuscleGroup)} 
                            stroke={STROKE_COLOR} 
                            strokeWidth="1" 
                        />
                    ))}
                </g>
            ))}
        </svg>
    );
});

export default DetailedBodySVG_V2;
