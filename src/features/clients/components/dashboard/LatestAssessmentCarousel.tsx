import React, { useRef, useState } from 'react';
import { Assessment } from '@/features/assessments/domain/models';
import {
    Activity, Scale, Ruler, ChevronLeft, ChevronRight,
    Dumbbell, PersonStanding, HeartPulse, Timer, Zap
} from 'lucide-react';

interface LatestAssessmentCarouselProps {
    assessmentsByType?: {
        cardio?: Assessment | null;
        strength?: Assessment | null;
        bodyComp?: Assessment | null;
    };
    // Fallback for backward compatibility (though we prefer the new prop)
    assessment?: Assessment;
}

export const LatestAssessmentCarousel: React.FC<LatestAssessmentCarouselProps> = ({
    assessmentsByType,
    assessment: singleAssessment
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    // Combine sources: prefer categorized, fallback to single if bodyComp missing
    const bodyCompAssessment = assessmentsByType?.bodyComp || (singleAssessment?.type && ['pollock3', 'pollock7', 'faulkner', 'guedes', 'bia', 'bmi'].includes(singleAssessment.type) ? singleAssessment : null);
    const cardioAssessment = assessmentsByType?.cardio;
    const strengthAssessment = assessmentsByType?.strength;

    // Helper to format values safely
    const safeVal = (val: any, suffix: string = ''): string => {
        if (val === null || val === undefined) return '-';
        if (typeof val === 'object') return '-'; // Prevent object rendering crash
        if (typeof val === 'number') return `${val.toFixed(1).replace('.0', '')}${suffix}`;
        return `${String(val)}${suffix}`;
    };

    const slides: any[] = [];

    // --- 1. CARDIO SLIDE ---
    if (cardioAssessment && cardioAssessment.data) {
        const { data } = cardioAssessment;
        const result = data._result || {};
        const metrics = result.metrics || {};

        const vo2max = data.vo2max || metrics.vo2max || result.score; // Try various keys
        const distance = data.distance_meters || data.distance;

        // Ensure we display meaningful info
        if (vo2max || distance) {
            slides.push({
                id: 'cardio',
                title: 'Capacidade Cardiorrespiratória',
                date: cardioAssessment.date,
                icon: Activity,
                color: '#ef4444', // red-500
                items: [
                    { label: 'VO2 Máx', value: safeVal(vo2max, ' ml/kg/min'), highlight: true },
                    { label: 'Distância', value: safeVal(distance, ' m') },
                    { label: 'Protocolo', value: cardioAssessment.type ? String(cardioAssessment.type).toUpperCase() : '-' }
                ]
            });
        }
    }

    // --- 2. STRENGTH SLIDE ---
    if (strengthAssessment && strengthAssessment.data) {
        const { data } = strengthAssessment;
        const result = data._result || {};

        // Logic depends on type
        // OneRM: max_load_kg, relative_strength
        // Pushups/Situps: repetitions
        const load = data.max_load_kg || data.load;
        const reps = data.repetitions || data.reps;
        const score = result.score;

        // Determine what to show as main value
        let mainValue = '-';
        if (score !== undefined) mainValue = safeVal(score);
        else if (load) mainValue = safeVal(load, ' kg');
        else if (reps) mainValue = safeVal(reps, ' reps');

        slides.push({
            id: 'strength',
            title: 'Força & Resistência',
            date: strengthAssessment.date,
            icon: Dumbbell,
            color: '#f59e0b', // amber-500
            items: [
                { label: 'Resultado', value: mainValue, highlight: true },
                { label: 'Classificação', value: result.classification ? String(result.classification) : '-' },
                { label: 'Teste', value: strengthAssessment.type ? String(strengthAssessment.type).replace(/_/g, ' ').toUpperCase() : '-' }
            ]
        });
    }

    // --- 3. BODY COMPOSITION SLIDE ---
    if (bodyCompAssessment && bodyCompAssessment.data) {
        const { data } = bodyCompAssessment;
        const result = data._result || {};
        const metrics = result.metrics || {};

        const weight = data.weight_kg || data.weight;
        const bodyFat = result.score || metrics.body_fat;
        const muscleMass = metrics.muscle_mass_faulkner || metrics.muscle_mass;

        if (weight || bodyFat) {
            slides.push({
                id: 'bodycomp',
                title: 'Composição Corporal',
                date: bodyCompAssessment.date,
                icon: Scale,
                color: '#3b82f6', // blue-500
                items: [
                    { label: 'Gordura Corporal', value: safeVal(bodyFat, '%'), highlight: true },
                    { label: 'Peso Atual', value: safeVal(weight, ' kg') },
                    { label: 'Massa Magra', value: safeVal(muscleMass, ' kg') }
                ]
            });
        }
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

    if (slides.length === 0) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center h-full">
                <div className="bg-slate-700/50 p-3 rounded-full mb-3">
                    <Activity size={24} className="text-slate-400" />
                </div>
                <h4 className="text-white font-bold mb-1">Sem Avaliações</h4>
                <p className="text-xs text-slate-400 max-w-[200px]">Realize avaliações físicas para visualizar seus resultados aqui.</p>
            </div>
        );
    }

    const currentSlide = slides[activeSlide] || slides[0];

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-0 shadow-sm relative overflow-hidden flex flex-col h-full min-h-[220px]">
            {/* Carousel Header */}
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-primary-500" />
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase leading-none">Últimos Resultados</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {currentSlide?.date ? new Date(currentSlide.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
                        </span>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-1" style={{ visibility: slides.length > 1 ? 'visible' : 'hidden' }}>
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

                        <div className="grid grid-cols-1 gap-3">
                            {slide.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-end border-b border-slate-700/50 pb-2 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className={`font-mono font-bold ${item.highlight ? 'text-lg text-white' : 'text-sm text-slate-300'}`}>
                                        {item.value || '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'bg-primary-500 w-3' : 'bg-slate-600'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
