// src/components/Hero.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import Link from "next/link";

export default function Hero() {
    const [heroProducts, setHeroProducts] = useState<Product[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHeroProducts() {
            try {
                let { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_hero', true)
                    .order('created_at', { ascending: false });

                if (!data || data.length === 0) {
                    const { data: latestData } = await supabase
                        .from('products')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(5);
                    data = latestData;
                }

                if (data) setHeroProducts(data);
            } catch (error) {
                console.error("Error fetching hero products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchHeroProducts();
    }, []);

    const handleNext = () => setActiveIndex((prev) => (prev === heroProducts.length - 1 ? 0 : prev + 1));
    const handlePrev = () => setActiveIndex((prev) => (prev === 0 ? heroProducts.length - 1 : prev - 1));

    if (loading) {
        return (
            <section className="relative w-full min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
            </section>
        );
    }

    if (heroProducts.length === 0) return null;

    const currentProduct = heroProducts[activeIndex];

    const bgColor = currentProduct.colors && currentProduct.colors.length > 0
        ? currentProduct.colors[0].code
        : '#d97706';

    return (
        <section className="relative w-full min-h-screen flex flex-col overflow-hidden bg-gray-50">

            {/* Background blobs */}
            <div
                className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-3xl transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: bgColor }}
            />
            <div
                className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 blur-3xl transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: bgColor }}
            />

            {/* Konten utama — flex-1 agar mengisi sisa layar */}
            <div className="flex flex-col items-center justify-center flex-1 z-10 px-4 py-10 md:py-16 gap-6 md:gap-10">

                {/* JUDUL — pakai clamp agar tidak terpotong */}
                <h1
                    className="font-black text-center uppercase tracking-tighter text-gray-800 leading-none"
                    style={{ fontSize: 'clamp(2.2rem, 7vw, 6rem)' }}
                >
                    Temukan Furnitur<br />Impian Anda
                </h1>

                {/* SLIDER ROW */}
                <div className="flex items-center justify-center gap-4 md:gap-10 w-full max-w-5xl">

                    {/* TOMBOL KIRI */}
                    <button
                        onClick={handlePrev}
                        className="p-3 rounded-full border border-gray-300 hover:bg-white hover:shadow-lg transition group bg-white/60 backdrop-blur-sm shrink-0"
                        aria-label="Sebelumnya"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-black" />
                    </button>

                    {/* GAMBAR PRODUK */}
                    <div className="flex flex-col items-center text-center flex-1 min-w-0">
                        <Link
                            href={`/product/${currentProduct.id}`}
                            className="group relative w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] md:w-[460px] md:h-[460px] mb-6 drop-shadow-2xl transition-all duration-500 ease-in-out"
                        >
                            <Image
                                src={currentProduct.hero_image_url || currentProduct.image_url || "https://placehold.co/600x600?text=Tidak+Ada+Gambar"}
                                alt={currentProduct.name}
                                fill
                                className="object-contain group-hover:scale-105 transition-transform duration-500"
                                priority
                            />
                        </Link>

                        {/* Info produk */}
                        <div className="space-y-1">
                            <h2 className="text-xl md:text-3xl font-bold text-gray-800 uppercase tracking-widest truncate max-w-xs md:max-w-md">
                                {currentProduct.name}
                            </h2>
                            <p className="text-lg md:text-xl font-medium text-gray-500 font-mono">
                                Rp {currentProduct.base_price?.toLocaleString("id-ID")}
                            </p>
                        </div>

                        {/* Pagination dots */}
                        <div className="flex gap-2 mt-6">
                            {heroProducts.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Produk ${index + 1}`}
                                    className={`h-3 rounded-full transition-all duration-300 ${index === activeIndex
                                        ? "bg-gray-800 w-8"
                                        : "bg-gray-300 hover:bg-gray-400 w-3"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* TOMBOL KANAN */}
                    <button
                        onClick={handleNext}
                        className="p-3 rounded-full border border-gray-300 hover:bg-white hover:shadow-lg transition group bg-white/60 backdrop-blur-sm shrink-0"
                        aria-label="Berikutnya"
                    >
                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-black" />
                    </button>
                </div>
            </div>
        </section>
    );
}