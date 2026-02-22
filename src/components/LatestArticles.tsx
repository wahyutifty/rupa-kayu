import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/lib/types";
import { ArrowRight, Clock } from "lucide-react";

async function getLatestPosts(): Promise<Post[]> {
    const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, content, image_url, author_name, created_at, published")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(4);

    if (error) return [];
    return (data as Post[]) || [];
}

function readingTime(content: string): number {
    const words = (content || "").replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export default async function LatestArticles() {
    const posts = await getLatestPosts();

    if (!posts || posts.length === 0) return null;

    const [featured, ...rest] = posts;

    const featuredExcerpt =
        featured.excerpt ||
        (featured.content
            ? featured.content.replace(/<[^>]*>/g, "").substring(0, 180) + "…"
            : "");

    return (
        <section className="hidden md:block py-24 bg-neutral-50 border-t border-gray-100">
            <div className="container mx-auto px-6 lg:px-8">

                {/* Section Header */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <span className="block text-amber-600 font-bold tracking-widest text-xs uppercase mb-2">
                            Jurnal & Inspirasi
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
                            Artikel Terbaru
                        </h2>
                    </div>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-amber-700 transition-colors group"
                    >
                        Lihat Semua
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Grid: 1 featured (left) + up to 3 smaller (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── Featured Article ── */}
                    <Link
                        href={`/blog/${featured.slug}`}
                        className="lg:col-span-3 group relative rounded-3xl overflow-hidden bg-gray-900 min-h-[480px] flex flex-col justify-end shadow-xl"
                    >
                        <Image
                            src={featured.image_url || "https://placehold.co/900x600/1c1008/fff?text=Rupa+Kayu"}
                            alt={featured.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-70"
                            priority
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        <div className="relative z-10 p-8">
                            <span className="inline-block bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                                Featured
                            </span>
                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3 group-hover:text-amber-300 transition-colors">
                                {featured.title}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-5 max-w-lg">
                                {featuredExcerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="font-semibold text-gray-300">
                                    {featured.author_name || "Admin"}
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {readingTime(featured.content || "")} mnt baca
                                </span>
                                {featured.created_at && (
                                    <>
                                        <span>·</span>
                                        <time dateTime={featured.created_at}>
                                            {new Date(featured.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </time>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* ── Side Articles ── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {rest.length === 0 && (
                            <div className="flex-1 flex items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 text-sm p-8 text-center">
                                <p>Tambahkan lebih banyak artikel di Admin Panel</p>
                            </div>
                        )}

                        {rest.map((post) => {
                            const excerpt =
                                post.excerpt ||
                                (post.content
                                    ? post.content.replace(/<[^>]*>/g, "").substring(0, 90) + "…"
                                    : "");

                            return (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all duration-300"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                        <Image
                                            src={post.image_url || "https://placehold.co/200x200/f5f0e8/a67c52?text=RK"}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Berita</span>
                                            {post.created_at && (
                                                <time
                                                    dateTime={post.created_at}
                                                    className="text-[10px] text-gray-400"
                                                >
                                                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </time>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors mb-1">
                                            {post.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                            {excerpt}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* CTA */}
                        <Link
                            href="/blog"
                            className="mt-auto flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-50 hover:border-amber-400 transition-all group"
                        >
                            Lihat Semua Artikel
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
