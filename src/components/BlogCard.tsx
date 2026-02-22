"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Post } from "@/lib/types";
import { ArrowRight, Clock, User } from "lucide-react";

interface BlogCardProps {
    post: Post;
    index: number;
}

function readingTime(content: string): number {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export default function BlogCard({ post, index }: BlogCardProps) {
    const formattedDate = post.created_at
        ? new Date(post.created_at).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    const minsRead = readingTime(post.content || post.excerpt || "");

    const excerpt = post.excerpt
        || (post.content ? post.content.replace(/<[^>]*>/g, "").substring(0, 130) + "…" : "");

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
        >
            {/* Thumbnail */}
            <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-gray-100">
                <Image
                    src={post.image_url || "https://placehold.co/800x450/f5f0e8/a67c52?text=Rupa+Kayu"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Body */}
            <div className="flex flex-col flex-grow p-6">

                {/* Tags + Meta */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-4">
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold tracking-wide uppercase">
                        Berita
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <time dateTime={post.created_at} className="font-medium">{formattedDate}</time>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {minsRead} mnt
                    </span>
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`} className="block mb-3">
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                    </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-grow mb-5">
                    {excerpt}
                </p>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-5" />

                {/* Footer: author + CTA */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-[10px]">
                            {(post.author_name || "A").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{post.author_name || "Admin"}</span>
                    </div>

                    <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-amber-700 font-bold text-xs hover:text-amber-900 transition-colors group/link"
                    >
                        Baca
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}
