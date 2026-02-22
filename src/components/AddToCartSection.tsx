'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, CheckCircle2, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { Product } from '@/lib/types';

const WA_NUMBER = '6281234567890'; // ← Ganti nomor WhatsApp penjual

interface AddToCartSectionProps {
    product: Product;
    variant?: 'light' | 'dark';
}

export default function AddToCartSection({ product, variant = 'light' }: AddToCartSectionProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();
    const router = useRouter();

    const isDark = variant === 'dark';

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity < 1) return;
        addToCart(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity < 1) return;
        addToCart(product, quantity);
        setTimeout(() => router.push('/checkout'), 100);
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const msg = `Halo, saya tertarik dengan produk *${product.name}* (Rp ${product.base_price.toLocaleString('id-ID')}). Apakah masih tersedia? 😊`;
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-col gap-4 mt-auto">
            {/* Pilih Jumlah */}
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 w-fit bg-white/50 backdrop-blur-sm">
                <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-1 text-stone-400 hover:text-amber-600 transition-colors disabled:opacity-30"
                    disabled={quantity <= 1}
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="mx-6 font-bold text-stone-800 min-w-[20px] text-center">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="p-1 text-stone-400 hover:text-amber-600 transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Tombol aksi */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Tambah ke Keranjang */}
                <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 min-h-[50px] px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border w-full ${isAdded
                        ? 'bg-green-600 border-green-600 text-white'
                        : isDark
                            ? 'bg-stone-800 border-stone-700 text-white hover:bg-stone-700'
                            : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                        }`}
                >
                    {isAdded ? (
                        <><CheckCircle2 size={18} /> Ditambahkan!</>
                    ) : (
                        <><ShoppingCart size={18} /> Keranjang</>
                    )}
                </button>

                {/* Beli Sekarang */}
                <button
                    onClick={handleBuyNow}
                    className={`flex-1 min-h-[50px] px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 w-full ${isDark
                        ? 'bg-amber-600 text-white hover:bg-amber-500 hover:shadow-amber-600/20'
                        : 'bg-stone-900 text-white hover:bg-amber-700 hover:shadow-amber-700/20'
                        }`}
                >
                    Beli Sekarang
                </button>
            </div>

            {/* Tombol WhatsApp */}
            <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 font-semibold text-sm group"
            >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                Chat WhatsApp — Tanya Penjual
            </button>

            {/* Stok */}
            {product.stock && (
                <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
                    Stok Tersedia: <span className={`font-bold ${isDark ? 'text-neutral-300' : 'text-gray-900'}`}>{product.stock}</span>
                </p>
            )}
        </div>
    );
}
