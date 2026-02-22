"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, ShoppingCart, Heart, Star } from "lucide-react";
import { marketplaceProducts } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Mock Wishlist Data: Pick a few products
const initialWishlistItems = [
    marketplaceProducts[1], // Lampu
    marketplaceProducts[3], // Sofa Bed
    marketplaceProducts[5], // Lemari
];

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);

    // Remove item handler
    const removeItem = (id: number) => {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center gap-3 mb-8">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Wishlist Saya</h1>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">{wishlistItems.length} Saved</span>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-red-400 fill-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Kosong</h2>
                        <p className="text-gray-500 mb-8 max-w-md">Simpan produk favorit Anda di sini untuk dibeli nanti. Yuk cari barang impianmu!</p>
                        <Link
                            href="/"
                            className="bg-gray-900 text-white py-3 px-8 rounded-full font-bold hover:bg-[#c5a47e] transition-colors shadow-lg hover:shadow-xl hover:shadow-[#c5a47e]/20 inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Cari Produk
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="group relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeItem(item.id);
                                    }}
                                    className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Hapus dari Wishlist"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <Link href={`/product/${item.id}`} className="block">
                                    {/* Image */}
                                    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-6 group-hover:bg-[#F8F8F8] transition-colors">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {/* Tags if needed */}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <span className="text-xs font-bold text-[#c5a47e] uppercase tracking-wider mb-2 block">{item.category}</span>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-[#c5a47e] transition-colors">
                                            {item.name}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center text-yellow-400">
                                                <Star className="w-4 h-4 fill-current" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-lg font-black text-gray-900">
                                                Rp {item.price.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Simulation: Add to Cart */}
                                <Link
                                    href="/cart"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-[#c5a47e] transition-colors shadow-md hover:shadow-lg"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Tambah ke Keranjang
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
