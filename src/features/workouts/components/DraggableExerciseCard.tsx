import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Video, Trash2, Activity, ChevronRight } from 'lucide-react';
import { WorkoutExercise } from '@/shared/types';
import useEmblaCarousel from 'embla-carousel-react';
import { flushSync } from 'react-dom';

interface DraggableExerciseCardProps {
    exercise: WorkoutExercise;
    index: number;
    onRemove: (index: number) => void;
    onUpdate?: (index: number, exercise: WorkoutExercise) => void;
    onSwap: (index: number, altIndex: number) => void;
    onOpenDetails: (exercise: WorkoutExercise, index: number) => void;
    getThumbnailUrl?: (url?: string) => string | null;
}

const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const defaultGetThumbnail = (url?: string) => {
    if (!url) return null;
    const id = getYouTubeID(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

const variantsOrderCache = new Map<string, string[]>();

const getGroupKey = (ids: string[]) => {
    return [...ids].sort().join('|');
};

export const DraggableExerciseCard: React.FC<DraggableExerciseCardProps> = ({
    exercise,
    index,
    onRemove,
    onUpdate,
    onSwap,
    onOpenDetails,
    getThumbnailUrl = defaultGetThumbnail
}) => {
    // 1. Maintain stable list of variants (Main + Alternatives) in local state to preserve order
    // This allows us to "Swap In Place" in data, but "Keep Visual Order" in UI.
    // We use a module-level cache to persist this order across remounts (swaps).
    const [variants, setVariants] = useState<any[]>(() => {
        const alts = exercise.alternatives || [];
        const incoming = [
            { ...exercise, isMain: true, originalAltIndex: -1 },
            ...alts.map((a, idx) => ({ ...a, isMain: false, originalAltIndex: idx }))
        ];

        const allIds = incoming.map(v => v.id);
        const groupKey = getGroupKey(allIds);
        const cachedOrder = variantsOrderCache.get(groupKey);

        if (cachedOrder) {
            // Reconstruct based on cache
            const ordered: any[] = [];
            cachedOrder.forEach(id => {
                const found = incoming.find(inc => inc.id === id);
                if (found) ordered.push(found);
            });

            // Append any NEW items not in cache (rare, but robust)
            incoming.forEach(inc => {
                if (!cachedOrder.includes(inc.id)) ordered.push(inc);
            });

            // If we filtered out items (deleted) they are naturally gone.
            return ordered;
        }

        // No cache? Initial load. Cache it.
        variantsOrderCache.set(groupKey, allIds);
        return incoming;
    });

    useEffect(() => {
        const alts = exercise.alternatives || [];
        // Construct incoming data with useful metadata
        const incoming = [
            { ...exercise, isMain: true, originalAltIndex: -1 },
            ...alts.map((a, idx) => ({ ...a, isMain: false, originalAltIndex: idx }))
        ];

        setVariants(prev => {
            if (prev.length === 0) {
                // This case should ideally be handled by the useState initializer for the very first render.
                // If `prev` is empty here, it might indicate a reset or unhandled scenario.
                // For robustness, we'll still process it, but the cache logic below will handle it.
                const newIds = incoming.map(m => m.id);
                const groupKey = getGroupKey(newIds);
                variantsOrderCache.set(groupKey, newIds);
                return incoming;
            }

            // Merge Logic: Preserve order of 'prev', update data from 'incoming'
            const merged: any[] = [];

            // 1. Update existing items in their current positions
            prev.forEach(p => {
                const found = incoming.find(inc => inc.id === p.id);
                if (found) {
                    merged.push(found);
                }
            });

            // 2. Append new items (that weren't in prev)
            incoming.forEach(inc => {
                if (!prev.find(p => p.id === inc.id)) {
                    merged.push(inc);
                }
            });

            // Update Cache with new merged structure
            const newIds = merged.map(m => m.id);
            const groupKey = getGroupKey(newIds); // Re-calc key as IDs might have changed (add/remove)
            // Note: If simply adding, the 'sort' in getGroupKey keeps the key consistent for the SET of exercises.
            // But wait, if we added 'D', the key changes from A|B|C to A|B|C|D.
            // That's fine. We want to cache the order for THIS set.
            variantsOrderCache.set(groupKey, newIds);

            return merged;
        });
    }, [exercise.id, exercise.alternatives]); // Trigger on ID change (swap) or alts change

    // 2. Find the index of the active exercise in our STABLE list
    const activeIndex = useMemo(() => {
        const idx = variants.findIndex(v => v.id === exercise.id);
        return idx !== -1 ? idx : 0;
    }, [variants, exercise.id]);

    // 3. Initialize Embla Carousel
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        startIndex: activeIndex, // Start at correct stable index
        duration: 25
    });

    const [selectedIndex, setSelectedIndex] = useState(activeIndex);

    // 4. Sync External State -> Carousel
    useEffect(() => {
        if (emblaApi) {
            if (emblaApi.selectedScrollSnap() !== activeIndex) {
                emblaApi.scrollTo(activeIndex);
            }
            setSelectedIndex(activeIndex);
        }
    }, [emblaApi, activeIndex]);

    // 5. Handle User Swipe (Carousel -> External State)
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        const newIndex = emblaApi.selectedScrollSnap();
        setSelectedIndex(newIndex);

        const selectedVariant = variants[newIndex];
        if (!selectedVariant) return;

        // If the selected variant is NOT the current main, trigger a swap
        if (selectedVariant.id !== exercise.id) {
            // Logic: selectedVariant is now the Target. 
            // We need its index in the PARENT'S `alternatives` array to call `onSwap`.
            // The `selectedVariant` object in `variants` state comes from `incoming`.
            // So `originalAltIndex` is correct relative to the CURRENT parent prop.
            if (selectedVariant.originalAltIndex !== undefined && selectedVariant.originalAltIndex !== -1) {
                onSwap(index, selectedVariant.originalAltIndex);
            }
        }
    }, [emblaApi, variants, onSwap, index, exercise.id]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const handleRemove = () => {
        const variantsCount = variants.length;
        // Case 1: Only one item left -> Remove the Card completely
        if (variantsCount <= 1) {
            onRemove(index);
            return;
        }

        // Case 2: Removing an Item from a Group
        const selectedVariant = variants[selectedIndex];
        if (!selectedVariant || !onUpdate) {
            // Fallback if no onUpdate prop (should not happen in editor)
            // or weird state.
            onRemove(index);
            return;
        }

        // Are we removing the CURRENT MAIN exercise?
        if (selectedVariant.isMain) {
            // We need to promote another alternative to be the Main.
            // Let's pick the first available alternative.
            const alternatives = exercise.alternatives || [];
            if (alternatives.length > 0) {
                const newMain = alternatives[0];
                const otherAlternatives = alternatives.slice(1);

                // Construct new exercise object
                const updatedExercise: WorkoutExercise = {
                    ...newMain,
                    // inherit slot settings from old main
                    sets: exercise.sets,
                    targetReps: exercise.targetReps,
                    targetRIR: exercise.targetRIR,
                    restSeconds: exercise.restSeconds,
                    alternatives: otherAlternatives
                };

                onUpdate(index, updatedExercise);
            } else {
                // No alternatives? Then just remove.
                onRemove(index);
            }
        } else {
            // We are removing an ALTERNATIVE
            // Logic: Filter out this alternative from the Main exercise's list
            const alternatives = exercise.alternatives || [];
            const newAlternatives = alternatives.filter(a => a.id !== selectedVariant.id);

            const updatedExercise: WorkoutExercise = {
                ...exercise,
                alternatives: newAlternatives
            };

            onUpdate(index, updatedExercise);
        }
    };


    return (
        <Draggable draggableId={`${exercise.id}-${index}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
            group relative flex items-center gap-3 p-0 rounded-xl border transition-all duration-200 overflow-hidden
            ${snapshot.isDragging
                            ? 'bg-slate-800 border-primary-500 shadow-xl z-50 scale-[1.02]'
                            : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-900 hover:border-slate-700'}
          `}
                >
                    {/* Drag Handle - Absolute positioned or flexible on the left */}
                    <div {...provided.dragHandleProps} className="absolute left-0 top-0 bottom-0 z-20 w-8 flex items-center justify-center text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing bg-slate-900/0 hover:bg-slate-900/50 transition-colors">
                        <GripVertical size={18} />
                    </div>

                    {/* Carousel Container */}
                    <div className="flex-1 overflow-hidden pl-7" ref={emblaRef}>
                        <div className="flex touch-pan-y"> {/* touch-pan-y allows vertical scroll while swiping horiz */}
                            {variants.map((variant, vIdx) => {
                                const thumbUrl = getThumbnailUrl(variant.videoUrl);
                                return (
                                    <div key={variant.id} className="flex-[0_0_100%] min-w-0 relative px-3 py-3 flex items-center gap-3">
                                        {/* Thumbnail */}
                                        <div
                                            className="shrink-0 w-16 h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative hidden xs:block cursor-pointer hover:border-primary-500/50 transition-colors"
                                            onClick={() => onOpenDetails(exercise, index)} // Open currently displayed? Or internal variant? onOpenDetails takes (exercise, index). Parent expects current Main. Logic holds if we swapped.
                                        >
                                            {thumbUrl ? (
                                                <img src={thumbUrl} alt="" className="w-full h-full object-cover opacity-60" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                    <Video size={16} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 cursor-pointer group/info" onClick={() => onOpenDetails(exercise, index)}>
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-bold text-slate-200 truncate pr-2 leading-tight group-hover/info:text-primary-400 transition-colors flex items-center gap-2">
                                                    {variant.name}
                                                    {variant.isMain && <Activity size={12} className="text-primary-500" />}
                                                </h3>
                                                {/* Meta info matching original clean look, maybe muscle group? */}
                                                <span className="text-xs text-slate-500 truncate">{variant.muscleGroup}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Dots Overlay - Floating Bottom Left or integrated? 
                        User asked for "slide between them". Dots logic requested previously works here too.
                    */}
                    {variants.length > 1 && (
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                            {variants.map((_, dotIdx) => (
                                <div
                                    key={dotIdx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${dotIdx === selectedIndex
                                        ? 'bg-primary-500 shadow-sm shadow-primary-500/50'
                                        : 'bg-slate-700/50'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    )}


                    {/* Remove Button - Fixed on Right */}
                    <button
                        onClick={handleRemove}
                        className="p-2 mr-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 z-20 relative"
                        title="Remover exercício"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </Draggable>
    );
};
