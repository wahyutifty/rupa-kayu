"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ArrowLeft, Star, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";

type Promo = {
    id: number;
    title: string;
    description: string;
    discount_percentage?: number;
    amount?: number;
    image_url?: string;
    valid_until?: string;
    product_ids?: number[];
};

export default function PromoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [promo, setPromo] = useState<Promo | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPromoDetails() {
            setLoading(true);
            try {
                // 1. Fetch Promo Details
                const { data: promoData, error: promoError } = await supabase
                    .from("promos")
                    .select("*")
                    .eq("id", resolvedParams.id)
                    .single();

                if (promoError) throw promoError;
                setPromo(promoData);

                // 2. Fetch Associated Products
                if (promoData && promoData.product_ids && promoData.product_ids.length > 0) {
                    const { data: productsData, error: productsError } = await supabase
                        .from("products")
                        .select("*, categories(name)")
                        .in("id", promoData.product_ids);

                    if (productsError) throw productsError;
                    setProducts(productsData || []);
                }
            } catch (error) {
                console.error("Error fetching promo details:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPromoDetails();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (!promo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <p className="text-gray-500">Promo tidak ditemukan atau sudah berakhir.</p>
                <Link href="/" className="text-amber-600 font-bold hover:underline">
                    Kembali ke Beranda
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Promo Banner Section */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-stone-900">
                <Image
                    src={promo.image_url || "https://placehold.co/1200x600?text=Promo+Banner"}
                    alt={promo.title}
                    fill
                    className="object-cover opacity-80"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12 md:pb-24">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 md:mb-8 transition-colors w-fit">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Kembali
                    </Link>

                    <span className="inline-block px-4 py-1.5 bg-red-600 text-white text-xs md:text-sm font-bold rounded-full mb-4 w-fit">
                        {promo.discount_percentage ? `DISKON SPESIAL ${promo.discount_percentage}%` : 'PROMO TERBATAS'}
                    </span>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase leading-tight max-w-4xl">
                        {promo.title}
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
                        {promo.description}
                    </p>

                    {promo.valid_until && (
                        <p className="mt-4 text-sm font-mono text-amber-400">
                            Berlaku sampai: {new Date(promo.valid_until).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>

            {/* Products Grid Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase">
                        Produk Promo Ini
                    </h2>
                    <span className="text-sm text-gray-500">
                        {products.length} Produk Tersedia
                    </span>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400">Tidak ada produk yang tersedia untuk promo ini saat ini.</p>
                        <Link href="/marketplace" className="inline-block mt-4 text-amber-600 font-bold hover:underline">
                            Lihat Produk Lainnya
                        </Link>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
    // Generate dummy rating
    const rating = 4.8;
    const reviews = 12;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group block"
        >
            <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square bg-[#F8F8F8] rounded-[2rem] p-6 mb-4 overflow-hidden transition-all duration-300 group-hover:bg-[#f0f0f0]">

                    {/* Promo Badge */}
                    {product.is_promo && (
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-red-500 text-white px-2 py-1 rounded-md text-[10px] uppercase font-bold shadow-sm animate-pulse">
                                PROMO
                            </span>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 z-10">
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-gray-900 shadow-sm">
                            {/* @ts-ignore: categories is joined */}
                            {product.categories?.name || "Decor"}
                        </span>
                    </div>

                    <div className="relative w-full h-full">
                        <Image
                            src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
                            alt={product.name}
                            fill
                            className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl p-2"
                        />
                    </div>
                </div>

                <div className="px-1">
                    <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-amber-600 transition-colors">
                        {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-gray-900">{rating}</span>
                        <span className="text-[10px] text-gray-400">({reviews})</span>
                    </div>

                    <div className="flex items-end justify-between">
                        {product.landing_content?.original_price && product.landing_content.original_price > product.base_price ? (
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-gray-400 line-through">
                                    Rp {Number(product.landing_content.original_price).toLocaleString('id-ID')}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-lg font-black text-red-600">
                                        Rp {product.base_price.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                                        -{Math.round(((product.landing_content.original_price - product.base_price) / product.landing_content.original_price) * 100)}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-lg font-black text-gray-900">
                                Rp {product.base_price.toLocaleString('id-ID')}
                            </p>
                        )}

                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                            <ShoppingCart className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
