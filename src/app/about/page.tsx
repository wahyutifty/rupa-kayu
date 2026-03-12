"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Leaf, Users, Hammer } from "lucide-react";

const values = [
    {
        icon: Hammer,
        title: "Pengrajin Lokal",
        desc: "Setiap produk dibuat oleh tangan-tangan terampil pengrajin lokal Indonesia dengan pengalaman puluhan tahun.",
    },
    {
        icon: Leaf,
        title: "Bahan Berkelanjutan",
        desc: "Kami memilih kayu dari sumber yang bertanggung jawab dan ramah lingkungan untuk masa depan yang lebih baik.",
    },
    {
        icon: Award,
        title: "Kualitas Terjamin",
        desc: "Setiap produk melewati proses QC ketat sebelum sampai ke tangan Anda. Kualitas premium, harga terjangkau.",
    },
    {
        icon: Users,
        title: "Komunitas Pembeli",
        desc: "Bergabunglah dengan ribuan pelanggan puas yang telah mempercayakan keindahan rumah mereka kepada kami.",
    },
];

const team = [
    { name: "Ahmad Rafi", role: "Kepala Pengrajin", img: "https://placehold.co/300x300/c5a47e/fff?text=AR" },
    { name: "Siti Nurhaliza", role: "Desainer Interior", img: "https://placehold.co/300x300/2d2d2d/fff?text=SN" },
    { name: "Budi Santoso", role: "Quality Control", img: "https://placehold.co/300x300/c5a47e/fff?text=BS" },
];

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pt-16">

                {/* Hero */}
                <section className="relative bg-[#1a1a1a] text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "url('https://placehold.co/1920x600/c5a47e/c5a47e')", backgroundSize: "cover" }}
                    />
                    <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
                        <p className="text-amber-400 text-sm font-bold tracking-widest uppercase mb-4">Tentang Kami</p>
                        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                            Furnitur yang Dibuat<br />dengan <span className="text-amber-400">Sepenuh Hati</span>
                        </h1>
                        <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                            Rupa Kayu lahir dari kecintaan mendalam terhadap keindahan kayu dan kekayaan tradisi pengrajin lokal Nusantara.
                        </p>
                    </div>
                </section>

                {/* Story */}
                <section className="container mx-auto px-4 py-20">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-amber-600 text-sm font-bold tracking-widest uppercase mb-3">Kisah Kami</p>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                                Dari Workshop Kecil ke Rumah-rumah Impian
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Berawal dari sebuah bengkel kecil di Jepara pada tahun 2015, Rupa Kayu tumbuh menjadi toko furnitur premium yang dipercaya oleh ribuan keluarga Indonesia. Kami percaya bahwa furnitur bukan sekadar benda — ia adalah bagian dari cerita hidup Anda.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Setiap lekukan, setiap sambungan kayu, dikerjakan dengan presisi dan dedikasi oleh pengrajin berpengalaman kami. Hasilnya adalah furnitur yang tidak hanya indah dipandang, tetapi juga tahan lama menemani generasi.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full font-bold hover:bg-amber-700 transition-colors"
                            >
                                Lihat Koleksi Kami <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="relative h-80 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://placehold.co/600x500/c5a47e/fff?text=Workshop+Rupa+Kayu"
                                alt="Workshop Rupa Kayu"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-14">
                            <p className="text-amber-600 text-sm font-bold tracking-widest uppercase mb-3">Nilai Kami</p>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Mengapa Memilih Rupa Kayu?</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((v) => (
                                <div key={v.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <v.icon className="w-7 h-7 text-amber-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="container mx-auto px-4 py-20">
                    <div className="text-center mb-14">
                        <p className="text-amber-600 text-sm font-bold tracking-widest uppercase mb-3">Tim Kami</p>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900">Orang-orang di Balik Rupa Kayu</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        {team.map((member) => (
                            <div key={member.name} className="text-center group">
                                <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                                    <Image src={member.img} alt={member.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                                <p className="text-amber-600 text-sm font-medium">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#1a1a1a] text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-black mb-4">Siap Memperindah Rumah Anda?</h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Jelajahi ratusan koleksi furnitur premium kami dan temukan yang sempurna untuk rumah impian Anda.</p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-500 transition-colors"
                        >
                            Belanja Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
