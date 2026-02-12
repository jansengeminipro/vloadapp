import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { WorkoutTemplate } from '@/shared/types';
import { ClientProgramForm } from '../types';
import { WEEKDAYS } from '../constants';

interface ManageProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    programForm: ClientProgramForm;
    setProgramForm: React.Dispatch<React.SetStateAction<ClientProgramForm>>;
    isSaving: boolean;
    allTemplates: WorkoutTemplate[];
    toggleDayInSchedule: (templateId: string, dayIdx: number) => void;
    handleSaveProgram: () => void;
}

const ManageProgramModal: React.FC<ManageProgramModalProps> = ({
    isOpen,
    onClose,
    programForm,
    setProgramForm,
    isSaving,
    allTemplates,
    toggleDayInSchedule,
    handleSaveProgram
}) => {
    const [templateSearchTerm, setTemplateSearchTerm] = useState('');

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white font-display">Gerenciar Programa</h3>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5">Nome do Programa</label>
                        <input
                            type="text"
                            value={programForm.name}
                            onChange={e => setProgramForm({ ...programForm, name: e.target.value })}
                            className="w-full bg-surface-950 border border-white/5 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5">Início</label>
                            <input
                                type="date"
                                value={programForm.startDate}
                                onChange={e => setProgramForm({ ...programForm, startDate: e.target.value })}
                                className="w-full bg-surface-950 border border-white/5 rounded-xl p-3 text-white [color-scheme:dark] focus:border-primary-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5">Término</label>
                            <input
                                type="date"
                                value={programForm.endDate}
                                onChange={e => setProgramForm({ ...programForm, endDate: e.target.value })}
                                className="w-full bg-surface-950 border border-white/5 rounded-xl p-3 text-white [color-scheme:dark] focus:border-primary-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Seleção e Agendamento</label>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar treino..."
                                value={templateSearchTerm}
                                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                                className="w-full bg-surface-950 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-primary-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                            {allTemplates
                                .filter(t => t.name.toLowerCase().includes(templateSearchTerm.toLowerCase()))
                                .map(t => {
                                    const isSelected = programForm.selectedIds.includes(t.id);
                                    return (
                                        <div key={t.id} className={`p-3 rounded-xl border transition-all ${isSelected ? 'border-primary-500/30 bg-primary-500/5' : 'border-surface-800 bg-surface-900/50 hover:bg-surface-800/50'}`}>
                                            <label className="flex items-center gap-3 cursor-pointer w-full mb-3 select-none">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-surface-600 text-primary-600 focus:ring-primary-600 bg-surface-900"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        const current = programForm.selectedIds;
                                                        const updated = current.includes(t.id)
                                                            ? current.filter(id => id !== t.id)
                                                            : [...current, t.id];
                                                        setProgramForm({ ...programForm, selectedIds: updated });
                                                    }}
                                                />
                                                <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-surface-400'}`}>{t.name}</span>
                                            </label>

                                            {isSelected && (
                                                <div className="pl-7 animate-in slide-in-from-top-1">
                                                    <div className="flex gap-1.5 justify-between">
                                                        {WEEKDAYS.map(day => {
                                                            const isDaySelected = programForm.schedule[t.id]?.includes(day.val);
                                                            return (
                                                                <button
                                                                    key={day.val}
                                                                    type="button"
                                                                    onClick={() => toggleDayInSchedule(t.id, day.val)}
                                                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all border ${isDaySelected
                                                                        ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-900/20'
                                                                        : 'bg-surface-900 text-surface-500 border-surface-700 hover:border-surface-500 hover:text-surface-300'
                                                                        }`}
                                                                    title={day.label}
                                                                >
                                                                    {day.label.charAt(0)}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            {allTemplates.length === 0 && (
                                <div className="text-center py-8 text-surface-500 text-sm">Nenhum treino encontrado</div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                        <button onClick={onClose} className="text-surface-400 hover:text-white px-4 py-2 font-medium text-sm transition-colors">Cancelar</button>
                        <button onClick={handleSaveProgram} disabled={isSaving} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-primary-900/20 disabled:opacity-50 text-sm h-10 flex items-center transition-all hover:scale-105 active:scale-95">
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ManageProgramModal;
