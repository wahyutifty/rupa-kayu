import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Product, Category } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, ArrowRight } from "lucide-react";

export const revalidate = 60;

async function getAllData() {
    const [{ data: categories }, { data: products }] = await Promise.all([
        supabase.from("categories").select("*").order("id"),
        supabase
            .from("products")
            .select("*, categories(name)")
            .order("created_at", { ascending: false }),
    ]);
    return {
        categories: (categories as Category[]) || [],
        products: (products as Product[]) || [],
    };
}

export default async function ShopPage() {
    const { categories, products } = await getAllData();

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <Header />

            {/* Hero strip */}
            <div className="pt-24 pb-12 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <span className="block text-amber-600 font-bold tracking-widest text-xs uppercase mb-2">
                        Semua Koleksi
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">
                        Toko Kami
                    </h1>
                    <p className="text-gray-500 mt-3 max-w-lg">
                        Temukan furnitur berkualitas tinggi dari pengrajin lokal terbaik Indonesia.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">

                {/* ── Categories ── */}
                <section className="mb-16">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6">
                        Kategori
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${encodeURIComponent(cat.slug || cat.name)}`}
                                className="group flex flex-col items-center gap-3"
                            >
                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                                    {cat.image_url ? (
                                        <Image
                                            src={cat.image_url}
                                            alt={cat.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-400 text-2xl font-black">
                                            {cat.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="font-semibold text-gray-800 text-sm text-center group-hover:text-amber-600 transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Products ── */}
                <section>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6">
                        Semua Produk
                        <span className="ml-3 text-sm font-bold text-gray-400 normal-case tracking-normal">
                            ({products.length} produk)
                        </span>
                    </h2>

                    {products.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">Belum ada produk.</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                        <Image
                                            src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {product.is_promo && (
                                            <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Promo
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">
                                            {/* @ts-ignore */}
                                            {product.categories?.name || "Furniture"}
                                        </p>
                                        <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-amber-700 transition-colors mb-2">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-gray-900 text-sm">
                                                Rp {product.base_price.toLocaleString("id-ID")}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <span>4.8</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <Footer />
        </main>
    );
}
