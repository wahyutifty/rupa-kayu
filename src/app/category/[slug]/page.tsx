import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Product, Category } from "@/lib/types";
import { Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
    const { data: category, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !category) {
        return null;
    }
    return category as Category;
}

async function getProductsByCategory(categoryId: number) {
    const { data: products, error } = await supabase
        .from("products")
        .select(`
            *,
            categories (
                name
            )
        `)
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }
    return products as Product[];
}

export default async function CategoryPage({ params }: PageProps) {
    const resolvedParams = await params;
    const category = await getCategory(decodeURIComponent(resolvedParams.slug));

    if (!category) {
        notFound();
    }

    const products = await getProductsByCategory(category.id);

    return (
        <main className="min-h-screen bg-gray-50 pb-24 font-sans">
            {/* Header Section */}
            <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
                <Image
                    src={category.image_url || "https://placehold.co/1200x600?text=Category+Image"}
                    alt={category.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 uppercase tracking-wider drop-shadow-md">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-sm">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <nav className="text-sm text-gray-500 mb-8">
                    <ol className="list-none p-0 inline-flex">
                        <li className="flex items-center">
                            <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                            <span className="mx-2">/</span>
                        </li>
                        <li className="flex items-center text-gray-800 font-medium">
                            {category.name}
                        </li>
                    </ol>
                </nav>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <ShoppingCart size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada produk</h3>
                        <p className="text-gray-500">Produk untuk kategori ini akan segera hadir.</p>
                        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
                            Kembali ke Beranda
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} categoryName={category.name} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

function ProductCard({ product, categoryName }: { product: Product; categoryName: string }) {
    // Generate dummy rating
    const rating = 4.8;
    const reviews = 12;

    return (
        <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <Link href={`/product/${product.id}`} className="block relative">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {/* Tag Badge */}
                    {(product.stock <= 5 && product.stock > 0) && (
                        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            Low Stock
                        </div>
                    )}

                    <Image
                        src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
            </Link>

            <div className="p-5">
                <div className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wide">
                    {categoryName}
                </div>

                <Link href={`/product/${product.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate hover:text-amber-700 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-gray-900">{rating}</span>
                        <span className="text-xs text-gray-400">({reviews})</span>
                    </div>
                    <p className="text-lg font-black text-gray-900">
                        Rp {(product.base_price / 1000).toLocaleString('id-ID')}k
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                    <Link
                        href="/cart"
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add
                    </Link>
                    <Link
                        href="/checkout"
                        className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-gray-200"
                    >
                        Buy Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
