import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExerciseNavigationProps {
    currentIndex: number;
    totalExercises: number;
    onPrev: () => void;
    onNext: () => void;
}

export const ExerciseNavigation: React.FC<ExerciseNavigationProps> = ({
    currentIndex,
    totalExercises,
    onPrev,
    onNext
}) => {
    return (
        <div className="flex items-center justify-between text-sm text-slate-400">
            <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="disabled:opacity-30 p-2 hover:bg-slate-900 rounded-full"
            >
                <ChevronLeft size={24} />
            </button>
            <span className="font-mono">
                Exercício {currentIndex + 1} / {totalExercises}
            </span>
            <button
                onClick={onNext}
                disabled={currentIndex === totalExercises - 1}
                className="disabled:opacity-30 p-2 hover:bg-slate-900 rounded-full"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};
