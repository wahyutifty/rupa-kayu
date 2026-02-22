'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Loader2, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

type Product = {
    id: number;
    name: string;
    base_price: number;
    image_url: string;
    is_promo?: boolean;
    landing_content?: { original_price?: number };
    categories?: { name: string };
};

type Category = {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
};

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [catLoading, setCatLoading] = useState(true);

    // Fetch kategori saat mount
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('name');
            setCategories(data || []);
            setCatLoading(false);
        }
        fetchCategories();
    }, []);

    // Debounce search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            const { data } = await supabase
                .from('products')
                .select('*, categories(name)')
                .ilike('name', `%${query}%`)
                .limit(20);
            setResults(data || []);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    const showCategories = !query.trim();

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 pt-20 pb-24 max-w-2xl">

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Cari furnitur, kursi, meja..."
                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Loading search */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
                    </div>
                )}

                {/* Hasil Pencarian */}
                <AnimatePresence>
                    {!loading && query.trim() && results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="text-sm text-gray-500 mb-4">
                                <span className="font-bold text-gray-900">{results.length}</span> hasil untuk &ldquo;{query}&rdquo;
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {results.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                    >
                                        <div className="relative aspect-square bg-gray-100">
                                            <Image
                                                src={product.image_url || 'https://placehold.co/300x300?text=Produk'}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {product.is_promo && (
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    PROMO
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <p className="text-xs text-amber-600 font-semibold mb-0.5">
                                                {/* @ts-ignore */}
                                                {product.categories?.name || 'Produk'}
                                            </p>
                                            <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
                                                {product.name}
                                            </h3>
                                            {product.landing_content?.original_price && product.landing_content.original_price > product.base_price ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black text-red-600">
                                                        Rp {product.base_price.toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 line-through">
                                                        Rp {Number(product.landing_content.original_price).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-black text-gray-900">
                                                    Rp {product.base_price.toLocaleString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tidak ditemukan */}
                {!loading && query.trim() && results.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="text-gray-500 text-sm">
                            Tidak ada produk untuk <span className="font-bold text-gray-900">&ldquo;{query}&rdquo;</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Coba kata kunci lain atau lihat kategori di bawah</p>
                        <button
                            onClick={() => setQuery('')}
                            className="mt-4 text-amber-600 text-sm font-semibold hover:underline"
                        >
                            Lihat semua kategori
                        </button>
                    </motion.div>
                )}

                {/* ===== KATEGORI (tampil saat search kosong) ===== */}
                <AnimatePresence>
                    {showCategories && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
                                    Jelajahi Kategori
                                </h2>
                                <Link href="/" className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:underline">
                                    Semua <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {catLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {categories.map((cat, i) => (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Link
                                                href={`/category/${cat.slug}`}
                                                className="group relative flex items-end overflow-hidden rounded-2xl h-32 bg-gray-200 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                            >
                                                {/* Foto kategori */}
                                                {cat.image_url ? (
                                                    <Image
                                                        src={cat.image_url}
                                                        alt={cat.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                                                        <span className="text-4xl">🪑</span>
                                                    </div>
                                                )}

                                                {/* Overlay gradient + label */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                                <div className="relative z-10 p-3 w-full flex items-end justify-between">
                                                    <span className="text-white font-bold text-sm leading-tight drop-shadow">
                                                        {cat.name}
                                                    </span>
                                                    <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
                                                        <ArrowRight className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Saran pencarian populer */}
                            <div className="mt-6">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Populer dicari</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Kursi', 'Meja Makan', 'Lemari', 'Sofa', 'Rak Buku', 'Tempat Tidur'].map(term => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Footer />
        </main>
    );
}
