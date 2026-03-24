import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Star, MessageSquareQuote } from 'lucide-react';

interface TestimoniItem {
    id_testimoni: number;
    nama_pemberi: string;
    rating: number;
    pesan_ulasan: string;
    created_at: string;
    aktivitas?: {
        id_aktivitas: number;
        pengajuan?: {
            judul_kegiatan: string;
            user?: { name: string };
        };
    };
}

interface PaginatedData {
    data: TestimoniItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    listTestimoni: PaginatedData;
}

const MetricCard = ({ title, val, subval }: { title: string, val: string | number, subval?: string }) => (
    <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
            <div className="text-zinc-500 text-[13px] font-medium mb-1">{title}</div>
            <div className="text-zinc-900 text-[28px] font-bold tracking-tight leading-none flex items-end gap-2">
                {val} {subval && <span className="text-[14px] text-zinc-400 font-medium mb-1">{subval}</span>}
            </div>
        </div>
    </div>
);

const TestimoniPage: React.FC<Props> = ({ listTestimoni }) => {
    const items = listTestimoni.data || [];
    const avgRating = items.length > 0
        ? (items.reduce((acc, t) => acc + (t.rating || 0), 0) / items.length).toFixed(1)
        : '0.0';
    const positiveCount = items.filter(t => t.rating >= 4).length;
    const positivePercent = items.length > 0 ? Math.round((positiveCount / items.length) * 100) : 0;

    return (
        <AdminLayout title="">
            <div className="mb-8">
                <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Reviews & Feedback</h1>
                <p className="text-zinc-500 text-[14px] mt-1">Feedback terkumpul dari peserta kegiatan pengabdian.</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <MetricCard title="Average Rating" val={avgRating} subval="/ 5.0" />
                <MetricCard title="Total Reviews" val={listTestimoni.total} />
                <MetricCard title="Positive Feedback" val={`${positivePercent}%`} subval="≥ 4 stars" />
            </div>

            {/* Review cards */}
            {items.length === 0 ? (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm py-16 flex flex-col items-center justify-center text-center">
                    <MessageSquareQuote size={32} className="text-zinc-300 mb-3" />
                    <div className="text-zinc-900 text-[14px] font-medium">Belum ada testimoni</div>
                    <div className="text-zinc-500 text-[13px] mt-1">Testimoni akan muncul di sini setelah kegiatan selesai.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((t) => (
                        <div key={t.id_testimoni} className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={14} className={s <= t.rating ? 'text-zinc-900 fill-zinc-900' : 'text-zinc-200 fill-zinc-100'} />
                                ))}
                            </div>
                            <p className="text-zinc-700 text-[14px] leading-relaxed flex-1 italic">"{t.pesan_ulasan}"</p>
                            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-zinc-900 text-[13px]">{t.nama_pemberi}</div>
                                    <div className="text-zinc-400 text-[11px] mt-0.5 truncate max-w-[200px]">{t.aktivitas?.pengajuan?.judul_kegiatan || 'Unknown Event'}</div>
                                </div>
                                <div className="text-[12px] font-medium text-zinc-400">
                                    {new Date(t.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default TestimoniPage;
