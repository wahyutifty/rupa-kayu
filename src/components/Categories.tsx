import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Category } from "@/lib/types";

async function getCategories() {
    const { data } = await supabase.from('categories').select('*').order('id');
    return (data as Category[]) || [];
}

export default async function Categories() {
    const categories = await getCategories();

    return (
        <section className="bg-white dark:bg-zinc-900 py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Kategori Pilihan
                    </h2>
                    {/* Desktop link */}
                    <Link
                        href="/shop"
                        className="hidden md:inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-bold text-sm transition-colors"
                    >
                        Lihat Semua &rarr;
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {categories.map((cat) => (
                        <Link
                            href={`/category/${encodeURIComponent(cat.slug || cat.name)}`}
                            key={cat.id}
                            className="group flex flex-col items-center"
                        >
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 active:scale-95">
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
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 active:bg-black/10 transition-colors duration-300" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-center text-sm group-hover:text-amber-600 transition-colors">
                                {cat.name}
                            </h3>
                        </Link>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            Belum ada kategori.
                        </div>
                    )}
                </div>

                {/* Mobile CTA — full-width, mudah ditap */}
                <div className="mt-8 md:hidden">
                    <Link
                        href="/shop"
                        className="flex items-center justify-center w-full py-4 rounded-2xl bg-amber-600 text-white font-bold text-sm active:bg-amber-700 transition-colors shadow-sm shadow-amber-200"
                    >
                        Lihat Semua Kategori &amp; Produk →
                    </Link>
                </div>
            </div>
        </section>
    );
}
