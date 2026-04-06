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
import { extractDynamicPkmTypes } from '@/data/pkmMapVisuals';
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
                padding: 20,
                font: { size: 12, weight: 600, family: "'Segoe UI', sans-serif" },
                color: COLORS.textMuted,
            },
        },
        title: { display: false },
        tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: 700 },
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
                font: { size: 12, weight: 600 },
                color: COLORS.textMuted,
                padding: 10,
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
                padding: 16,
                font: { size: 12, weight: 600, family: "'Segoe UI', sans-serif" },
                color: COLORS.textMuted,
                boxWidth: compactMobile ? 8 : 10,
            },
        },
        title: { display: false },
        tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: 700 }, // Harus numeric 700 atau 'bold'
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
    if (!Array.isArray(pkmData) || pkmData.length === 0) {
        return {
            barData: { labels: [], datasets: [] },
            doughnutData: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: '#ffffff', borderWidth: 3, hoverOffset: 14 }] },
        };
    }

    // Kumpulkan semua jenis PKM unik dari data MySQL (dinamis, tidak hardcoded)
    const typesMeta = extractDynamicPkmTypes(pkmData);

    // Kumpulkan semua tahun unik dari data MySQL
    const years = [...new Set(
        pkmData
            .map((item) => Number(item?.tahun))
            .filter((year) => Number.isFinite(year))
    )].sort((a, b) => a - b);

    // Bar chart: per tahun per jenis
    const barDatasets = typesMeta.map((typeMeta) => ({
        label: typeMeta.label,
        data: years.map((year) =>
            pkmData.filter((item) => Number(item?.tahun) === year && (String(item?.jenis_pkm ?? '').trim() || 'Lainnya') === typeMeta.key).length
        ),
        backgroundColor: typeMeta.color,
        borderRadius: 6,
        borderSkipped: false as const,
        barPercentage: 0.8,
        categoryPercentage: 0.8,
    }));

    // Doughnut chart: total per jenis
    const doughnutTotals = typesMeta.map((typeMeta) => ({
        label: typeMeta.label,
        total: pkmData.filter((item) => (String(item?.jenis_pkm ?? '').trim() || 'Lainnya') === typeMeta.key).length,
        color: typeMeta.color,
    }));

    return {
        barData: {
            labels: years,
            datasets: barDatasets,
        },
        doughnutData: {
            labels: doughnutTotals.map((item) => item.label),
            datasets: [
                {
                    data: doughnutTotals.map((item) => item.total),
                    backgroundColor: doughnutTotals.map((item) => item.color),
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
        <section className="px-6 py-8 flex flex-col gap-8" id="visualisasi-data">
            {/* Bar Chart */}
            <div className="bg-white rounded-[28px] shadow-2xl shadow-sigappa-navy/5 border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-poltekpar-primary to-poltekpar-navy flex items-center justify-center text-white shadow-lg">
                            <i className="fa-solid fa-chart-column text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Jumlah PKM Per Tahun</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 leading-snug">Perbandingan jumlah PKM per tahun berdasarkan jenis program yang berjalan</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 h-[400px]">
                    <Bar data={chartSource.barData} options={barOptions} />
                </div>
            </div>

            {/* Doughnut Chart */}
            <div className="bg-white rounded-[28px] shadow-2xl shadow-sigappa-navy/5 border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                            <i className="fa-solid fa-chart-pie text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Sebaran Lokasi PKM</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 leading-snug">Distribusi jenis PKM yang tersebar pada lokasi pengabdian yang tercatat</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 h-[400px] flex items-center justify-center">
                    <Doughnut data={chartSource.doughnutData} options={doughnutOptions} />
                </div>
            </div>
        </section>
    );
}
