
import React from 'react';

interface NormalityBarProps {
    value: number;
    min?: number;
    max?: number;
    lowThreshold: number;
    highThreshold: number;
    formatValue?: (v: number) => string;
    label?: string;
    classification?: string;
    isHigherBetter?: boolean; // Para saber se "Alto" é verde (Massa Magra) ou vermelho (Gordura)
}

const NormalityBar: React.FC<NormalityBarProps> = ({
    value,
    min = 0,
    max,
    lowThreshold,
    highThreshold,
    formatValue = (v) => v.toString(),
    classification,
    isHigherBetter = false
}) => {
    // Determinar max se não passado (ex: 150% do highThreshold)
    const secureMax = max || highThreshold * 1.5;

    // Calcular percentuais para CSS width
    // Range total = secureMax - min
    const range = secureMax - min;

    // Low range width (from min to lowThreshold)
    const lowWidth = ((lowThreshold - min) / range) * 100;

    // Normal range width (from lowThreshold to highThreshold)
    const normalWidth = ((highThreshold - lowThreshold) / range) * 100;

    // High range width (remaining)
    const highWidth = 100 - lowWidth - normalWidth;

    // Value position
    const valuePercent = Math.min(100, Math.max(0, ((value - min) / range) * 100));

    // Colors
    // Se isHigherBetter (ex: Músculo): Baixo (Amarelo/Red), Normal (Verde), Alto (Verde Forte)
    // Se !isHigherBetter (ex: Gordura): Baixo (Amarelo), Normal (Verde), Alto (Vermelho)

    // Simplificação estilo InBody:
    // Bajo: Cinza/Amarelo
    // Normal: Cinza Escuro
    // Alto: Cinza Claro
    // O que dá a cor é o indicador ou o preenchimento se fosse contínuo.
    // Mas o usuário pediu "barras de faixa de normalidade".
    // Vamos usar cores suaves de background e um marcador forte.

    // Cores de fundo das seções
    // Cores de fundo das seções
    const lowColor = 'bg-surface-700'; // Baixo
    const normalColor = 'bg-surface-600'; // Normal
    const highColor = 'bg-surface-700'; // Alto

    // Cor do marcador baseada na classificação ou posição
    let markerColor = 'bg-surface-400';
    if (value < lowThreshold) {
        markerColor = isHigherBetter ? 'bg-red-500' : 'bg-yellow-500'; // Pouco músculo (ruim) ou Pouca gordura (atenção)
    } else if (value <= highThreshold) {
        markerColor = 'bg-emerald-500'; // Normal (Bom)
    } else {
        markerColor = isHigherBetter ? 'bg-emerald-400' : 'bg-red-500'; // Muito músculo (bom) ou Muita gordura (ruim)
    }

    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] text-surface-500 font-bold uppercase mb-1.5">
                <span style={{ width: `${lowWidth}%` }} className="text-left pl-1">Baixo</span>
                <span style={{ width: `${normalWidth}%` }} className="text-center">Normal</span>
                <span style={{ width: `${highWidth}%` }} className="text-right pr-1">Alto</span>
            </div>

            <div className="h-4 w-full flex rounded-lg overflow-hidden relative bg-surface-900 border border-white/5">
                {/* Background Sections (Track) */}
                <div className="absolute inset-0 flex w-full opacity-20">
                    <div style={{ width: `${lowWidth}%` }} className={`h-full ${lowColor} border-r border-surface-950`} />
                    <div style={{ width: `${normalWidth}%` }} className={`h-full ${normalColor} border-r border-surface-950`} />
                    <div style={{ width: `${highWidth}%` }} className={`h-full ${highColor}`} />
                </div>

                {/* Full Fill Bar */}
                <div
                    className={`absolute top-0 left-0 h-full ${markerColor} transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(0,0,0,0.3)] relative`}
                    style={{ width: `${valuePercent}%` }}
                >
                    {/* Optional: Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </div>
            </div>

            {/* Value Label Indicator - Only render if not empty string to avoid layout shifts */}
            {formatValue(value) !== '' && (
                <div className="relative h-4 mt-1">
                    <div
                        className="absolute text-[10px] font-bold text-white transition-all duration-500 bg-surface-800 px-1.5 rounded transform -translate-x-1/2 -top-1 border border-white/5"
                        style={{ left: `${valuePercent}%` }}
                    >
                        {formatValue(value)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NormalityBar;
