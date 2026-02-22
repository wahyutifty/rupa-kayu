"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
    const [activeImage, setActiveImage] = useState(0);

    const prevImage = () => {
        setActiveImage((curr) => (curr === 0 ? images.length - 1 : curr - 1));
    };

    const nextImage = () => {
        setActiveImage((curr) => (curr === images.length - 1 ? 0 : curr + 1));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square bg-[#F8F8F8] rounded-3xl overflow-hidden group">
                <Image
                    src={images[activeImage]}
                    alt={name}
                    fill
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Navigation Buttons (Appear on Hover) */}
                {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === activeImage ? 'bg-gray-800 w-4' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all snap-center ${idx === activeImage ? "border-gray-900 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                                }`}
                        >
                            <Image src={img} alt={`${name} thumbnail ${idx}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
