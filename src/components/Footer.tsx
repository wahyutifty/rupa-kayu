import Link from 'next/link';
import {
    Instagram,
    Facebook,
    Youtube,
    Phone,
    MapPin,
    Mail,
    ArrowRight,
    MessageCircle
} from 'lucide-react';

const WA_NUMBER = '6281234567890';

const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Kategori', href: '/category' },
    { label: 'Promo', href: '/#promo' },
    { label: 'Inspirasi Ruang', href: '/#rooms' },
    { label: 'Blog', href: '/blog' },
];

const infoLinks = [
    { label: 'Cara Pemesanan', href: '#' },
    { label: 'Kebijakan Pengiriman', href: '#' },
    { label: 'Garansi Produk', href: '#' },
    { label: 'Kebijakan Privasi', href: '#' },
    { label: 'Syarat & Ketentuan', href: '#' },
];

const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
    return (
        <footer className="bg-stone-900 text-white">

            {/* Top Strip — CTA */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-600">
                <div className="container py-5 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="font-black text-lg leading-tight">Ada pertanyaan soal produk?</p>
                        <p className="text-amber-100 text-sm">Tim kami siap membantu Anda setiap hari 08.00–21.00</p>
                    </div>
                    <a
                        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo Rupa Kayu, saya ingin bertanya 😊')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-amber-700 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-amber-50 transition-colors shadow-lg shrink-0"
                    >
                        <MessageCircle size={16} />
                        Chat WhatsApp
                    </a>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                {/* Brand */}
                <div className="sm:col-span-2 lg:col-span-1">
                    <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-3">
                        RUPA KAYU
                    </h2>
                    <p className="text-stone-400 text-sm leading-relaxed mb-5">
                        Menghadirkan furnitur berkualitas tinggi dengan sentuhan pengrajin lokal terbaik. Desain modern, material premium, harga terjangkau.
                    </p>
                    {/* Social */}
                    <div className="flex items-center gap-3">
                        {socialLinks.map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-amber-600 flex items-center justify-center transition-colors"
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Navigasi */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4">Navigasi</h4>
                    <ul className="space-y-2">
                        {navLinks.map(link => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-stone-400 hover:text-white flex items-center gap-1.5 group transition-colors"
                                >
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Info */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4">Informasi</h4>
                    <ul className="space-y-2">
                        {infoLinks.map(link => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-stone-400 hover:text-white flex items-center gap-1.5 group transition-colors"
                                >
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Kontak */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4">Kontak</h4>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-stone-400">
                            <MapPin size={15} className="text-amber-500 shrink-0 mt-0.5" />
                            <span>Jl. Kayu Manis No. 12, Yogyakarta 55281</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-stone-400">
                            <Phone size={15} className="text-amber-500 shrink-0" />
                            <a href={`tel:+${WA_NUMBER}`} className="hover:text-white transition-colors">+62 812-3456-7890</a>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-stone-400">
                            <Mail size={15} className="text-amber-500 shrink-0" />
                            <a href="mailto:hello@rupakayu.com" className="hover:text-white transition-colors">hello@rupakayu.com</a>
                        </li>
                    </ul>

                    {/* Newsletter mini */}
                    <div className="mt-6">
                        <p className="text-xs text-stone-500 mb-2 font-medium">Dapatkan info promo terbaru:</p>
                        <div className="flex bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="bg-transparent px-4 py-2 text-sm outline-none text-white placeholder:text-stone-500 flex-1 min-w-0"
                            />
                            <button className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 text-xs font-bold shrink-0 transition-colors">
                                Daftar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="container px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-stone-600">
                    <p>© {new Date().getFullYear()} Rupa Kayu Furniture. All rights reserved.</p>
                    <p className="text-stone-700">
                        Dibuat dengan ❤️ untuk pengrajin lokal Indonesia
                    </p>
                </div>
            </div>
        </footer>
    );
}
