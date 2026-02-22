'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Product = {
    id: number;
    name: string;
    base_price: number;
    image_url?: string;
    is_promo: boolean;
    landing_content?: any;
};

interface RelatedProductsProps {
    currentProductId: number;
    categoryId?: number;
}

export default function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function fetch() {
            let query = supabase
                .from('products')
                .select('id, name, base_price, image_url, is_promo, landing_content')
                .neq('id', currentProductId)
                .limit(4);

            // Prioritaskan produk kategori sama kalau ada
            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }

            const { data } = await query.order('created_at', { ascending: false });

            // Kalau kategori sama kurang dari 4, fetch produk lain
            if (!data || data.length < 4) {
                const { data: fallback } = await supabase
                    .from('products')
                    .select('id, name, base_price, image_url, is_promo, landing_content')
                    .neq('id', currentProductId)
                    .limit(4)
                    .order('created_at', { ascending: false });
                setProducts(fallback || []);
            } else {
                setProducts(data);
            }
        }
        fetch();
    }, [currentProductId, categoryId]);

    if (products.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-stone-50 border-t border-stone-100">
            <div className="container max-w-6xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Mungkin Anda Suka</p>
                        <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Produk Lainnya</h2>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                    >
                        Lihat Semua <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Link href={`/product/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-stone-100 transition-all duration-300">
                                <div className="aspect-square bg-stone-100 relative overflow-hidden">
                                    {product.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">🪑</div>
                                    )}
                                    {product.is_promo && (
                                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                            PROMO
                                        </span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-stone-900 text-sm leading-tight line-clamp-2 group-hover:text-amber-700 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="font-black text-amber-700 text-sm">
                                            Rp {product.base_price.toLocaleString('id-ID')}
                                        </span>
                                        {product.is_promo && product.landing_content?.original_price && (
                                            <span className="text-[11px] text-stone-400 line-through">
                                                Rp {Number(product.landing_content.original_price).toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
