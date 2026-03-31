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
    ChartData,
    ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { resolvePublicPkmData } from '@/data/sigapData';
import { PKM_LEGEND_TYPES, getPkmTypeMeta } from '@/data/pkmMapVisuals';
import type { PkmData } from '@/types';

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
    grid: 'rgba(148, 163, 180, 0.12)',
    textMuted: '#64748b',
};

const fallbackPkmData = resolvePublicPkmData(null);

interface ChartSource {
    barData: ChartData<'bar'>;
    doughnutData: ChartData<'doughnut'>;
}

const buildBarOptions = (compactMobile = false): ChartOptions<'bar'> => ({
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

const buildDoughnutOptions = (compactMobile = false): ChartOptions<'doughnut'> => ({
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

const buildChartSource = (pkmData: PkmData[] = []): ChartSource => {
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

interface LandingChartsProps {
    compactMobile?: boolean;
    pkmData?: PkmData[];
}

export default function LandingCharts({ compactMobile = false, pkmData = [] }: LandingChartsProps) {
    const chartSource = useMemo(() => buildChartSource(pkmData), [pkmData]);
    const barOptions = useMemo(() => buildBarOptions(compactMobile), [compactMobile]);
    const doughnutOptions = useMemo(() => buildDoughnutOptions(compactMobile), [compactMobile]);

    return (
        <section className="px-6 py-8" id="visualisasi-data">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                    Dashboard Evaluasi <span className="text-sigap-blue">PKM</span>
                </h2>
            </div>

            {/* Charts Grid */}
            <div className={`grid gap-6 ${compactMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md">
                                <i className="fa-solid fa-chart-column text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Jumlah PKM Per Tahun</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Perbandingan jumlah PKM per tahun berdasarkan jenis program yang berjalan</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 h-72">
                        <Bar data={chartSource.barData} options={barOptions} />
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                                <i className="fa-solid fa-chart-pie text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Sebaran Lokasi PKM</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Distribusi jenis PKM yang tersebar pada lokasi pengabdian yang tercatat</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 h-72">
                        <Doughnut data={chartSource.doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>
        </section>
    );
}
