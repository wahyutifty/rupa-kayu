'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingBag, Tag, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/context/CartContext';

export default function MobileTaskbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { totalItems } = useCart();

    // Sembunyikan di halaman admin
    if (pathname?.startsWith('/admin')) return null;

    // Handler khusus untuk Promo — scroll ke section jika sudah di homepage, push ke / jika belum
    const handlePromo = (e: React.MouseEvent) => {
        e.preventDefault();
        if (pathname === '/') {
            // Sudah di homepage — scroll smooth ke section #promo
            const el = document.getElementById('promo');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Halaman lain — navigasi ke homepage dulu, anchor akan dikerjakan setelah load
            router.push('/#promo');
        }
    };

    const navItems = [
        { name: 'Beranda', href: '/', icon: Home, onClick: undefined as any },
        { name: 'Cari', href: '/search', icon: Search, onClick: undefined as any },
        { name: 'Promo', href: '/#promo', icon: Tag, onClick: handlePromo },
        { name: 'Keranjang', href: '/cart', icon: ShoppingBag, onClick: undefined as any },
        { name: 'Artikel', href: '/blog', icon: BookOpen, onClick: undefined as any },
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = item.href === '/#promo'
                        ? false // jangan highlight promo sebagai active route
                        : pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={item.onClick}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                                ? 'text-amber-600'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <div className="relative">
                                <item.icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-600 rounded-full"
                                    />
                                )}
                                {item.name === 'Keranjang' && totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[9px] flex items-center justify-center rounded-full animate-bounce">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium tracking-wide">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
