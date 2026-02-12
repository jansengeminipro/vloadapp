import React from 'react';
import { Info } from 'lucide-react';

export const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1.5 cursor-help">
        <Info size={12} className="text-surface-500 hover:text-surface-300 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-surface-900 border border-white/10 rounded-lg shadow-2xl z-[100] text-[10px] text-surface-300 font-normal normal-case leading-relaxed pointer-events-none text-center">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface-900" />
        </div>
    </div>
);
