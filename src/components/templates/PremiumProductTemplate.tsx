'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowDown, ShieldCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import AddToCartSection from '@/components/AddToCartSection';
import RelatedProducts from '@/components/RelatedProducts';
import { Product } from '@/lib/types';
import { useRef, useState, useEffect } from 'react';

export default function PremiumProductTemplate({ product }: { product: Product }) {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: targetRef });

    // Gabungkan Foto Utama (image_url) dan Foto Galeri (images)
    const allImages = [
        product.image_url,
        ...(product.images || [])
    ].filter(Boolean) as string[];

    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = allImages.length;

    // Auto slide
    useEffect(() => {
        if (totalSlides <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % totalSlides);
        }, 5000);
        return () => clearInterval(interval);
    }, [totalSlides]);

    const goNext = () => setCurrentSlide(prev => (prev + 1) % totalSlides);
    const goPrev = () => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);

    // Parallax
    const textParallax = useTransform(scrollYProgress, [0, 0.4], [0, 80]);

    const landing = product.landing_content || {};
    const photoDescriptionsRaw: any[] = landing.photo_descriptions || [];

    // Buat mapping: gallery_index -> desc
    // gallery_index: -1 = foto utama (allImages[0]), 0 = galeri ke-1 (allImages[1]), dst.
    const descMap: Record<number, string> = {};
    for (const pd of photoDescriptionsRaw) {
        if (typeof pd.gallery_index === 'number' && pd.desc) {
            descMap[pd.gallery_index] = pd.desc;
        }
    }

    // Konversi ke array final: gabungkan foto + deskripsinya
    // allImages[0] = foto utama → gallery_index -1
    // allImages[1] = galeri 1  → gallery_index  0
    // allImages[2] = galeri 2  → gallery_index  1
    // dst.
    const finalPhotoDescriptions = allImages
        .map((img, idx) => {
            const galleryIndex = idx - 1; // foto utama = -1, galeri pertama = 0
            const desc = descMap[galleryIndex];
            return desc ? { image: img, desc } : null;
        })
        .filter(Boolean) as { image: string; desc: string }[];

    // Tambahkan data lama (manual, punya field image & tidak punya gallery_index)
    const legacyDescriptions = photoDescriptionsRaw.filter(
        (d: any) => d.image && d.gallery_index === undefined && d.desc
    );

    const allPhotoDescriptions = [...finalPhotoDescriptions, ...legacyDescriptions];

    const specs = landing.specs || [];
    const dimensions = product.dimensions;

    return (
        <div ref={targetRef} className="bg-stone-50 min-h-screen text-stone-800 font-serif selection:bg-amber-100 selection:text-amber-900 pb-32">

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: 'circOut' }}
                className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)' }}
            >
                <Link href="/" className="text-white font-bold tracking-tighter text-2xl flex items-center gap-2 hover:opacity-70 transition-opacity drop-shadow">
                    <ArrowLeft className="w-6 h-6" />
                    <span className="hidden md:inline font-sans">RUPA KAYU.</span>
                </Link>
                <div className="hidden md:flex gap-8 text-sm font-sans font-medium tracking-widest uppercase text-white/80">
                    <a href="#story" className="hover:text-amber-400 transition-colors">Story</a>
                    <a href="#gallery" className="hover:text-amber-400 transition-colors">Gallery</a>
                    <a href="#specs" className="hover:text-amber-400 transition-colors">Specs</a>
                </div>
            </motion.nav>

            {/* ═══════════════════════════════════════════ */}
            {/* HERO — slide semua foto galeri */}
            {/* ═══════════════════════════════════════════ */}
            <section id="hero" className="relative h-screen overflow-hidden flex flex-col items-center justify-center bg-stone-900">
                {/* Slider Images */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.06 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: 'easeInOut' }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={allImages[currentSlide]}
                                alt={`Slide ${currentSlide + 1}`}
                                fill
                                className="object-cover opacity-65"
                                priority={currentSlide === 0}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Prev / Next arrows */}
                {totalSlides > 1 && (
                    <>
                        <button onClick={goPrev} className="absolute left-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all border border-white/20">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={goNext} className="absolute right-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all border border-white/20">
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Hero Text */}
                <motion.div
                    style={{ y: textParallax }}
                    className="relative z-10 text-center max-w-4xl px-4 mt-20"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-8xl font-bold mb-4 text-stone-100 tracking-tight leading-tight drop-shadow-lg">
                            {product.name}
                        </h1>
                        <p className="text-xl md:text-2xl text-stone-300 italic font-light drop-shadow-md mb-10">
                            {landing.tagline || 'Kehangatan alami untuk ruang hidup Anda.'}
                        </p>

                        {/* Slide Indicators */}
                        {totalSlides > 1 && (
                            <div className="flex justify-center gap-2">
                                {allImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-10 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute bottom-10 z-10 flex flex-col items-center gap-1"
                >
                    <span className="text-white/40 text-xs font-sans tracking-widest uppercase">Scroll</span>
                    <ArrowDown className="w-6 h-6 text-white/40" />
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* STORY / PHILOSOPHY */}
            {/* ═══════════════════════════════════════════ */}
            {(landing.story_title || landing.story_text || product.description) && (
                <section id="story" className="py-32 px-6 md:px-24 bg-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-amber-50/50 -z-0" />
                    <div className="max-w-4xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-10%' }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="block text-amber-700 font-sans font-bold tracking-widest text-xs uppercase mb-6">The Philosophy</span>
                            <h2 className="text-3xl md:text-5xl font-medium leading-tight mb-8 text-stone-800">
                                {landing.story_title || 'Dibuat dengan tangan, dirancang dengan hati.'}
                            </h2>
                            <div className="h-px w-24 bg-amber-700 mb-8" />
                            <p className="text-lg md:text-2xl text-stone-600 leading-relaxed font-light">
                                {landing.story_text || product.description}
                            </p>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* FOTO + DESKRIPSI — bergantian kiri/kanan */}
            {/* ═══════════════════════════════════════════ */}
            {allPhotoDescriptions.length > 0 && (
                <section id="gallery" className="bg-stone-50">
                    {allPhotoDescriptions.map((item: any, index: number) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div
                                key={index}
                                className="min-h-[70vh] flex items-center justify-center sticky top-0 bg-stone-50 border-t border-stone-200 overflow-hidden"
                            >
                                <div className={`container mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-0 items-center h-full`}>
                                    {/* Image */}
                                    <motion.div
                                        initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: '-5%' }}
                                        transition={{ duration: 0.9, ease: 'easeOut' }}
                                        className={`${isEven ? '' : 'md:order-2'} relative aspect-[4/3] md:aspect-square overflow-hidden`}
                                    >
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={`Foto Produk ${index + 1}`}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 text-lg">
                                                Foto {index + 1}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Deskripsi */}
                                    <motion.div
                                        initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: '-5%' }}
                                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                                        className={`${isEven ? '' : 'md:order-1'} flex flex-col justify-center px-8 md:px-16 py-16 md:py-0`}
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="text-7xl font-black text-stone-100 font-sans leading-none">
                                                0{index + 1}
                                            </span>
                                            <div className="h-px flex-1 bg-stone-200" />
                                        </div>
                                        <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-light">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* SPECS & DIMENSIONS + PURCHASE CARD */}
            {/* ═══════════════════════════════════════════ */}
            <section id="specs" className="py-24 bg-white text-stone-900 relative z-10">
                <div className="container mx-auto px-6 md:px-24">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16 lg:gap-24 items-start">

                        {/* Left: Specs & Dimensions */}
                        <div>
                            {specs.length > 0 && (
                                <>
                                    <h2 className="text-4xl font-serif font-medium mb-12 text-stone-900">Spesifikasi Detail</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-16">
                                        {specs.map((spec: any, i: number) => (
                                            <div key={i} className="flex flex-col border-b border-stone-200 pb-4 group hover:border-amber-500 transition-colors">
                                                <span className="text-stone-400 font-sans tracking-widest uppercase text-xs mb-2 group-hover:text-amber-600 transition-colors">{spec.label}</span>
                                                <span className="font-serif text-xl md:text-2xl text-stone-800">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Dimensions */}
                            {dimensions && Object.values(dimensions).some(v => v) && (
                                <div className="mb-12">
                                    <h3 className="text-xl font-serif font-medium mb-6 text-stone-700">Dimensi Produk</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[
                                            { key: 'panjang', label: 'Panjang', unit: 'cm' },
                                            { key: 'lebar', label: 'Lebar', unit: 'cm' },
                                            { key: 'tinggi', label: 'Tinggi', unit: 'cm' },
                                            { key: 'berat', label: 'Berat', unit: 'kg' },
                                        ].map(({ key, label, unit }) => {
                                            const val = (dimensions as any)[key];
                                            if (!val) return null;
                                            return (
                                                <div key={key} className="bg-stone-50 rounded-2xl p-5 text-center border border-stone-100">
                                                    <span className="block text-2xl font-bold text-stone-800 font-sans">{val}</span>
                                                    <span className="block text-xs text-stone-400 font-sans tracking-widest uppercase mt-1">{label} ({unit})</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quote */}
                            <div className="flex gap-4 items-start opacity-70">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0 mt-1" />
                                <p className="text-lg font-light italic text-stone-600">
                                    "Investasi terbaik untuk kenyamanan dan estetika rumah Anda yang bertahan seumur hidup."
                                </p>
                            </div>
                        </div>

                        {/* ══════════════════════════════ */}
                        {/* Right: Purchase Card          */}
                        {/* Tombol keranjang ghost/hover  */}
                        {/* ══════════════════════════════ */}
                        <div className="lg:sticky lg:top-32">
                            <div className="bg-stone-50 p-8 md:p-10 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50">
                                <div className="mb-8">
                                    <span className="text-amber-600 font-sans font-bold tracking-widest text-xs uppercase mb-2 block">Premium Collection</span>
                                    <h3 className="text-3xl md:text-4xl font-serif font-medium mb-6 text-stone-900 leading-tight">{product.name}</h3>

                                    {/* Price */}
                                    {landing.original_price && landing.original_price > product.base_price ? (
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-stone-400 line-through text-xl font-serif">
                                                    Rp {landing.original_price.toLocaleString('id-ID')}
                                                </span>
                                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    -{Math.round(((landing.original_price - product.base_price) / landing.original_price) * 100)}%
                                                </span>
                                            </div>
                                            <span className="text-4xl md:text-5xl font-light text-red-600">
                                                Rp {product.base_price.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-4xl md:text-5xl font-light text-stone-900">
                                            Rp {product.base_price.toLocaleString('id-ID')}
                                        </span>
                                    )}
                                </div>

                                <p className="text-stone-400 text-sm leading-relaxed mb-8">
                                    Gratis pengiriman untuk wilayah Jawa & Bali. Garansi resmi untuk kerusakan struktur kayu.
                                </p>

                                {/* ── Tombol Keranjang: Tetap terlihat tapi subtle (menyatu) ── */}
                                <div className="border-t border-stone-200 pt-8">
                                    <div className="opacity-70 hover:opacity-100 transition-all duration-500 ease-out transform hover:-translate-y-1">
                                        <AddToCartSection product={product} variant="dark" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-stone-300 text-[10px] uppercase tracking-widest mt-8 font-sans">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Safe & Secure Transaction</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            <RelatedProducts
                currentProductId={product.id}
                categoryId={product.category_id}
            />

        </div>
    );
}
