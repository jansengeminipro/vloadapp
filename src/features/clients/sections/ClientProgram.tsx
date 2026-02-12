import React, { useState } from 'react';
import { LayoutTemplate, Edit2, Calendar, Target, Dumbbell, ChevronUp, ChevronDown, Play, Search, Trash2, Plus, X, Shuffle, Settings, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Client, WorkoutTemplate } from '@/shared/types';
import { WEEKDAYS } from '../constants';
import { useProgramManager } from '../hooks/useProgramManager';
import ManageProgramModal from '../components/ManageProgramModal';
import { useAuth } from '@/app/providers/AuthProvider';

import { useWeeklyProgram } from '../hooks/program/useWeeklyProgram';

interface ClientProgramProps {
    client: Client;
    setClient: (client: Client) => void;
    allTemplates: WorkoutTemplate[];
}

const ClientProgram: React.FC<ClientProgramProps> = ({ client, setClient, allTemplates }) => {
    const detailsRef = React.useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();

    const {
        showManageModal,
        setShowManageModal,
        programForm,
        setProgramForm,
        isSaving,
        activeProgramWorkouts,
        handleOpenManage,
        toggleDayInSchedule,
        handleSaveProgram,
        handleDeleteProgram
    } = useProgramManager(client, setClient, allTemplates, user, id!);

    const {
        selectedCalendarDay,
        setSelectedCalendarDay,
        expandedWorkoutId,
        setExpandedWorkoutId,
        programStats,
        getWorkoutsForDay
    } = useWeeklyProgram(client, activeProgramWorkouts);

    const [templateSearchTerm, setTemplateSearchTerm] = useState('');

    if (!client.activeProgram) {
        return (
            <>
                <div className="text-center py-12 border border-slate-700 rounded-xl bg-slate-800">
                    <LayoutTemplate className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum programa ativo</h3>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">Atribua um programa de treinamento para começar a monitorar o progresso deste aluno.</p>
                    <button onClick={handleOpenManage} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-500 transition-colors">Criar Programa</button>
                </div>
                {showManageModal && (
                    <ManageProgramModal
                        isOpen={showManageModal}
                        onClose={() => setShowManageModal(false)}
                        programForm={programForm}
                        setProgramForm={setProgramForm}
                        isSaving={isSaving}
                        allTemplates={allTemplates}
                        toggleDayInSchedule={toggleDayInSchedule}
                        handleSaveProgram={handleSaveProgram}
                    />
                )}
            </>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in pb-10">
            {/* Program Blueprint (Strategic Header - Premium Redesign) */}
            <div className="bg-surface-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden group">

                {/* Subtle Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 space-y-8">
                    {/* Header Row: Title & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black text-white tracking-tight font-display">{client.activeProgram.name}</h2>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    Ativo
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-surface-400">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={13} className="text-surface-500" />
                                    {new Date(client.activeProgram.startDate).toLocaleDateString()}
                                    {client.activeProgram.endDate && ` → ${new Date(client.activeProgram.endDate).toLocaleDateString()}`}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={handleOpenManage}
                                className="flex-1 md:flex-none px-4 py-2 bg-surface-800/80 hover:bg-surface-700 text-surface-200 rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 group/edit"
                            >
                                <Settings size={14} className="group-hover/edit:rotate-45 transition-transform duration-300" />
                                Gerenciar Estrutura
                            </button>
                            <button
                                onClick={handleDeleteProgram}
                                disabled={isSaving}
                                className="p-2 text-surface-500 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg"
                                title="Excluir Programa"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Row (Divider + Grid) */}
                    {programStats && (
                        <div className="pt-6 border-t border-white/5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Frequência</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-white">{programStats.uniqueDays}x</span>
                                        <span className="text-xs font-medium text-surface-500">/semana</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Volume Semanal</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-white">{programStats.totalWeeklySets}</span>
                                        <span className="text-xs font-medium text-surface-500">séries</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Divisão</span>
                                    <span className="text-xl font-bold text-white truncate">{programStats.divisionType}</span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Status Microciclo</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-lg font-bold text-emerald-400">{programStats.microCycleStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Tactical Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-tight">
                        <LayoutTemplate size={18} className="text-primary-500" />
                        Visão Tática Semanal
                    </h3>
                </div>

                <div className="flex flex-nowrap md:grid md:grid-cols-7 gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
                    {WEEKDAYS.map((day) => {
                        const workoutsForDay = getWorkoutsForDay(day.val);
                        const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
                        const isToday = todayIndex === day.val;
                        const isPast = day.val < todayIndex;
                        const isSelected = selectedCalendarDay === day.val;

                        return (
                            <div
                                key={day.val}
                                onClick={() => {
                                    setSelectedCalendarDay(day.val);
                                    if (window.innerWidth < 1024) {
                                        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }}
                                className={`
                                    relative flex-shrink-0 md:flex-shrink w-14 md:w-auto h-20 md:h-auto rounded-2xl md:rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center md:items-stretch
                                    ${isToday
                                        ? 'bg-gradient-to-br from-primary-900/40 to-surface-900 border-primary-500/50 shadow-lg shadow-primary-900/10 ring-1 ring-primary-500/30'
                                        : isSelected
                                            ? 'bg-surface-800 border-surface-500'
                                            : 'bg-surface-900/30 border-white/5 hover:border-white/10 hover:bg-surface-800/30'
                                    }
                                    ${isPast && !isToday ? 'opacity-50' : ''}
                                    md:min-h-[180px]
                                `}
                            >
                                {/* Header (Mobile Capsule / Desktop Box) */}
                                <div className={`w-full p-2 md:p-3 flex md:justify-between flex-col md:flex-row items-center md:items-start ${isToday ? 'bg-primary-500/10' : 'bg-surface-950/30'}`}>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-primary-400' : 'text-surface-500'}`}>
                                        {day.label.charAt(0)}<span className="hidden md:inline">{day.label.substring(1)}</span>
                                    </span>
                                    <div className="flex items-center gap-1 mt-1 md:mt-0">
                                        {workoutsForDay.length > 0 && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-surface-600'}`}></div>
                                        )}
                                    </div>
                                </div>

                                {/* Content (Only Desktop) */}
                                <div className="hidden md:flex p-2 flex-1 flex-col gap-1.5">
                                    {workoutsForDay.length > 0 ? (
                                        workoutsForDay.map((w, i) => (
                                            <div key={i} className={`
                                                rounded p-1.5 text-[10px] font-semibold border leading-tight break-words
                                                ${isToday
                                                    ? 'bg-primary-500/20 text-white border-primary-500/20'
                                                    : 'bg-surface-800 text-surface-300 border-surface-700'}
                                            `}>
                                                {w.name}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center py-4">
                                            <span className="text-[10px] text-surface-700 font-medium uppercase tracking-widest">- Off -</span>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Selection Indicator */}
                                {isSelected && (
                                    <div className="md:hidden absolute bottom-2 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="space-y-6" ref={detailsRef}>
                <div className="min-h-[220px] bg-surface-900/40 border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
                    {/* Status Strip */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-transparent"></div>

                    <div className="mb-8">
                        <div>
                            <h4 className="text-white font-black text-2xl flex items-center gap-3 font-display">
                                {WEEKDAYS.find(d => d.val === selectedCalendarDay)?.label}
                                <span className="text-xs font-medium text-surface-400 bg-surface-800 px-3 py-1 rounded-full border border-white/5">
                                    {(new Date().getDay() + 6) % 7 === selectedCalendarDay ? 'Foco de Hoje' : 'Planejamento'}
                                </span>
                            </h4>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {getWorkoutsForDay(selectedCalendarDay).map(w => {
                            const isExpanded = expandedWorkoutId === w.id;
                            return (
                                <div key={`cal-${w.id}`} className="space-y-4">
                                    {/* Workout Header Card */}
                                    <div className="bg-surface-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-7 shadow-2xl relative group overflow-hidden transition-all duration-500 hover:border-primary-500/30">
                                        {/* Background Decoration */}
                                        <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none rotate-12">
                                            <Dumbbell size={180} className="text-white" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            {w.focus}
                                                        </span>
                                                        <div className="h-1 w-1 rounded-full bg-surface-700"></div>
                                                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">
                                                            {w.exercises.length} Exercícios
                                                        </span>
                                                    </div>
                                                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none font-display">{w.name}</h3>
                                                </div>

                                                <button
                                                    onClick={() => setExpandedWorkoutId(prev => prev === w.id ? null : w.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-surface-800/50 hover:bg-surface-800 border border-white/5 hover:border-white/10 rounded-xl text-surface-400 hover:text-white text-xs font-semibold transition-all group/btn"
                                                >
                                                    {isExpanded ? 'Resumo Oculto' : 'Ver Detalhes'}
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} className="group-hover/btn:translate-y-0.5 transition-transform" />}
                                                </button>
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="bg-surface-900/40 rounded-2xl border border-white/5 p-4 mb-6 animate-in slide-in-from-top-2">
                                                    <div className="space-y-2">
                                                        {w.exercises.map((ex, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 text-sm text-surface-300 p-2 hover:bg-surface-800/50 rounded-lg transition-colors border-b border-dashed border-white/5 last:border-0">
                                                                <div className="w-6 h-6 rounded-full bg-surface-800 border border-white/5 flex items-center justify-center text-[10px] font-bold text-surface-500">
                                                                    {idx + 1}
                                                                </div>
                                                                <span className="font-medium flex-1">{ex.name}</span>
                                                                <div className="flex gap-2">
                                                                    <span className="text-xs font-mono font-bold bg-surface-950 px-2 py-1 rounded text-surface-400">{ex.sets} séries</span>
                                                                    <span className="text-xs font-mono font-bold bg-surface-950 px-2 py-1 rounded text-surface-400">{ex.targetReps} reps</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tactical Actions Grid */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                {/* Primary Action: Execute */}
                                                <Link
                                                    to={`/session/new?clientId=${client.id}&templateId=${w.id}`}
                                                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 px-4 rounded-xl flex items-center justify-between group/main transition-all shadow-lg shadow-emerald-900/20 border border-emerald-400/20 active:scale-[0.99]"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md transition-transform group-hover/main:scale-110">
                                                            <Play size={16} className="fill-current" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest mb-0.5 leading-none">Estratégia</span>
                                                            <span className="text-sm font-black tracking-wide leading-none">INICIAR TREINO</span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={18} className="text-emerald-200 opacity-60 group-hover/main:translate-x-1 group-hover/main:opacity-100 transition-all" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {getWorkoutsForDay(selectedCalendarDay).length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-center bg-surface-950/30 rounded-2xl border border-dashed border-surface-800 group hover:border-surface-700 transition-colors">
                                <div className="w-16 h-16 bg-surface-900 rounded-full flex items-center justify-center mb-4 text-surface-600 group-hover:text-surface-400 group-hover:scale-110 transition-all">
                                    <Calendar size={32} />
                                </div>
                                <h5 className="text-white font-bold text-lg mb-1 font-display">Dia Livre</h5>
                                <p className="text-surface-500 text-sm max-w-xs mx-auto mb-6">
                                    Não há treinos planejados para hoje nesta divisão. O aluno deve descansar ou realizar cardio.
                                </p>

                                <h6 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-4">Ações Táticas</h6>
                                <div className="flex gap-3">
                                    <Link to={`/session/new?clientId=${client.id}`} className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-lg text-sm font-bold border border-white/5 transition-colors flex items-center gap-2">
                                        <Plus size={16} /> Adicionar Treino Extra
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Integrated Library Section */}
                    <div className="pt-4">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-surface-800 to-transparent"></div>
                            <h4 className="text-surface-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <Dumbbell size={14} /> Realizar outro treino?
                            </h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-surface-800 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {activeProgramWorkouts.map(w => {
                                const isScheduledToday = getWorkoutsForDay(selectedCalendarDay).some(todayW => todayW.id === w.id);
                                if (isScheduledToday) return null; // Don't show scheduled ones again

                                return (
                                    <Link
                                        key={`other-${w.id}`}
                                        to={`/session/new?clientId=${client.id}&templateId=${w.id}`}
                                        className="group p-3 bg-surface-900/40 border border-white/5 hover:border-primary-500/30 rounded-xl flex flex-col justify-between transition-all hover:bg-surface-900/60"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="px-2 py-0.5 bg-surface-800/80 text-surface-500 rounded text-[9px] font-bold uppercase tracking-tighter">
                                                    {w.focus}
                                                </div>
                                                <div className="text-surface-700 group-hover:text-primary-500/50 transition-colors">
                                                    <Play size={12} />
                                                </div>
                                            </div>
                                            <h5 className="font-bold text-surface-300 text-xs group-hover:text-white transition-colors line-clamp-1">{w.name}</h5>
                                            <p className="text-[9px] text-surface-600 mt-0.5 font-medium">{w.exercises.length} exercícios</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {showManageModal && (
                        <ManageProgramModal
                            isOpen={showManageModal}
                            onClose={() => setShowManageModal(false)}
                            programForm={programForm}
                            setProgramForm={setProgramForm}
                            isSaving={isSaving}
                            allTemplates={allTemplates}
                            toggleDayInSchedule={toggleDayInSchedule}
                            handleSaveProgram={handleSaveProgram}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientProgram;
