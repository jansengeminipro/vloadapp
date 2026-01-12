import { useEffect } from 'react';
import { MuscleGroup } from '@/shared/types';
import { EXERCISE_DB } from '@/shared/data/exercises';

export const useDataSeeder = (user: any, role: string | null) => {
    useEffect(() => {
        const STORAGE_KEY = 'vl_sessions';
        // Only seed if we are a trainer using the local demo version
        if (user && role === 'trainer') {
            const hasData = localStorage.getItem(STORAGE_KEY);
            const data = hasData ? JSON.parse(hasData) : [];
            const needsSeed = !hasData || (data.length > 0 && data.length < 50);

            if (needsSeed) {
                console.log('Seeding detailed mock data for 1 year using EXERCISE_DB...');
                const clientIds = ['1', '2'];
                const generatedSessions: any[] = [];
                const today = new Date();
                const TOTAL_SESSIONS = 156;

                const getExercisesByGroup = (group: MuscleGroup) => EXERCISE_DB.filter(e => e.muscleGroup === group);
                const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

                clientIds.forEach(clientId => {
                    for (let i = 0; i < TOTAL_SESSIONS; i++) {
                        const isUpperBody = i % 2 === 0;
                        const date = new Date(today);
                        date.setDate(date.getDate() - Math.floor(i * 2.33));
                        const timeProgressFactor = 1 - (i / TOTAL_SESSIONS);
                        const strengthFactor = 0.7 + (0.3 * timeProgressFactor);
                        const dailyVariance = 0.95 + Math.random() * 0.1;
                        const currentMultiplier = strengthFactor * dailyVariance;
                        let selectedExercises: any[] = [];

                        if (isUpperBody) {
                            selectedExercises.push({ ...getRandom(getExercisesByGroup(MuscleGroup.Chest)), sets: 4 });
                            selectedExercises.push({ ...getRandom(getExercisesByGroup(MuscleGroup.Back)), sets: 4 });
                            selectedExercises.push({ ...getRandom(getExercisesByGroup(MuscleGroup.Shoulders)), sets: 3 });
                            const armMuscle = Math.random() > 0.5 ? MuscleGroup.Triceps : MuscleGroup.Biceps;
                            selectedExercises.push({ ...getRandom(getExercisesByGroup(armMuscle)), sets: 3 });
                        } else {
                            selectedExercises.push({ ...getRandom(getExercisesByGroup(MuscleGroup.Quads)), sets: 4 });
                            const postChain = Math.random() > 0.6 ? MuscleGroup.Hamstrings : MuscleGroup.Glutes;
                            selectedExercises.push({ ...getRandom(getExercisesByGroup(postChain)), sets: 3 });
                            const accessory = Math.random() > 0.5 ? MuscleGroup.Calves : MuscleGroup.Abs;
                            selectedExercises.push({ ...getRandom(getExercisesByGroup(accessory)), sets: 3 });
                        }

                        const processedDetails = selectedExercises.map(ex => {
                            const setDetails = [];
                            let exerciseVolumeLoad = 0;
                            let baseWeight = 20;
                            if (ex.equipment.includes('Barra') || ex.equipment.includes('Máquina')) baseWeight = 60;
                            if (ex.equipment.includes('Halter')) baseWeight = 18;
                            if (ex.muscleGroup === MuscleGroup.Shoulders || ex.muscleGroup === MuscleGroup.Biceps || ex.muscleGroup === MuscleGroup.Triceps) baseWeight = 12;
                            if (ex.muscleGroup === MuscleGroup.Quads || ex.muscleGroup === MuscleGroup.Back) baseWeight += 20;

                            for (let s = 0; s < ex.sets; s++) {
                                const weight = Math.floor(baseWeight * currentMultiplier);
                                const reps = Math.floor(8 + Math.random() * 4);
                                const rir = Math.floor(Math.random() * 3);
                                setDetails.push({ weight, reps, rir });
                                exerciseVolumeLoad += (weight * reps);
                            }
                            return {
                                name: ex.name,
                                muscleGroup: ex.muscleGroup,
                                sets: ex.sets,
                                volumeLoad: exerciseVolumeLoad,
                                setDetails: setDetails
                            };
                        });

                        const totalSets = processedDetails.reduce((acc, curr) => acc + curr.sets, 0);
                        const volumeLoad = processedDetails.reduce((acc, curr) => acc + curr.volumeLoad, 0);

                        generatedSessions.push({
                            id: `seed-${clientId}-${i}`,
                            clientId,
                            templateId: isUpperBody ? 't1' : 't2',
                            templateName: isUpperBody ? 'Hipertrofia Superior (Aleatório)' : 'Inferior Completo (Aleatório)',
                            date: date.toISOString(),
                            durationSeconds: 3600 + Math.random() * 600,
                            totalSets,
                            volumeLoad,
                            details: processedDetails
                        });
                    }
                });

                localStorage.setItem(STORAGE_KEY, JSON.stringify(generatedSessions));
                window.location.reload();
            }
        }
    }, [user, role]);
};
