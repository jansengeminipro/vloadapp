import React, { useState } from 'react';
import { Search, Filter, Dumbbell, Activity, X } from 'lucide-react';
import { Exercise, MuscleGroup, Equipment } from '@/shared/types';
import { EXERCISE_DB } from '@/shared/data/exercises';
import { FilterSelect } from '@/shared/components/ui/FilterSelect';
import { EXERCISE_DB } from '@/shared/data/exercises';
import { FilterSelect } from '@/shared/components/ui/FilterSelect';

const Exercises: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');

  const filteredExercises = EXERCISE_DB.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMuscle('All');
    setSelectedEquipment('All');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Banco de Exercícios</h1>
          <p className="text-slate-400">Biblioteca completa de movimentos para prescrição.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Adicionar Novo
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar exercício por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 items-center">
          <div className="w-full md:w-48">
            <FilterSelect
              label="Todos Músculos"
              value={selectedMuscle}
              options={Object.values(MuscleGroup)}
              onChange={setSelectedMuscle}
              icon={<div className="w-2 h-2 rounded-full bg-primary-500" />}
            />
          </div>
          <div className="w-full md:w-48">
            <FilterSelect
              label="Todos Equipamentos"
              value={selectedEquipment}
              options={Object.values(Equipment)}
              onChange={setSelectedEquipment}
              icon={<div className="w-2 h-2 rounded-full bg-indigo-500" />}
            />
          </div>

          {(selectedMuscle !== 'All' || selectedEquipment !== 'All' || searchTerm !== '') && (
            <button
              onClick={handleClearFilters}
              className="h-10 px-3 bg-slate-800 border border-slate-700 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 text-slate-400 rounded-xl flex items-center justify-center transition-all"
              title="Limpar Filtros"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 hover:bg-slate-800/80 transition-all group cursor-pointer shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-slate-700/50 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-primary-600 transition-colors">
                <Dumbbell size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-700">
                {exercise.muscleGroup}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary-400 transition-colors">{exercise.name}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Activity size={14} />
              {exercise.equipment}
            </p>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed mt-4">
          <Dumbbell size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhum exercício encontrado</p>
          <p className="text-sm">Tente ajustar sua busca ou filtros.</p>
        </div>
      )}
    </div>
  );
};

export default Exercises;