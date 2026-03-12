"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { ArrowUpRight, Loader2 } from "lucide-react";

type Room = {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
};

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRooms() {
            try {
                const { data, error } = await supabase
                    .from("rooms")
                    .select("*")
                    .order("created_at", { ascending: false });
                if (error) throw error;
                setRooms(data || []);
            } catch (err) {
                console.error("Error fetching rooms:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRooms();
    }, []);

    return (
        <>
            <Header />
            <main className="pt-20 min-h-screen bg-gray-50">
                {/* Hero */}
                <section className="bg-[#1a1a1a] text-white py-20 px-4">
                    <div className="container mx-auto text-center">
                        <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Inspirasi Ruangan</p>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">Setiap Ruangan,<br />Cerita yang Berbeda</h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">
                            Temukan inspirasi tata ruang untuk setiap sudut rumah Anda, dilengkapi furnitur pilihan terbaik kami.
                        </p>
                    </div>
                </section>

                {/* Rooms Grid */}
                <section className="container mx-auto px-4 py-16">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <p className="text-lg">Belum ada inspirasi ruangan tersedia.</p>
                            <p className="text-sm mt-2">Silakan cek kembali soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                                >
                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                        <Image
                                            src={room.image_url || "https://placehold.co/600x400/c5a47e/fff?text=Room"}
                                            alt={room.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h2>
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                                            {room.description || "Temukan inspirasi furnitur untuk ruangan ini."}
                                        </p>
                                        <Link
                                            href={`/shop?room=${room.id}`}
                                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                                        >
                                            Lihat Produk <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}
