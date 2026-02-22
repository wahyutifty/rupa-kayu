'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// ⬇️ Ganti nomor WhatsApp penjual di sini (format: kode negara tanpa +)
const WA_NUMBER = '6281234567890';
const WA_MESSAGE = 'Halo, saya ingin bertanya tentang produk Rupa Kayu 😊';

export default function WhatsAppButton() {
    const [showTooltip, setShowTooltip] = useState(false);
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();

    // Jangan tampilkan di halaman admin
    const isAdmin = pathname?.startsWith('/admin');

    useEffect(() => {
        // Tampilkan setelah 1.5 detik agar tidak mengganggu first impression
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isAdmin) return null;

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50"
                >
                    {/* Tooltip */}
                    <AnimatePresence>
                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-16 bottom-1 bg-white dark:bg-zinc-800 shadow-xl rounded-2xl px-4 py-3 w-52 border border-gray-100 dark:border-zinc-700 pointer-events-none"
                            >
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Chat Penjual</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ada pertanyaan soal produk? Kami siap membantu! 😊</p>
                                {/* Arrow */}
                                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-zinc-800 border-r border-t border-gray-100 dark:border-zinc-700 rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Button */}
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onFocus={() => setShowTooltip(true)}
                        onBlur={() => setShowTooltip(false)}
                        aria-label="Chat via WhatsApp"
                        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl shadow-green-500/30 bg-[#25D366] hover:bg-[#20ba5a] transition-colors duration-300 group"
                    >
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 group-hover:opacity-0 transition-opacity" />

                        {/* WhatsApp SVG icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            className="w-7 h-7 fill-white"
                        >
                            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.82.736 5.461 2.018 7.758L0 32l8.473-2C10.693 31.3 13.296 32 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333c-2.485 0-4.832-.643-6.873-1.77l-.493-.285-5.028 1.182 1.243-4.895-.32-.508A13.265 13.265 0 0 1 2.667 16C2.667 8.637 8.636 2.667 16 2.667c7.362 0 13.333 5.97 13.333 13.333S23.362 29.333 16 29.333zm7.302-9.848c-.4-.2-2.368-1.168-2.736-1.3-.368-.133-.636-.2-.904.2-.267.4-1.035 1.3-1.27 1.567-.233.268-.467.3-.867.1-.4-.2-1.688-.622-3.214-1.981-1.188-1.06-1.99-2.368-2.224-2.768-.233-.4-.025-.617.175-.817.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.903-2.18-1.237-2.98-.326-.78-.657-.675-.903-.687-.234-.011-.5-.014-.768-.014s-.7.1-1.067.5c-.367.4-1.4 1.367-1.4 3.333s1.433 3.867 1.633 4.133c.2.267 2.82 4.3 6.833 6.033 4.013 1.733 4.013 1.155 4.733 1.083.72-.067 2.368-.967 2.702-1.9.333-.933.333-1.733.233-1.9-.1-.167-.367-.267-.767-.467z" />
                        </svg>
                    </a>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
