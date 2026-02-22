import { notFound } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/lib/types";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
    const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !post) return null;
    return post as Post;
}

/**
 * Mengubah teks polos menjadi HTML paragraf yang proper.
 * - Kalau sudah ada tag HTML (misal dari rich text editor), langsung dipakai.
 * - Kalau teks biasa, split per baris kosong → pecah jadi <p> per paragraf.
 */
function renderContent(content: string): string {
    if (!content) return "";

    // Cek apakah sudah berisi HTML
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content);
    if (hasHtmlTags) return content;

    // Teks polos: pecah berdasarkan baris kosong (paragraph break)
    const paragraphs = content
        .split(/\n\s*\n/) // pisah per paragraf (dua newline)
        .map(para =>
            para
                .trim()
                .split("\n") // baris tunggal dalam paragraf → sambung dengan <br>
                .map(line => line.trim())
                .filter(Boolean)
                .join("<br/>")
        )
        .filter(Boolean);

    if (paragraphs.length === 0) return `<p>${content}</p>`;

    return paragraphs.map(p => `<p>${p}</p>`).join("");
}

/** Estimasi waktu baca (menit) */
function readingTime(content: string): number {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const post = await getPost(resolvedParams.slug);
    if (!post) return { title: "Post Not Found" };
    return {
        title: `${post.title} | Jurnal Rupa Kayu`,
        description: post.excerpt || (post.content ? post.content.substring(0, 160) : ""),
        openGraph: {
            images: post.image_url ? [post.image_url] : [],
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const resolvedParams = await params;
    const post = await getPost(resolvedParams.slug);

    if (!post) notFound();

    const formattedDate = post.created_at
        ? new Date(post.created_at).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    const minsRead = readingTime(post.content || "");
    const htmlContent = renderContent(post.content || "");

    return (
        <article className="min-h-screen bg-white pb-24 selection:bg-amber-100 selection:text-amber-900">

            {/* ── Hero ── */}
            <div className="relative w-full h-[60vh] min-h-[400px]">
                <Image
                    src={post.image_url || "https://placehold.co/1200x600/1c1008/fff?text=Rupa+Kayu"}
                    alt={post.title}
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                <div className="absolute inset-0 flex flex-col justify-end pb-12 sm:pb-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-4xl">
                            {/* Meta chips */}
                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-amber-200/90 mb-5 tracking-wide">
                                <span className="bg-amber-600/90 px-3 py-1 rounded-full uppercase tracking-widest text-xs font-bold text-white shadow backdrop-blur-md">
                                    Berita
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <time dateTime={post.created_at}>{formattedDate}</time>
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{post.author_name || "Admin"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{minsRead} menit baca</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-sm mb-4 max-w-3xl">
                                {post.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content Card ── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="max-w-3xl mx-auto bg-white rounded-t-3xl shadow-xl border border-gray-100/50 overflow-hidden">

                    {/* Inside padding */}
                    <div className="p-6 md:p-12">

                        {/* Back link */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-gray-400 hover:text-amber-700 font-medium text-sm transition-colors mb-10 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Kembali ke Jurnal
                        </Link>

                        {/* Excerpt / lead */}
                        {post.excerpt && (
                            <div className="relative mb-10 pl-6 border-l-4 border-amber-400">
                                <p className="text-xl md:text-2xl font-semibold text-gray-700 leading-relaxed italic">
                                    {post.excerpt}
                                </p>
                            </div>
                        )}

                        {/* Divider before body */}
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px flex-1 bg-gray-100" />
                            <span className="text-amber-400 text-xs tracking-widest font-bold uppercase">Artikel</span>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>

                        {/* ── Article Body ── */}
                        <div
                            className="
                                article-body
                                text-gray-700 text-[17px] leading-[1.9] tracking-[0.01em]
                                [&>p]:mb-7
                                [&>p]:text-gray-700
                                [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-black [&>h2]:text-gray-900
                                [&>h2]:mt-14 [&>h2]:mb-5 [&>h2]:leading-tight
                                [&>h2]:border-l-4 [&>h2]:border-amber-400 [&>h2]:pl-4
                                [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-gray-800
                                [&>h3]:mt-10 [&>h3]:mb-4
                                [&>ul]:list-none [&>ul]:pl-0 [&>ul]:mb-7 [&>ul]:space-y-2
                                [&>ul>li]:flex [&>ul>li]:gap-3 [&>ul>li]:items-start
                                [&>ul>li]:before:content-['▸'] [&>ul>li]:before:text-amber-500 [&>ul>li]:before:font-bold [&>ul>li]:before:mt-0.5 [&>ul>li]:before:flex-shrink-0
                                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-7 [&>ol]:space-y-2
                                [&>ol>li]:pl-2
                                [&>blockquote]:relative [&>blockquote]:my-10
                                [&>blockquote]:pl-6 [&>blockquote]:pr-4 [&>blockquote]:py-5
                                [&>blockquote]:bg-amber-50 [&>blockquote]:rounded-r-2xl
                                [&>blockquote]:border-l-4 [&>blockquote]:border-amber-400
                                [&>blockquote]:text-amber-900 [&>blockquote]:italic [&>blockquote]:text-lg
                                [&>img]:rounded-2xl [&>img]:shadow-lg [&>img]:my-10 [&>img]:w-full [&>img]:object-cover
                                [&>a]:text-amber-700 [&>a]:font-medium [&>a]:underline [&>a]:decoration-amber-300/60
                                [&>a]:underline-offset-4 [&>a]:transition-colors hover:[&>a]:text-amber-900
                                [&>strong]:text-gray-900 [&>strong]:font-bold
                                [&>hr]:my-12 [&>hr]:border-gray-100
                                [&>p:first-of-type]:text-lg [&>p:first-of-type]:text-gray-800 [&>p:first-of-type]:font-medium
                            "
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />

                        {/* Footer bar */}
                        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm">
                                    {(post.author_name || "A").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Ditulis oleh</p>
                                    <p className="text-sm font-semibold text-gray-800">{post.author_name || "Admin"}</p>
                                </div>
                            </div>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Semua Artikel
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </article>
    );
}
