"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    const tax = 0; // Assuming tax included or 0 for now
    const total = totalPrice + tax;

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Keranjang Belanja</h1>
                    <span className="text-gray-500 font-medium">{totalItems} Item</span>
                </div>

                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingCart className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h2>
                        <p className="text-gray-500 mb-8 max-w-md">Sepertinya Anda belum menambahkan produk apapun ke keranjang. Mari mulai belanja sekarang!</p>
                        <Link
                            href="/"
                            className="bg-gray-900 text-white py-3 px-8 rounded-full font-bold hover:bg-[#c5a47e] transition-colors shadow-lg hover:shadow-xl hover:shadow-[#c5a47e]/20 inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                        {/* LEFT: Cart Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.selectedColor}`} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center group hover:border-[#c5a47e]/30 transition-colors">

                                    {/* Image */}
                                    <Link href={`/product/${item.id}`} className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 group-hover:bg-[#F8F8F8] transition-colors">
                                        <Image
                                            src={item.hero_image_url || item.image_url || "https://placehold.co/200x200?text=No+Image"}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                {item.categories && (
                                                    <span className="text-xs font-bold text-[#c5a47e] uppercase tracking-wider mb-1 block">
                                                        {item.categories.name}
                                                    </span>
                                                )}
                                                <Link href={`/product/${item.id}`} className="text-lg font-bold text-gray-900 hover:text-[#c5a47e] transition-colors truncate block">
                                                    {item.name}
                                                </Link>
                                                {item.selectedColor && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                                                        <p className="text-sm text-gray-500 capitalize">{item.selectedColor}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                title="Hapus item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex items-center border border-gray-200 rounded-full px-3 py-1.5 bg-gray-50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 text-gray-500 hover:text-[#c5a47e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="mx-3 font-bold min-w-[20px] text-center text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 text-gray-500 hover:text-[#c5a47e] transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-gray-900">
                                                    Rp {(item.base_price * item.quantity).toLocaleString('id-ID')}
                                                </div>
                                                {item.quantity > 1 && (
                                                    <div className="text-xs text-gray-400">
                                                        @ Rp {item.base_price.toLocaleString('id-ID')} / pcs
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}

                            <Link
                                href="/"
                                className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium mt-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Lanjut Belanja
                            </Link>
                        </div>

                        {/* RIGHT: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Rincian Belanja</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({totalItems} item)</span>
                                        <span className="font-medium">Rp {(totalPrice).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Diskon</span>
                                        <span className="font-medium text-green-600">- Rp 0</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6 mb-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-lg text-gray-900">Total Harga</span>
                                        <span className="font-black text-2xl text-[#c5a47e]">Rp {(total).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 text-right">Belum termasuk ongkos kirim</p>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-[#c5a47e] transition-colors shadow-lg hover:shadow-xl hover:shadow-[#c5a47e]/20 flex justify-center items-center gap-2 block text-center"
                                >
                                    Checkout Sekarang
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <span className="text-xs font-medium text-green-800">Gratis Ongkir untuk pembelian di atas Rp 5jt</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
