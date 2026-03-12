"use client";

const items = [
    { text: "Harga Terjangkau", icon: "✦" },
    { text: "Bahan Berkualitas", icon: "✦" },
    { text: "Pengrajin Lokal", icon: "✦" },
    { text: "Terpercaya", icon: "✦" },
    { text: "Pengiriman Cepat", icon: "✦" },
    { text: "Garansi Produk", icon: "✦" },
    { text: "Desain Modern", icon: "✦" },
    { text: "Bisa Custom", icon: "✦" },
];

// Duplicate for seamless looping
const doubled = [...items, ...items, ...items];

export default function MarqueeBanner() {
    return (
        <div className="w-full bg-[#1c1008] overflow-hidden py-4 select-none">
            <div className="flex whitespace-nowrap animate-marquee">
                {doubled.map((item, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-4 px-10 text-[#c5a47e] text-sm font-black uppercase tracking-[0.2em]"
                    >
                        <span className="text-amber-500/50 text-base">{item.icon}</span>
                        {item.text}
                    </span>
                ))}
            </div>
        </div>
    );
}
