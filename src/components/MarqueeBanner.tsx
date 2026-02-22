"use client";

const items = [
    { text: "Harga Terjangkau", icon: "✦" },
    { text: "Bahan Berkualitas", icon: "✦" },
    { text: "Pengrajin Lokal Terbaik", icon: "✦" },
    { text: "Terpercaya", icon: "✦" },
    { text: "Pengiriman Cepat", icon: "✦" },
    { text: "Garansi Produk", icon: "✦" },
    { text: "Desain Modern", icon: "✦" },
    { text: "Customisasi Tersedia", icon: "✦" },
];

// Duplicate for seamless looping
const doubled = [...items, ...items];

export default function MarqueeBanner() {
    return (
        <div className="w-full bg-amber-600 overflow-hidden border-y border-amber-700/30 py-2.5 select-none">
            <div className="flex whitespace-nowrap animate-marquee">
                {doubled.map((item, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-3 px-8 text-white text-[13px] font-bold uppercase tracking-[0.15em]"
                    >
                        <span className="text-amber-300 text-[10px]">{item.icon}</span>
                        {item.text}
                    </span>
                ))}
            </div>
        </div>
    );
}
