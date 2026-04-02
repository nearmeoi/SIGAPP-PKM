import React from 'react';
import { PKM_LEGEND_STATUSES, PKM_LEGEND_TYPES } from '@/data/pkmMapVisuals';

interface MapLegendProps {
    compact?: boolean;
    className?: string;
    selectedTypes?: string[];
    onToggleType?: (typeKey: string) => void;
    selectedStatuses?: string[];
    onToggleStatus?: (statusKey: string) => void;
}

export default function MapLegend({
    compact = false,
    className = '',
    selectedTypes,
    onToggleType,
    selectedStatuses,
    onToggleStatus
}: MapLegendProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-soft border border-slate-100 p-4 ${compact ? 'p-3' : ''} ${className}`}
            aria-label="Legenda visual peta PKM"
        >
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-poltekpar-gray uppercase tracking-wider">Legenda Peta</span>
                <strong className="block text-lg font-bold text-slate-900 mt-0.5">Visual PKM</strong>
            </div>

            {/* PKM Types Section */}
            <div className="mb-4">
                <span className="text-sm font-semibold text-slate-700 block mb-2.5 flex justify-between items-center">
                    Jenis PKM
                </span>
                <div className="space-y-1.5">
                    {PKM_LEGEND_TYPES.map((type) => (
                        <div
                            key={type.key}
                            onClick={() => onToggleType?.(type.key)}
                            className={`flex items-center gap-2.5 transition-colors ${onToggleType ? 'cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg' : ''}`}
                        >
                            {onToggleType && selectedTypes?.includes(type.key) && (
                                <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors bg-poltekpar-primary border-poltekpar-primary">
                                    <i className="fa-solid fa-check text-[10px] text-white"></i>
                                </div>
                            )}
                            <span
                                className="w-4 h-4 rounded-full shadow-sm shrink-0"
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
                            className={`flex items-center gap-2.5 transition-colors ${onToggleStatus ? 'cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg' : ''}`}
                        >
                            {onToggleStatus && selectedStatuses?.includes(status.key) && (
                                <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors bg-poltekpar-primary border-poltekpar-primary">
                                    <i className="fa-solid fa-check text-[10px] text-white"></i>
                                </div>
                            )}
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${status.key === 'berlangsung' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                                <i className={`fa-solid ${status.markerIcon} text-sm ${status.key === 'berlangsung' ? 'text-amber-600' : 'text-emerald-600'}`}></i>
                            </span>
                            <span className="text-sm text-slate-600 font-medium leading-none">{status.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
