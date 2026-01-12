import React from 'react';
import { TrendingUp, ArrowDownRight } from 'lucide-react';

export const TrendIndicator = ({ current, previous, type = 'percent' }: { current: number, previous: number, type?: 'percent' | 'points' }) => {
    if (previous === 0) return null;
    const diff = current - previous;
    if (diff === 0) return <span className="text-[10px] text-slate-500 font-medium ml-2">(=) estável</span>;

    const isPositive = diff > 0;
    const label = type === 'percent'
        ? `${isPositive ? '+' : ''}${((diff / previous) * 100).toFixed(0)}%`
        : `${isPositive ? '+' : ''}${Math.abs(diff)} ${type === 'points' ? (Math.abs(diff) === 1 ? 'pt' : 'pts') : ''}`;

    return (
        <span className={`text-[10px] font-bold ml-2 flex items-center gap-0.5 ${isPositive ? 'text-[#6366f1]' : 'text-slate-500'}`}>
            {isPositive ? <TrendingUp size={10} /> : <ArrowDownRight size={10} />}
            {label}
        </span>
    );
};
