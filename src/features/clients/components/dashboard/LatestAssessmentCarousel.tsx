import React, { useRef, useState } from 'react';
import { Assessment } from '@/features/assessments/domain/models';
import {
    Activity, Scale, Ruler, ChevronLeft, ChevronRight,
    Dumbbell, PersonStanding, HeartPulse
} from 'lucide-react';

interface LatestAssessmentCarouselProps {
    assessment?: Assessment;
}

export const LatestAssessmentCarousel: React.FC<LatestAssessmentCarouselProps> = ({ assessment }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    if (!assessment || !assessment.data) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="bg-slate-700/50 p-3 rounded-full mb-3">
                    <Activity size={24} className="text-slate-400" />
                </div>
                <h4 className="text-white font-bold mb-1">Nenhuma avaliação encontrada</h4>
                <p className="text-xs text-slate-400 max-w-[200px]">Realize uma avaliação física para visualizar os dados detalhados aqui.</p>
            </div>
        );
    }

    const { data } = assessment;
    const result = data._result || {};
    const metrics = result.metrics || {};

    // Helper to safe get numbers
    const getVal = (key: string, root = false): number | null => {
        if (root) return parseFloat(data[key]) || null;
        return parseFloat(data[key]) || parseFloat(metrics[key]) || null;
    };

    // --- SLIDE DATA PREPARATION ---
    const slides = [];

    // 1. Composition (General)
    const weight = data.weight_kg || data.weight;
    const bodyFat = result.score || metrics.body_fat;
    const muscleMass = metrics.muscle_mass_faulkner || metrics.muscle_mass; // Try common keys

    if (weight) {
        slides.push({
            id: 'composition',
            title: 'Composição Corporal',
            icon: Scale,
            color: '#3b82f6', // blue-500
            items: [
                { label: 'Peso Atual', value: `${weight} kg`, highlight: true },
                { label: 'Gordura Corporal', value: bodyFat ? `${Number(bodyFat).toFixed(1)}%` : '-', limit: bodyFat > 25 ? 'alert' : 'normal' },
                { label: 'Massa Magra', value: muscleMass ? `${Number(muscleMass).toFixed(1)} kg` : '-' }
            ]
        });
    }

    // 2. Trunk Circumferences
    const waist = getVal('waist') || getVal('abdomen');
    const hip = getVal('hip') || getVal('hips');
    const abdomen = getVal('abdomen');
    const rcq = waist && hip ? (waist / hip).toFixed(2) : null;

    if (waist || hip || abdomen) {
        slides.push({
            id: 'trunk',
            title: 'Medidas do Tronco',
            icon: PersonStanding,
            color: '#f59e0b', // amber-500
            items: [
                { label: 'Cintura', value: waist ? `${waist} cm` : '-' },
                { label: 'Abdômen', value: abdomen ? `${abdomen} cm` : '-' },
                { label: 'Quadril', value: hip ? `${hip} cm` : '-' },
                { label: 'RCQ (Risco)', value: rcq || '-', detail: 'Relação Cintura-Quadril' }
            ]
        });
    }

    // 3. Limbs (Symmetry)
    const armR = getVal('arm_right_relaxed') || getVal('arm_right');
    const armL = getVal('arm_left_relaxed') || getVal('arm_left');
    const thighR = getVal('thigh_right');
    const thighL = getVal('thigh_left');
    const calfR = getVal('calf_right');
    const calfL = getVal('calf_left');

    const hasLimbs = armR || armL || thighR || thighL || calfR || calfL;

    if (hasLimbs) {
        slides.push({
            id: 'limbs',
            title: 'Simetria de Membros',
            icon: Ruler,
            color: '#10b981', // emerald-500
            cols: 2, // Grid layout
            items: [
                { label: 'Braço Dir.', value: armR ? `${armR} cm` : '-' },
                { label: 'Braço Esq.', value: armL ? `${armL} cm` : '-' },
                { label: 'Coxa Dir.', value: thighR ? `${thighR} cm` : '-' },
                { label: 'Coxa Esq.', value: thighL ? `${thighL} cm` : '-' },
                { label: 'Pantur. Dir.', value: calfR ? `${calfR} cm` : '-' },
                { label: 'Pantur. Esq.', value: calfL ? `${calfL} cm` : '-' },
            ]
        });
    }

    // 4. Health Indices (BMI, etc)
    const bmi = result.bmi || metrics.bmi;
    const bmr = result.bmr || metrics.bmr; // Basal Metabolic Rate

    if (bmi || bmr) {
        slides.push({
            id: 'health',
            title: 'Índices de Saúde',
            icon: HeartPulse,
            color: '#ef4444', // red-500
            items: [
                { label: 'IMC', value: bmi ? Number(bmi).toFixed(1) : '-', highlight: true },
                { label: 'Taxa Metabólica Basal', value: bmr ? `${Math.round(bmr)} kcal` : '-' },
                { label: 'Protocolo Usado', value: assessment.type ? assessment.type.toUpperCase() : 'N/A' }
            ]
        });
    }

    // Handlers
    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const width = scrollContainerRef.current.offsetWidth;
        const newPos = direction === 'left'
            ? scrollContainerRef.current.scrollLeft - width
            : scrollContainerRef.current.scrollLeft + width;

        scrollContainerRef.current.scrollTo({
            left: newPos,
            behavior: 'smooth'
        });
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const width = scrollContainerRef.current.offsetWidth;
        const index = Math.round(scrollContainerRef.current.scrollLeft / width);
        setActiveSlide(index);
    };

    if (slides.length === 0) return null;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-0 shadow-sm relative overflow-hidden flex flex-col h-full min-h-[220px]">
            {/* Carousel Header */}
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <Dumbbell size={16} className="text-primary-500" />
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase leading-none">Última Avaliação</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(assessment.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-1">
                    <button
                        onClick={() => scroll('left')}
                        disabled={activeSlide === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={activeSlide === slides.length - 1}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Scrollable Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-x-auto snap-x snap-mandatory flex custom-scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className="min-w-full snap-center p-5 flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700" style={{ color: slide.color }}>
                                <slide.icon size={18} />
                            </div>
                            <h5 className="font-bold text-slate-200 text-sm">{slide.title}</h5>
                        </div>

                        <div className={`grid ${slide.cols === 2 ? 'grid-cols-2 gap-x-4 gap-y-3' : 'grid-cols-1 gap-3'}`}>
                            {slide.items.map((item, idx) => (
                                <div key={idx} className={`${slide.cols === 2 ? 'bg-slate-900/40 p-2 rounded-lg border border-slate-800/50' : 'flex justify-between items-end border-b border-slate-700/50 pb-2 last:border-0'}`}>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                            {item.label}
                                        </span>
                                        {item.detail && <span className="text-[9px] text-slate-600">{item.detail}</span>}
                                    </div>
                                    <div className={`font-mono font-bold ${item.highlight ? 'text-lg text-white' : 'text-sm text-slate-300'}`}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'bg-primary-500 w-3' : 'bg-slate-600'}`}
                    />
                ))}
            </div>
        </div>
    );
};
