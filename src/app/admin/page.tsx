'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
    Package,
    Tags,
    Percent,
    Star,
    TrendingUp,
    ArrowRight,
    RefreshCw,
    Armchair,
    FileText,
    ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';

type Stats = {
    totalProducts: number;
    totalCategories: number;
    totalPromos: number;
    heroProducts: number;
    promoProducts: number;
    totalRooms: number;
    totalPosts: number;
    recentProducts: { id: number; name: string; base_price: number; image_url?: string; created_at: string }[];
    activePromos: { id: number; title: string; discount_percentage?: number; valid_until?: string }[];
};

const defaultStats: Stats = {
    totalProducts: 0,
    totalCategories: 0,
    totalPromos: 0,
    heroProducts: 0,
    promoProducts: 0,
    totalRooms: 0,
    totalPosts: 0,
    recentProducts: [],
    activePromos: [],
};

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>(defaultStats);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const [
                { count: totalProducts },
                { count: totalCategories },
                { count: totalPromos },
                { count: heroProducts },
                { count: promoProducts },
                { count: totalRooms },
                { count: totalPosts },
                { data: recentProducts },
                { data: activePromos },
            ] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('categories').select('*', { count: 'exact', head: true }),
                supabase.from('promos').select('*', { count: 'exact', head: true })
                    .or(`valid_until.is.null,valid_until.gte.${today}`),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_hero', true),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_promo', true),
                supabase.from('rooms').select('*', { count: 'exact', head: true }),
                supabase.from('posts').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('id, name, base_price, image_url, created_at')
                    .order('created_at', { ascending: false }).limit(5),
                supabase.from('promos').select('id, title, discount_percentage, valid_until')
                    .or(`valid_until.is.null,valid_until.gte.${today}`)
                    .order('created_at', { ascending: false }).limit(5),
            ]);

            setStats({
                totalProducts: totalProducts ?? 0,
                totalCategories: totalCategories ?? 0,
                totalPromos: totalPromos ?? 0,
                heroProducts: heroProducts ?? 0,
                promoProducts: promoProducts ?? 0,
                totalRooms: totalRooms ?? 0,
                totalPosts: totalPosts ?? 0,
                recentProducts: recentProducts ?? [],
                activePromos: activePromos ?? [],
            });
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const statCards = [
        {
            label: 'Total Produk',
            value: stats.totalProducts,
            icon: Package,
            color: 'amber',
            href: '/admin/products',
            sub: `${stats.heroProducts} hero · ${stats.promoProducts} promo`,
        },
        {
            label: 'Kategori',
            value: stats.totalCategories,
            icon: Tags,
            color: 'stone',
            href: '/admin/categories',
            sub: 'Semua kategori aktif',
        },
        {
            label: 'Promo Aktif',
            value: stats.totalPromos,
            icon: Percent,
            color: 'red',
            href: '/admin/promos',
            sub: `${stats.promoProducts} produk sedang promo`,
        },
        {
            label: 'Inspirasi Ruang',
            value: stats.totalRooms,
            icon: Armchair,
            color: 'teal',
            href: '/admin/rooms',
            sub: 'Galeri inspirasi',
        },
        {
            label: 'Artikel / Berita',
            value: stats.totalPosts,
            icon: FileText,
            color: 'indigo',
            href: '/admin/posts',
            sub: 'Konten blog',
        },
        {
            label: 'Produk Hero',
            value: stats.heroProducts,
            icon: Star,
            color: 'yellow',
            href: '/admin/products',
            sub: 'Tampil di bagian utama',
        },
    ];

    const colorMap: Record<string, string> = {
        amber: 'bg-amber-50  dark:bg-amber-900/20  text-amber-700  dark:text-amber-400',
        stone: 'bg-stone-50  dark:bg-stone-900/20  text-stone-700  dark:text-stone-400',
        red: 'bg-red-50    dark:bg-red-900/20    text-red-700    dark:text-red-400',
        teal: 'bg-teal-50   dark:bg-teal-900/20   text-teal-700   dark:text-teal-400',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    };

    return (
        <div className="space-y-6">

            {/* ══ Header ══ */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Selamat Datang 👋
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {lastUpdated
                            ? `Diperbarui: ${lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Memuat data...'}
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-amber-700 border border-gray-200 hover:border-amber-300 rounded-lg hover:bg-amber-50 transition-all"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* ══ Stat Cards ══ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                    >
                        <Link
                            href={card.href}
                            className="flex flex-col bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all group"
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
                                <card.icon size={18} />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                                {loading ? (
                                    <span className="inline-block w-8 h-6 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse" />
                                ) : card.value}
                            </p>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{card.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight hidden sm:block">{card.sub}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* ══ Bottom Panels ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Produk Terbaru */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-700">
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={16} className="text-amber-600" />
                            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Produk Terbaru</h3>
                        </div>
                        <Link href="/admin/products" className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium">
                            Lihat semua <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-zinc-700/50">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-700 animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse w-3/4" />
                                        <div className="h-2.5 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse w-1/3" />
                                    </div>
                                </div>
                            ))
                        ) : stats.recentProducts.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 py-8">Belum ada produk</p>
                        ) : (
                            stats.recentProducts.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-zinc-700 overflow-hidden shrink-0 border border-gray-100 dark:border-zinc-600">
                                        {p.image_url
                                            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={16} /></div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                                        <p className="text-xs text-amber-600 font-semibold">Rp {p.base_price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 shrink-0">
                                        {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Promo Aktif */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-700">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-red-500" />
                            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Promo Aktif</h3>
                        </div>
                        <Link href="/admin/promos" className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium">
                            Kelola <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-zinc-700/50">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse w-2/3" />
                                        <div className="h-2.5 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse w-1/4" />
                                    </div>
                                </div>
                            ))
                        ) : stats.activePromos.length === 0 ? (
                            <div className="py-10 text-center">
                                <Percent size={32} className="text-gray-200 dark:text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Tidak ada promo aktif</p>
                                <Link href="/admin/promos" className="inline-flex items-center gap-1 mt-3 text-xs text-amber-600 hover:underline font-medium">
                                    + Buat Promo
                                </Link>
                            </div>
                        ) : (
                            stats.activePromos.map((promo) => (
                                <div key={promo.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                        <Percent size={14} className="text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{promo.title}</p>
                                        <p className="text-xs text-gray-400">
                                            {promo.valid_until
                                                ? `s/d ${new Date(promo.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                : 'Berlaku selamanya'}
                                        </p>
                                    </div>
                                    {promo.discount_percentage ? (
                                        <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full shrink-0">
                                            -{promo.discount_percentage}%
                                        </span>
                                    ) : null}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
