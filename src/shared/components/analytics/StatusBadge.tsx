import React from 'react';
import { CheckCircle, Minus, ArrowDownRight } from 'lucide-react';

export const StatusBadge = ({ current, target }: { current: number, target: number }) => {
    const ratio = target > 0 ? current / target : 1;
    if (ratio >= 1) return <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded font-bold border border-[#6366f1]/20 flex items-center gap-1"><CheckCircle size={10} /> NA META</span>;
    if (ratio >= 0.8) return <span className="text-[10px] bg-[#a855f7]/10 text-[#a855f7] px-2 py-0.5 rounded font-bold border border-[#a855f7]/20 flex items-center gap-1"><Minus size={10} /> QUASE LÁ</span>;
    return <span className="text-[10px] bg-[#22d3ee]/10 text-[#22d3ee] px-2 py-0.5 rounded font-bold border border-[#22d3ee]/20 flex items-center gap-1"><ArrowDownRight size={10} /> ABAIXO</span>;
};
