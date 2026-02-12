import React, { useEffect, useState } from 'react';

interface CircularProgressProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    animated?: boolean;
    children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    max,
    size = 80,
    strokeWidth = 8,
    color = '#6366F1',
    trackColor = 'rgba(255,255,255,0.05)',
    animated = true,
    children
}) => {
    const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min((animatedValue / max) * 100, 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setAnimatedValue(value);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [value, animated]);

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={animated ? 'transition-all duration-1000 ease-out' : ''}
                />
            </svg>
            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default CircularProgress;
