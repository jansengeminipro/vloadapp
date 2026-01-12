import React from 'react';
import { Info } from 'lucide-react';

export const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1.5 cursor-help">
        <Info size={12} className="text-slate-500 hover:text-slate-300 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[100] text-[10px] text-slate-300 font-normal normal-case leading-relaxed pointer-events-none text-center">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
    </div>
);
