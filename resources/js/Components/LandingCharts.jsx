import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { resolvePublicPkmData } from '@/data/sigapData';
import { PKM_LEGEND_TYPES, getPkmTypeMeta } from '@/data/pkmMapVisuals';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const COLORS = {
    grid: 'rgba(148, 163, 184, 0.12)',
    textMuted: '#64748b',
};

const fallbackPkmData = resolvePublicPkmData(null);

const buildBarOptions = (compactMobile = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: compactMobile ? 14 : 20,
                font: { size: compactMobile ? 11 : 13, weight: '600', family: "'Segoe UI', sans-serif" },
                color: COLORS.textMuted,
            },
        },
        title: { display: false },
        tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: '700' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 10,
            displayColors: true,
            usePointStyle: true,
            callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} kegiatan`,
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                font: { size: compactMobile ? 11 : 12, weight: '600' },
                color: COLORS.textMuted,
            },
        },
        y: {
            beginAtZero: true,
            grid: { color: COLORS.grid },
            ticks: {
                stepSize: 1,
                precision: 0,
                font: { size: compactMobile ? 11 : 12 },
                color: COLORS.textMuted,
            },
        },
    },
});

const buildDoughnutOptions = (compactMobile = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: compactMobile ? '66%' : '62%',
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: compactMobile ? 12 : 16,
                font: { size: compactMobile ? 10 : 12, weight: '600', family: "'Segoe UI', sans-serif" },
                color: COLORS.textMuted,
                boxWidth: compactMobile ? 8 : 10,
            },
        },
        title: { display: false },
        tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: '700' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.parsed} kegiatan`,
            },
        },
    },
});

const buildChartSource = (pkmData = []) => {
    const sourceData = Array.isArray(pkmData) && pkmData.length > 0 ? pkmData : fallbackPkmData;

    const years = [...new Set(
        sourceData
            .map((item) => Number(item?.tahun))
            .filter((year) => Number.isFinite(year))
    )].sort((a, b) => a - b);

    const groupedByTypePerYear = PKM_LEGEND_TYPES.map((typeMeta) => ({
        ...typeMeta,
        data: years.map((year) => (
            sourceData.filter((item) => Number(item?.tahun) === year && getPkmTypeMeta(item).key === typeMeta.key).length
        )),
    }));

    const groupedByTypeTotals = PKM_LEGEND_TYPES.map((typeMeta) => ({
        ...typeMeta,
        total: sourceData.filter((item) => getPkmTypeMeta(item).key === typeMeta.key).length,
    }));

    return {
        barData: {
            labels: years,
            datasets: groupedByTypePerYear.map((item) => ({
                label: item.label,
                data: item.data,
                backgroundColor: item.color,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.55,
                categoryPercentage: 0.7,
            })),
        },
        doughnutData: {
            labels: groupedByTypeTotals.map((item) => item.label),
            datasets: [
                {
                    data: groupedByTypeTotals.map((item) => item.total),
                    backgroundColor: groupedByTypeTotals.map((item) => item.color),
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 14,
                },
            ],
        },
    };
};

export default function LandingCharts({ compactMobile = false, pkmData = [] }) {
    const chartSource = useMemo(() => buildChartSource(pkmData), [pkmData]);
    const barOptions = buildBarOptions(compactMobile);
    const doughnutOptions = buildDoughnutOptions(compactMobile);

    return (
        <section className="fintech-charts-section" id="visualisasi-data">
            <div className="fintech-panel-header">
                <h2 className="fintech-panel-title">Dashboard Evaluasi <span className="text-blue">PKM</span></h2>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div className="chart-card-icon">
                            <i className="fa-solid fa-chart-column"></i>
                        </div>
                        <div>
                            <h3 className="chart-card-title">Jumlah PKM Per Tahun</h3>
                            <p className="chart-card-subtitle">Perbandingan jumlah PKM per tahun berdasarkan jenis program yang berjalan</p>
                        </div>
                    </div>
                    <div className="chart-canvas-wrapper">
                        <Bar data={chartSource.barData} options={barOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <div className="chart-card-icon chart-card-icon--amber">
                            <i className="fa-solid fa-chart-pie"></i>
                        </div>
                        <div>
                            <h3 className="chart-card-title">Sebaran Lokasi PKM</h3>
                            <p className="chart-card-subtitle">Distribusi jenis PKM yang tersebar pada lokasi pengabdian yang tercatat</p>
                        </div>
                    </div>
                    <div className="chart-canvas-wrapper">
                        <Doughnut data={chartSource.doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>
        </section>
    );
}
