"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type PromoType = {
    id: number;
    title: string;
    description: string;
    discount_percentage?: number;
    amount?: number;
    image_url?: string;
    valid_until?: string;
};

export default function Promo() {
    const [promos, setPromos] = useState<PromoType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPromos() {
            try {
                const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
                const { data, error } = await supabase
                    .from('promos')
                    .select('*')
                    .or(`valid_until.is.null,valid_until.gte.${today}`)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setPromos(data || []);
            } catch (error) {
                console.error("Error fetching promos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPromos();
    }, []);

    if (loading) {
        return (
            <section id="promo" className="py-24 px-4 container flex justify-center">
                <Loader2 className="animate-spin text-gray-300" />
            </section>
        );
    }

    if (promos.length === 0) return null;

    return (
        <section id="promo" className="container py-24 px-4">
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
                <h2 className="text-4xl font-black uppercase tracking-wide text-gray-900 border-l-4 border-amber-600 pl-4">
                    Promo Spesial
                </h2>
                <span className="text-sm text-gray-400 hidden md:block">{promos.length} promo aktif</span>
            </div>

            {/* ══════════════════════════════════════════════
                Pinterest / Masonry Grid
                Menggunakan CSS columns — paling reliable
                Foto menyesuaikan tinggi aslinya
            ══════════════════════════════════════════════ */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0">
                {promos.map((promo, i) => (
                    <motion.div
                        key={promo.id}
                        className="break-inside-avoid mb-4 block"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: i * 0.06 }}
                    >
                        <Link
                            href={`/promo/${promo.id}`}
                            className="group relative block rounded-2xl overflow-hidden bg-stone-100 shadow-sm hover:shadow-xl transition-shadow duration-500"
                        >
                            {/* Gambar — pakai tag img biasa agar tinggi otomatis sesuai proporsi asli */}
                            {promo.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={promo.image_url}
                                    alt={promo.title}
                                    className="w-full h-auto block group-hover:scale-105 transition-transform duration-700 object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full aspect-[4/5] bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center text-stone-300 text-4xl">
                                    🏷️
                                </div>
                            )}

                            {/* Overlay gradient dari bawah */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 via-black/25 to-transparent">
                                {/* Badge */}
                                {promo.discount_percentage ? (
                                    <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-[11px] font-black rounded-full mb-1.5 tracking-wide shadow">
                                        -{promo.discount_percentage}% OFF
                                    </span>
                                ) : promo.amount ? (
                                    <span className="inline-block px-2 py-0.5 bg-amber-500 text-white text-[11px] font-black rounded-full mb-1.5 shadow">
                                        Hemat Rp {promo.amount.toLocaleString('id-ID')}
                                    </span>
                                ) : null}

                                {/* Judul */}
                                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                                    {promo.title}
                                </h3>

                                {/* Tanggal */}
                                {promo.valid_until && (
                                    <p className="text-[10px] text-white/50 mt-0.5">
                                        s/d {new Date(promo.valid_until).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
