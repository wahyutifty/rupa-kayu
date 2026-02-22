import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 — Halaman Tidak Ditemukan | Rupa Kayu',
    description: 'Halaman yang Anda cari tidak ditemukan.',
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-center px-4">
            {/* Big number */}
            <div className="relative mb-6">
                <span className="text-[10rem] md:text-[14rem] font-black text-stone-100 leading-none select-none">
                    404
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">🪑</div>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-stone-800 mb-3">
                Halaman Tidak Ditemukan
            </h1>
            <p className="text-stone-500 max-w-sm mb-8 text-sm leading-relaxed">
                Sepertinya furnitur yang Anda cari sudah pindah ke tempat lain, atau URL-nya tidak tepat.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    href="/"
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors shadow-lg hover:shadow-amber-500/20"
                >
                    Kembali ke Beranda
                </Link>
                <Link
                    href="/search"
                    className="px-6 py-3 border border-stone-200 hover:border-amber-400 text-stone-700 rounded-xl font-semibold transition-colors hover:bg-amber-50"
                >
                    Cari Produk
                </Link>
            </div>

            <p className="mt-12 text-xs text-stone-300 font-medium tracking-widest uppercase">
                Rupa Kayu · Premium Furniture
            </p>
        </div>
    );
}
