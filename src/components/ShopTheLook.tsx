"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Loader2, ShoppingBag, X, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Room, Product } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function ShopTheLook() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [roomProducts, setRoomProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchRooms() {
            try {
                const { data, error } = await supabase
                    .from('rooms')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    setRooms(data);
                    setActiveRoom(data[0]);
                }
            } catch (error: any) {
                console.error("Error fetching rooms:", error?.message || error?.details || error?.hint || JSON.stringify(error));
            } finally {
                setLoading(false);
            }
        }
        fetchRooms();
    }, []);

    useEffect(() => {
        if (!activeRoom || !activeRoom.items || activeRoom.items.length === 0) {
            setRoomProducts([]);
            return;
        }

        async function fetchRoomProducts() {
            setLoadingProducts(true);
            try {
                const productIds = activeRoom?.items as number[];

                if (productIds && productIds.length > 0) {
                    const { data, error } = await supabase
                        .from('products')
                        .select(`
                            *,
                            categories (
                                name
                            )
                        `)
                        .in('id', productIds);

                    if (error) throw error;
                    setRoomProducts(data as Product[] || []);
                } else {
                    setRoomProducts([]);
                }

            } catch (error: any) {
                console.error("Error fetching room products:", error?.message || error?.details || error?.hint || JSON.stringify(error));
            } finally {
                setLoadingProducts(false);
            }
        }

        fetchRoomProducts();
    }, [activeRoom]);

    // Close modal on ESC key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowModal(false);
        };
        if (showModal) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [showModal]);

    const handleNextRoom = () => {
        if (!activeRoom) return;
        const currIdx = rooms.findIndex(r => r.id === activeRoom.id);
        const nextIdx = currIdx === rooms.length - 1 ? 0 : currIdx + 1;
        setActiveRoom(rooms[nextIdx]);
    };

    const handlePrevRoom = () => {
        if (!activeRoom) return;
        const currIdx = rooms.findIndex(r => r.id === activeRoom.id);
        const prevIdx = currIdx === 0 ? rooms.length - 1 : currIdx - 1;
        setActiveRoom(rooms[prevIdx]);
    };

    if (loading) {
        return (
            <section className="container mx-auto py-24 flex justify-center">
                <Loader2 className="animate-spin text-gray-300 w-8 h-8" />
            </section>
        );
    }

    if (!activeRoom || rooms.length === 0) return null;

    return (
        <>
            <section className="py-24 bg-white text-gray-900 overflow-hidden relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-50/50 -z-10" />

                <div className="container mx-auto px-4 md:px-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <span className="block text-amber-600 font-bold tracking-widest text-xs uppercase mb-2">Interactive Showroom</span>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
                                Shop The Look
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                        {/* Left: Room Image & Nav */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <motion.div
                                key={activeRoom.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full aspect-[3/4] md:aspect-[4/3] lg:aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl group"
                            >
                                <Image
                                    src={activeRoom.image_url || "https://placehold.co/800x1200?text=Room+Inspiration"}
                                    alt={activeRoom.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    priority
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{activeRoom.name}</h3>
                                    <p className="text-gray-200 line-clamp-2 max-w-md text-sm md:text-base opacity-90">
                                        {activeRoom.description}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Room Navigation */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
                                    <button
                                        onClick={handlePrevRoom}
                                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                        aria-label="Previous Room"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <span className="text-xs font-bold text-gray-400 w-20 text-center uppercase tracking-wider">
                                        {rooms.findIndex(r => r.id === activeRoom.id) + 1} / {rooms.length}
                                    </span>
                                    <button
                                        onClick={handleNextRoom}
                                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                        aria-label="Next Room"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-400 italic hidden sm:block">
                                    Geser untuk melihat ruangan lain
                                </p>
                            </div>
                        </div>

                        {/* Right: Products Info & Grid */}
                        <div className="w-full lg:w-1/2 flex flex-col h-full min-h-[600px]">

                            <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 z-0" />
                                <div className="relative z-10">
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                                        Inspirasi {activeRoom.name}
                                    </h4>
                                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                                        {activeRoom.description || "Wujudkan ruangan impian Anda dengan kurasi produk pilihan kami yang ada di dalam foto ini."}
                                    </p>
                                    {/* ✅ TOMBOL FUNGSIONAL — membuka modal */}
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="text-amber-600 font-bold text-xs uppercase tracking-wider flex items-center hover:text-amber-700 transition-colors group"
                                    >
                                        Lihat Detail Konsep <ArrowUpRight className="ml-1 w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                                        Produk dalam ruangan ini
                                    </h5>
                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                        {roomProducts.length} Items
                                    </span>
                                </div>

                                {loadingProducts ? (
                                    <div className="grid grid-cols-2 gap-4 h-64">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-xl h-full"></div>
                                        ))}
                                    </div>
                                ) : roomProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <AnimatePresence mode="popLayout">
                                            {roomProducts.map((product) => (
                                                <motion.div
                                                    key={product.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="group bg-white dark:bg-zinc-800 rounded-xl p-3 border border-gray-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-lg relative"
                                                >
                                                    <Link href={`/product/${product.id}`} className="block h-full">
                                                        <div className="relative aspect-square mb-3 bg-gray-50 dark:bg-zinc-900 rounded-lg overflow-hidden">
                                                            <Image
                                                                src={product.image_url || "https://placehold.co/200x200?text=No+Image"}
                                                                alt={product.name}
                                                                fill
                                                                className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>

                                                        <div className="mb-2">
                                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                                                                {/* @ts-ignore */}
                                                                {product.categories?.name || 'Furniture'}
                                                            </span>
                                                            <h6 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-amber-600 transition-colors">
                                                                {product.name}
                                                            </h6>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                                                Rp {(product.base_price / 1000).toLocaleString('id-ID')}k
                                                            </span>
                                                            <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                                <ShoppingBag size={10} />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                                        <p className="text-gray-400 font-medium text-sm mb-2">Belum ada produk terhubung</p>
                                        <p className="text-gray-300 text-xs max-w-xs">
                                            Hubungkan produk dengan ruangan ini melalui halaman Admin Panel.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700 flex justify-center lg:justify-start">
                                <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:text-amber-600 transition-colors">
                                    LIHAT SEMUA KOLEKSI <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== MODAL DETAIL KONSEP ===== */}
            <AnimatePresence>
                {showModal && activeRoom && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        />

                        {/* Modal Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.96 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-50 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header: Large Room Image */}
                            <div className="relative h-56 md:h-72 w-full flex-shrink-0">
                                <Image
                                    src={activeRoom.image_url || "https://placehold.co/800x400?text=Room+Inspiration"}
                                    alt={activeRoom.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {/* Close Button */}
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
                                    aria-label="Tutup modal"
                                >
                                    <X size={18} />
                                </button>

                                {/* Room Title Overlay */}
                                <div className="absolute bottom-6 left-6 right-16 text-white">
                                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1 block">Detail Konsep Ruangan</span>
                                    <h3 className="text-2xl md:text-3xl font-black">{activeRoom.name}</h3>
                                </div>
                            </div>

                            {/* Modal Body: Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">

                                {/* Description */}
                                {activeRoom.description && (
                                    <div className="mb-8">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Tentang Konsep Ini</h4>
                                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                            {activeRoom.description}
                                        </p>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t border-gray-100 mb-8" />

                                {/* Products Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600">
                                            Produk dalam Konsep Ini
                                        </h4>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                            {roomProducts.length} Item
                                        </span>
                                    </div>

                                    {loadingProducts ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-48" />
                                            ))}
                                        </div>
                                    ) : roomProducts.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {roomProducts.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.id}`}
                                                    onClick={() => setShowModal(false)}
                                                    className="group bg-gray-50 hover:bg-amber-50 rounded-2xl p-4 border border-gray-100 hover:border-amber-200 transition-all hover:shadow-md"
                                                >
                                                    <div className="relative aspect-square mb-3 bg-white rounded-xl overflow-hidden">
                                                        <Image
                                                            src={product.image_url || "https://placehold.co/200x200?text=No+Image"}
                                                            alt={product.name}
                                                            fill
                                                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                                                            {/* @ts-ignore */}
                                                            {product.categories?.name || 'Furniture'}
                                                        </span>
                                                        <h6 className="font-bold text-gray-900 text-sm truncate group-hover:text-amber-600 transition-colors">
                                                            {product.name}
                                                        </h6>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-sm font-black text-gray-900">
                                                                Rp {product.base_price.toLocaleString('id-ID')}
                                                            </span>
                                                            <ExternalLink size={12} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                            <ShoppingBag className="w-8 h-8 text-gray-300 mb-3" />
                                            <p className="text-gray-400 font-medium text-sm">Belum ada produk terhubung</p>
                                            <p className="text-gray-300 text-xs mt-1 max-w-xs">
                                                Hubungkan produk dengan ruangan ini melalui Admin Panel.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors px-4 py-2"
                                >
                                    Tutup
                                </button>
                                <Link
                                    href="/shop"
                                    onClick={() => setShowModal(false)}
                                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
                                >
                                    Belanja Sekarang <ShoppingBag size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
