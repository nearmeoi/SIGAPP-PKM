import React from 'react';
import { PKM_LEGEND_STATUSES, PKM_LEGEND_TYPES } from '@/data/pkmMapVisuals';

export default function MapLegend({ compact = false, className = '' }) {
    const rootClassName = ['sigap-map-legend', compact ? 'is-compact' : '', className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={rootClassName} aria-label="Legenda visual peta PKM">
            <div className="sigap-map-legend__header">
                <span className="sigap-map-legend__eyebrow">Legenda Peta</span>
                <strong className="sigap-map-legend__title">Visual PKM</strong>
            </div>

            <div className="sigap-map-legend__section">
                <span className="sigap-map-legend__section-title">Jenis PKM</span>
                <div className="sigap-map-legend__items">
                    {PKM_LEGEND_TYPES.map((type) => (
                        <div key={type.key} className="sigap-map-legend__item">
                            <span
                                className="sigap-map-legend__swatch"
                                style={{ '--legend-swatch-color': type.color }}
                            ></span>
                            <span className="sigap-map-legend__label">{type.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sigap-map-legend__section">
                <span className="sigap-map-legend__section-title">Status PKM</span>
                <div className="sigap-map-legend__items">
                    {PKM_LEGEND_STATUSES.map((status) => (
                        <div key={status.key} className="sigap-map-legend__item">
                            <span className="sigap-map-legend__status-icon">
                                <i className={`fa-solid ${status.markerIcon}`}></i>
                            </span>
                            <span className="sigap-map-legend__label">{status.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
