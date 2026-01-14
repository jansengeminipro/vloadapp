import { useState, useMemo } from 'react';
import { Client, WorkoutTemplate } from '@/shared/types';
import { ClientProgramForm } from '../types';
import { saveClientProgram, deleteClientProgram } from '@/services/programService';

export const useProgramManager = (
    client: Client,
    setClient: (client: Client) => void,
    allTemplates: WorkoutTemplate[],
    user: any,
    clientId: string
) => {
    const [showManageModal, setShowManageModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [programForm, setProgramForm] = useState<ClientProgramForm>({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        selectedIds: [],
        schedule: {}
    });

    const activeProgramWorkouts = useMemo(() => {
        if (!client?.activeProgram) return [];
        const workouts = allTemplates.filter(t => client.activeProgram!.workoutIds.includes(t.id));
        const schedule = client.activeProgram.schedule || {};
        const todayIdx = (new Date().getDay() + 6) % 7;

        return [...workouts].sort((a, b) => {
            const aScheduledToday = (schedule[a.id] || []).includes(todayIdx);
            const bScheduledToday = (schedule[b.id] || []).includes(todayIdx);
            if (aScheduledToday && !bScheduledToday) return -1;
            if (!aScheduledToday && bScheduledToday) return 1;
            return 0;
        });
    }, [client?.activeProgram, allTemplates]);

    const handleOpenManage = () => {
        if (client.activeProgram) {
            setProgramForm({
                name: client.activeProgram.name,
                startDate: client.activeProgram.startDate,
                endDate: client.activeProgram.endDate || '',
                selectedIds: [...(client.activeProgram.workoutIds || [])],
                schedule: { ...(client.activeProgram.schedule || {}) }
            });
        } else {
            setProgramForm({
                name: 'Programa de Treino',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                selectedIds: [],
                schedule: {}
            });
        }
        setShowManageModal(true);
    };

    const toggleDayInSchedule = (templateId: string, dayIdx: number) => {
        setProgramForm(prev => {
            const currentDays = prev.schedule[templateId] || [];
            const newDays = currentDays.includes(dayIdx) ? currentDays.filter(d => d !== dayIdx) : [...currentDays, dayIdx].sort();
            return { ...prev, schedule: { ...prev.schedule, [templateId]: newDays } };
        });
    };

    const handleSaveProgram = async () => {
        if (!programForm.name || !user || !clientId) {
            alert('Por favor, preencha o nome do programa.');
            return;
        }

        const payload = {
            client_id: clientId,
            coach_id: user.id,
            name: programForm.name,
            start_date: programForm.startDate,
            end_date: programForm.endDate || null,
            workout_ids: programForm.selectedIds,
            schedule_json: programForm.schedule,
            is_active: true
        };

        try {
            setIsSaving(true);
            const data = await saveClientProgram(client.activeProgram?.id ? { ...payload, id: client.activeProgram.id } : payload);

            const newProgram = {
                id: data.id,
                name: data.name,
                startDate: data.start_date,
                endDate: data.end_date,
                workoutIds: data.workout_ids || [],
                schedule: data.schedule_json || {}
            };

            setClient({ ...client, activeProgram: newProgram });
            setShowManageModal(false);
            alert('Programa salvo com sucesso!');
        } catch (err: any) {
            console.error('Save program error:', err);
            alert('Erro ao salvar programa: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProgram = async () => {
        if (!client.activeProgram?.id || !user) return;
        if (!window.confirm('Tem certeza que deseja excluir o programa completo deste aluno?')) return;

        try {
            setIsSaving(true);
            await deleteClientProgram(client.activeProgram.id, user.id);

            setClient({ ...client, activeProgram: undefined });
            alert('Programa excluído com sucesso!');
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return {
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
    };
};
