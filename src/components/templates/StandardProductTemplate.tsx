
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Star } from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';
import AddToCartSection from '@/components/AddToCartSection';
import { Product } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StandardProductTemplate({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
    // Dummy Ratings
    const rating = 4.8;
    const reviews = 24;

    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Breadcrumb & Back */}
            <div className="container mx-auto px-4 py-8">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Toko
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left: Component for Gallery */}
                    <ProductGallery
                        images={product.images && product.images.length > 0 ? product.images : [product.image_url || "https://placehold.co/600x600?text=No+Image"]}
                        name={product.name}
                    />

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-block bg-[#c5a47e]/10 text-[#c5a47e] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {/* @ts-ignore: categories is joined */}
                                {product.categories?.name || "Decor"}
                            </span>
                            {product.is_promo && (
                                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                                    PROMO
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-gray-900 ml-1">{rating}</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500 font-medium">{reviews} Ulasan</span>
                        </div>

                        {/* Price Display */}
                        {product.landing_content?.original_price && product.landing_content.original_price > product.base_price ? (
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-2xl text-gray-400 line-through font-bold">
                                        Rp {Number(product.landing_content.original_price).toLocaleString('id-ID')}
                                    </span>
                                    <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-lg">
                                        Hemat {Math.round(((product.landing_content.original_price - product.base_price) / product.landing_content.original_price) * 100)}%
                                    </span>
                                </div>
                                <div className="text-5xl font-black text-red-600">
                                    Rp {product.base_price.toLocaleString('id-ID')}
                                </div>
                            </div>
                        ) : (
                            <div className="text-4xl font-black text-gray-900 mb-8">
                                Rp {product.base_price.toLocaleString('id-ID')}
                            </div>
                        )}

                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            {product.description || "Belum ada deskripsi produk."}
                        </p>

                        {/* Actions */}
                        <AddToCartSection product={product} />

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mt-6">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="font-medium">Jaminan Original 100%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="font-medium">Garansi Pengiriman</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="font-medium">Gratis Ongkir Xtra</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-24 mb-16">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">
                        Produk yang Mungkin Anda Suka
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {relatedProducts?.map((related) => (
                            <Link href={`/product/${related.id}`} key={related.id} className="group block">
                                <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
                                    {related.is_promo && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="bg-red-500 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                                                PROMO
                                            </span>
                                        </div>
                                    )}
                                    <Image
                                        src={related.image_url || "https://placehold.co/400x400?text=No+Image"}
                                        alt={related.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-gray-900">
                                        {/* @ts-ignore: categories is joined */}
                                        {related.categories?.name || "Decor"}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-[#c5a47e] transition-colors truncate">
                                    {related.name}
                                </h3>

                                {related.landing_content?.original_price && related.landing_content.original_price > related.base_price ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-red-600 font-bold text-sm">Rp {related.base_price.toLocaleString('id-ID')}</p>
                                        <p className="text-gray-400 line-through text-xs">Rp {Number(related.landing_content.original_price).toLocaleString('id-ID')}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Rp {related.base_price.toLocaleString('id-ID')}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
