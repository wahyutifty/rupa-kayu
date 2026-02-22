"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type RoomType = {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    items?: any[];
};

export default function RoomVisualizer() {
    const [rooms, setRooms] = useState<RoomType[]>([]);
    const [activeRoom, setActiveRoom] = useState<RoomType | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <section className="container py-16 flex justify-center">
                <Loader2 className="animate-spin text-gray-300" />
            </section>
        );
    }

    if (!activeRoom || rooms.length === 0) return null;

    return (
        <section className="container py-16">
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Left: Interactive Room Image */}
                <div className="relative w-full md:w-1/2 min-h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl group bg-gray-100">
                    <Image
                        src={activeRoom.image_url || "https://placehold.co/600x800?text=No+Image"}
                        alt={activeRoom.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay Text */}
                    <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{activeRoom.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {activeRoom.description || "Temukan inspirasi terbaik untuk ruangan Anda."}
                        </p>

                        {/* Navigation Buttons (Optional enhancement: cycle through rooms) */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => {
                                    const currIdx = rooms.findIndex(r => r.id === activeRoom.id);
                                    const prevIdx = currIdx === 0 ? rooms.length - 1 : currIdx - 1;
                                    setActiveRoom(rooms[prevIdx]);
                                }}
                                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    const currIdx = rooms.findIndex(r => r.id === activeRoom.id);
                                    const nextIdx = currIdx === rooms.length - 1 ? 0 : currIdx + 1;
                                    setActiveRoom(rooms[nextIdx]);
                                }}
                                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Room Grid Selection */}
                <div className="w-full md:w-1/2 flex flex-col justify-between h-full min-h-[400px]">

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-4 uppercase tracking-tight text-gray-900">Inspirasi Ruangan</h2>
                        <p className="text-gray-500 max-w-md">
                            Temukan furnitur yang cocok untuk setiap sudut rumah Anda. Pilih ruangan untuk melihat detailnya.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {rooms.slice(0, 4).map((room) => (
                            <div
                                key={room.id}
                                onClick={() => setActiveRoom(room)}
                                className={`cursor-pointer p-3 rounded-xl border transition-all duration-300 group ${activeRoom.id === room.id
                                    ? "border-amber-500 bg-amber-50/50 shadow-md ring-1 ring-amber-500/20"
                                    : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-200">
                                    <Image
                                        src={room.image_url || "https://placehold.co/150x150?text=Room"}
                                        alt={room.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="text-center">
                                    <h4 className="font-bold text-sm truncate text-gray-800">{room.name}</h4>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{room.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 text-sm font-bold border-b-2 border-black pb-1 hover:text-amber-600 hover:border-amber-600 transition-colors flex items-center gap-2 w-fit">
                        LIHAT SEMUA RUANGAN <ArrowUpRight className="w-4 h-4" />
                    </button>

                </div>

            </div>
        </section>
    );
}
