import React from 'react';
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

// -------------------------------------------------------
// Mock data engineered from the map markers:
//
//   1. "Pemberdayaan UMKM Kripik Pisang"
//      → Bira, Kec. Tamalanrea | 2025 | status: selesai   (#16a34a)
//
//   2. "Edukasi Sanitasi Lingkungan"
//      → Tamalanrea Indah, Kec. Tamalanrea | 2026 | status: berlangsung (#f59e0b)
//
// The charts below use these real data points plus
// realistic historical mock data to show trends.
// -------------------------------------------------------

const COLORS = {
    selesai: '#16a34a',
    selesaiBg: 'rgba(22, 163, 74, 0.15)',
    berlangsung: '#f59e0b',
    berlangsungBg: 'rgba(245, 158, 11, 0.15)',
    primary: '#046bd2',
    primaryBg: 'rgba(4, 107, 210, 0.7)',
    primaryLight: 'rgba(4, 107, 210, 0.15)',
    grid: 'rgba(148, 163, 184, 0.12)',
    textMuted: '#64748b',
    textDark: '#0f172a',
};

// ---- Chart 1: Tren PKM Tahunan (Bar Chart) ----
const yearlyTrendData = {
    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
    datasets: [
        {
            label: 'Selesai',
            data: [2, 3, 4, 5, 7, 3],
            backgroundColor: COLORS.selesai,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
        },
        {
            label: 'Berlangsung',
            data: [1, 1, 2, 2, 1, 4],
            backgroundColor: COLORS.berlangsung,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
        },
    ],
};

const yearlyTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: { size: 13, weight: '600', family: "'Segoe UI', sans-serif" },
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
                font: { size: 12, weight: '600' },
                color: COLORS.textMuted,
            },
        },
        y: {
            beginAtZero: true,
            grid: { color: COLORS.grid },
            ticks: {
                stepSize: 2,
                font: { size: 12 },
                color: COLORS.textMuted,
            },
        },
    },
};

// ---- Chart 2: Sebaran Status PKM Berdasarkan Titik Lokasi (Doughnut) ----
// Segments correspond to the exact map marker locations + status
const statusDistributionData = {
    labels: [
        'Kripik Pisang - Bira (Selesai)',
        'Sanitasi Lingkungan - Tamalanrea Indah (Berlangsung)',
        'Kegiatan Lainnya (Selesai)',
        'Kegiatan Lainnya (Berlangsung)',
    ],
    datasets: [
        {
            data: [25, 20, 35, 20],
            backgroundColor: [
                COLORS.selesai,
                COLORS.berlangsung,
                'rgba(22, 163, 74, 0.5)',
                'rgba(245, 158, 11, 0.45)',
            ],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 14,
        },
    ],
};

const statusDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 16,
                font: { size: 12, weight: '600', family: "'Segoe UI', sans-serif" },
                color: COLORS.textMuted,
                boxWidth: 10,
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
                label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
            },
        },
    },
};

// ---- Component ----

export default function LandingCharts({ extraContent = null }) {
    return (
        <section className="fintech-charts-section" id="visualisasi-data">
            <div className="fintech-panel-header">
                <h2 className="fintech-panel-title">Dashboard Evaluasi <span className="text-blue">PKM</span></h2>
            </div>

            <div className="charts-grid">
                {/* Chart 1 — Bar Chart */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div className="chart-card-icon">
                            <i className="fa-solid fa-chart-column"></i>
                        </div>
                        <div>
                            <h3 className="chart-card-title">Jumlah PKM Per Tahun</h3>
                            <p className="chart-card-subtitle">Perbandingan kegiatan PKM berdasarkan tahun pelaksanaan</p>
                        </div>
                    </div>
                    <div className="chart-canvas-wrapper">
                        <Bar data={yearlyTrendData} options={yearlyTrendOptions} />
                    </div>
                </div>

                {/* Chart 2 — Doughnut Chart */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div className="chart-card-icon chart-card-icon--amber">
                            <i className="fa-solid fa-chart-pie"></i>
                        </div>
                        <div>
                            <h3 className="chart-card-title">Sebaran Lokasi PKM</h3>
                            <p className="chart-card-subtitle">Ringkasan distribusi kegiatan PKM pada area pengabdian</p>
                        </div>
                    </div>
                    <div className="chart-canvas-wrapper">
                        <Doughnut data={statusDistributionData} options={statusDistributionOptions} />
                    </div>
                </div>

                {extraContent}
            </div>
        </section>
    );
}
