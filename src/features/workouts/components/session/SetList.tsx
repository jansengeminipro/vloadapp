import React from 'react';
import { Trash2, CheckCircle2, Plus } from 'lucide-react';
import { SetDraft } from '../../hooks/useSessionState';

interface SetListProps {
    sets: SetDraft[];
    onUpdateSet: (index: number, field: keyof SetDraft, value: any) => void;
    onToggleComplete: (index: number, onComplete?: () => void) => void;
    onRemoveSet: (index: number) => void;
    onAddSet: () => void;
    onTimerStart?: () => void;
}

export const SetList: React.FC<SetListProps> = ({
    sets,
    onUpdateSet,
    onToggleComplete,
    onRemoveSet,
    onAddSet,
    onTimerStart
}) => {
    return (
        <div className="p-2 space-y-1">
            <div className="grid grid-cols-12 gap-2 px-2 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-center">
                <div className="col-span-1 flex items-center justify-center">Série</div>
                <div className="col-span-4">kg</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2">RIR</div>
                <div className="col-span-2"></div>
            </div>

            {sets.map((set, idx) => (
                <div
                    key={idx}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-all duration-200 ${set.completed ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-slate-950 border border-slate-800'}`}
                >
                    <div className="col-span-1 text-center font-bold text-slate-500 text-sm">{idx + 1}</div>
                    <div className="col-span-4">
                        <input
                            type="number"
                            placeholder="-"
                            value={set.weight}
                            onChange={(e) => onUpdateSet(idx, 'weight', e.target.value)}
                            className={`w-full bg-slate-800 text-center p-3 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none text-lg font-bold ${set.completed ? 'text-emerald-100' : 'text-white'}`}
                        />
                    </div>
                    <div className="col-span-3">
                        <input
                            type="number"
                            placeholder="-"
                            value={set.reps}
                            onChange={(e) => onUpdateSet(idx, 'reps', e.target.value)}
                            className={`w-full bg-slate-800 text-center p-3 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none text-lg font-bold ${set.completed ? 'text-emerald-100' : 'text-white'}`}
                        />
                    </div>
                    <div className="col-span-2">
                        <input
                            type="number"
                            placeholder="-"
                            value={set.rir}
                            onChange={(e) => onUpdateSet(idx, 'rir', e.target.value)}
                            className="w-full bg-slate-800 text-amber-500 text-center p-3 rounded-lg border border-transparent focus:border-amber-500 focus:outline-none text-lg font-bold placeholder-amber-900/50"
                        />
                    </div>
                    <div className="col-span-2 flex justify-center gap-1">
                        <button
                            onClick={() => onRemoveSet(idx)}
                            className="h-10 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            onClick={() => onToggleComplete(idx, onTimerStart)}
                            className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-lg active:scale-95 ${set.completed ? 'bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}
                        >
                            <CheckCircle2 size={22} fill={set.completed ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={onAddSet}
                className="w-full py-4 text-sm font-medium text-slate-400 hover:text-primary-400 hover:bg-slate-800/50 hover:border-primary-500/30 border border-dashed border-slate-800 rounded-lg mt-3 flex items-center justify-center gap-2 transition-all"
            >
                <Plus size={18} /> Adicionar Série
            </button>
        </div>
    );
};
