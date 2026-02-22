'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Tags,
    Menu,
    X,
    LogOut,
    Percent,
    Armchair,
    FileText,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Produk', href: '/admin/products', icon: Package },
    { name: 'Kategori', href: '/admin/categories', icon: Tags },
    { name: 'Promo', href: '/admin/promos', icon: Percent },
    { name: 'Inspirasi Ruang', href: '/admin/rooms', icon: Armchair },
    { name: 'Berita', href: '/admin/posts', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const currentPage = menuItems.find(i => i.href === pathname)?.name || 'Admin Panel';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">

            {/* ══════════════════════════════════════
                DESKTOP SIDEBAR (≥ lg)
            ══════════════════════════════════════ */}
            <aside className="hidden lg:flex w-64 shrink-0 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex-col z-20 shadow-sm">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-700">
                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                        RUPA KAYU
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">Admin Panel</p>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 font-semibold'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-sm">{item.name}</span>
                                {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-gray-100 dark:border-zinc-700">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm">
                        <LogOut size={18} />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* ══════════════════════════════════════
                MOBILE DRAWER OVERLAY (< lg)
            ══════════════════════════════════════ */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                        />
                        {/* Drawer */}
                        <motion.aside
                            key="drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-800 z-50 flex flex-col shadow-2xl lg:hidden"
                        >
                            {/* Header Drawer */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-700">
                                <div>
                                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                                        RUPA KAYU
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">Admin Panel</p>
                                </div>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setDrawerOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-base
                                                ${isActive
                                                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 font-semibold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700/50'
                                                }`}
                                        >
                                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                            <span>{item.name}</span>
                                            {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-3 border-t border-gray-100 dark:border-zinc-700">
                                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                    <LogOut size={20} />
                                    <span>Keluar</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════
                MAIN CONTENT AREA
            ══════════════════════════════════════ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">

                {/* Top Header */}
                <header className="h-14 md:h-16 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between px-4 md:px-6 z-30 sticky top-0 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — hanya tampil di mobile */}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors"
                            aria-label="Buka Menu"
                        >
                            <Menu size={22} />
                        </button>
                        <div>
                            <h2 className="text-base md:text-lg font-semibold leading-tight">{currentPage}</h2>
                            <p className="text-[10px] text-gray-400 hidden md:block">Rupa Kayu Admin</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors border border-gray-200 hover:border-amber-200"
                        >
                            Lihat Toko ↗
                        </Link>
                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm border border-amber-200 dark:border-amber-700">
                            A
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto overscroll-contain">
                    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
                        {children}
                    </div>
                </main>

                {/* ══════════════════════════════════════
                    MOBILE BOTTOM NAV BAR (< lg)
                ══════════════════════════════════════ */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 flex items-stretch shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
                    {/* Tampilkan 5 menu pertama di bottom bar */}
                    {menuItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-w-0
                                    ${isActive
                                        ? 'text-amber-700 dark:text-amber-400'
                                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {/* Active indicator line */}
                                <div className={`absolute top-0 transition-all duration-300 h-0.5 w-8 rounded-full ${isActive ? 'bg-amber-600' : 'bg-transparent'}`} />
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className={`text-[9px] font-medium truncate w-full text-center ${isActive ? 'font-bold' : ''}`}>
                                    {item.name.split(' ')[0]}
                                </span>
                            </Link>
                        );
                    })}
                    {/* More button — buka drawer */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-400 hover:text-gray-700"
                    >
                        <Menu size={20} strokeWidth={1.8} />
                        <span className="text-[9px] font-medium">Lainnya</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
