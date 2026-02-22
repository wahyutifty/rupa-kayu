"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";

export default function Marketplace() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select(`
                        *,
                        categories (
                            name
                        )
                    `)
                    // .eq('is_hero', false) // Use this if you want to exclude hero products
                    .order("created_at", { ascending: false });

                if (error) {
                    throw error;
                }

                if (data) {
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <span className="text-[#c5a47e] text-xs font-bold tracking-widest uppercase bg-[#c5a47e]/10 px-3 py-1 rounded-full">
                        Koleksi Kami
                    </span>
                    <h2 className="text-4xl font-black mt-4 mb-2 uppercase tracking-tight text-gray-900">
                        Marketplace
                    </h2>
                    <p className="text-gray-500">
                        Pilihan produk terbaik untuk keindahan ruangan Anda
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">Belum ada produk yang tersedia saat ini.</p>
                    </div>
                )}

                {/* Product Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {products.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                )}

                {/* Pagination (Mock - can be implemented later) */}
                {!loading && products.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-16">
                        <button className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">
                            &larr; Sebelumnya
                        </button>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white text-xs font-bold rounded-lg shadow-md">
                                1
                            </button>
                            {/* <button className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                2
                            </button> */}
                        </div>
                        <button className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
                            Berikutnya &rarr;
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
    const rating = 4.8;
    const reviews = 12;
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
        >
            <div className="block">
                <Link href={`/product/${product.id}`}>
                    {/* Image Container */}
                    <div className="relative bg-[#F8F8F8] rounded-2xl md:rounded-[2rem] p-4 md:p-8 mb-4 md:mb-6 overflow-hidden transition-all duration-300 group-hover:bg-[#f0f0f0] aspect-square">

                        {/* Promo Badge */}
                        {product.is_promo && (
                            <div className="absolute top-2 left-2 md:top-6 md:left-6 z-10">
                                <span className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-md animate-pulse">
                                    PROMO
                                </span>
                            </div>
                        )}

                        {/* Category Tag */}
                        <div className="absolute top-2 right-2 md:top-6 md:right-6 z-10">
                            <span className="bg-white/80 backdrop-blur-sm px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold text-gray-900 shadow-sm">
                                {/* @ts-ignore: categories is joined */}
                                {product.categories?.name || "Decor"}
                            </span>
                        </div>

                        {/* Image */}
                        <div className="relative w-full h-full">
                            <Image
                                src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
                                alt={product.name}
                                fill
                                className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-1 md:px-2">
                        <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2 truncate group-hover:text-[#c5a47e] transition-colors">
                            {product.name}
                        </h3>

                        <div className="flex items-center justify-between mb-2 md:mb-6">
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="flex items-center text-yellow-400">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                                </div>
                                <span className="text-xs md:text-sm font-bold text-gray-900">{rating}</span>
                                <span className="hidden md:inline text-[10px] md:text-xs text-gray-400 font-medium">
                                    ({reviews} Ulasan)
                                </span>
                            </div>

                            {/* Price Section */}
                            <div className="text-right">
                                {product.landing_content?.original_price && product.landing_content.original_price > product.base_price ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] md:text-xs text-gray-400 line-through font-medium">
                                            Rp {Number(product.landing_content.original_price).toLocaleString('id-ID')}
                                        </span>
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <span className="text-[10px] md:text-xs font-bold text-red-500 bg-red-100 px-1 py-0.5 md:px-1.5 rounded-md">
                                                -{Math.round(((product.landing_content.original_price - product.base_price) / product.landing_content.original_price) * 100)}%
                                            </span>
                                            <p className="text-sm md:text-lg font-black text-red-600">
                                                Rp {product.base_price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm md:text-lg font-black text-gray-900">
                                        Rp {product.base_price.toLocaleString('id-ID')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Tombol Aksi */}
                <div className="px-1 md:px-2 grid grid-cols-2 gap-2 md:gap-3">
                    <button
                        onClick={handleAddToCart}
                        className={`flex items-center justify-center gap-1 md:gap-2 py-2 px-2 md:py-3 md:px-4 rounded-full border text-[10px] md:text-sm font-bold transition-all ${isAdded
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        {isAdded ? (
                            <><CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /> Ditambahkan!</>
                        ) : (
                            <><ShoppingCart className="w-3 h-3 md:w-4 md:h-4" /> Keranjang</>
                        )}
                    </button>
                    <Link href={`/product/${product.id}`} className="flex items-center justify-center py-2 px-2 md:py-3 md:px-4 rounded-full bg-gray-900 text-white text-[10px] md:text-sm font-bold hover:bg-[#c5a47e] transition-colors shadow-lg hover:shadow-xl hover:shadow-[#c5a47e]/20">
                        Lihat Detail
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
