import React from 'react';
import { PKM_LEGEND_STATUSES, PkmTypeMeta } from '@/data/pkmMapVisuals';

interface MapLegendProps {
    compact?: boolean;
    className?: string;
    typesMeta: PkmTypeMeta[]; // required dynamic types
    selectedTypes?: string[];
    onToggleType?: (typeKey: string) => void;
    selectedStatuses?: string[];
    onToggleStatus?: (statusKey: string) => void;
}

export default function MapLegend({
    compact = false,
    className = '',
    typesMeta,
    selectedTypes,
    onToggleType,
    selectedStatuses,
    onToggleStatus
}: MapLegendProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-soft border border-slate-100 p-4 flex flex-col ${compact ? 'p-3' : ''} ${className}`}
            style={{ maxHeight: 'max(40vh, 300px)' }}
            aria-label="Legenda visual peta PKM"
        >
            {/* Header - Fixed */}
            <div className="mb-4 pb-3 border-b border-slate-100 shrink-0">
                <span className="text-xs font-bold text-poltekpar-gray uppercase tracking-wider">Legenda Peta</span>
                <strong className="block text-lg font-bold text-slate-900 mt-0.5">Visual PKM</strong>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-6">
                {/* PKM Types Section */}
                <div>
                    <span className="text-sm font-semibold text-slate-700 block mb-2.5 flex justify-between items-center sticky top-0 bg-white z-10 py-1">
                        Jenis PKM
                    </span>
                    <div className="space-y-1.5">
                        {typesMeta.map((type) => (
                            <div
                                key={type.key}
                                onClick={() => onToggleType?.(type.key)}
                                className={`flex items-center transition-colors ${onToggleType ? 'cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg' : ''}`}
                            >
                                {onToggleType && (
                                    <div className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${selectedTypes?.includes(type.key) ? 'w-4 h-4 mr-2.5 opacity-100 scale-100 bg-poltekpar-primary border border-poltekpar-primary rounded shrink-0' : 'w-0 h-4 mr-0 opacity-0 scale-50 border-none'
                                        }`}>
                                        <i className="fa-solid fa-check text-[10px] text-white"></i>
                                    </div>
                                )}
                                <span
                                    className="w-4 h-4 mr-2.5 rounded-full shadow-sm shrink-0"
                                    style={{ backgroundColor: type.color }}
                                ></span>
                                <span className="text-sm text-slate-600 font-medium leading-none">{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PKM Status Section */}
                <div>
                    <span className="text-sm font-semibold text-slate-700 block mb-2.5 flex justify-between items-center">
                        Status PKM
                    </span>
                    <div className="space-y-1.5">
                        {PKM_LEGEND_STATUSES.map((status) => (
                            <div
                                key={status.key}
                                onClick={() => onToggleStatus?.(status.key)}
                                className={`flex items-center transition-colors ${onToggleStatus ? 'cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg' : ''}`}
                            >
                                {onToggleStatus && (
                                    <div className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${selectedStatuses?.includes(status.key) ? 'w-4 h-4 mr-2.5 opacity-100 scale-100 bg-poltekpar-primary border border-poltekpar-primary rounded shrink-0' : 'w-0 h-4 mr-0 opacity-0 scale-50 border-none'
                                        }`}>
                                        <i className="fa-solid fa-check text-[10px] text-white"></i>
                                    </div>
                                )}
                                <span className={`mr-2.5 flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${status.key === 'berlangsung' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                                    <i className={`fa-solid ${status.markerIcon} text-sm ${status.key === 'berlangsung' ? 'text-amber-600' : 'text-emerald-600'}`}></i>
                                </span>
                                <span className="text-sm text-slate-600 font-medium leading-none">{status.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
