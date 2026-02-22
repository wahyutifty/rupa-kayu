import { supabase } from "@/lib/supabaseClient";
import BlogCard from "@/components/BlogCard";
import { Post } from "@/lib/types";

export const revalidate = 60; // Revalidate every 60 seconds

async function getPosts() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return posts as Post[];
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <main className="min-h-screen bg-neutral-50 pb-24">
            {/* Hero / Header */}
            <div className="bg-amber-900/5 pt-32 pb-20 px-6 sm:px-12 text-center mb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                <h1 className="text-4xl md:text-5xl font-black text-amber-950 mb-6 tracking-tight relative z-10">
                    JURNAL RUPA KAYU
                </h1>
                <p className="text-amber-900/70 text-lg max-w-2xl mx-auto leading-relaxed relative z-10">
                    Temukan inspirasi desain, tips perawatan furniture, dan cerita di balik karya kami.
                </p>

                {/* Decorative elements */}
                <div className="absolute -left-10 top-1/2 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl"></div>
                <div className="absolute -right-10 bottom-0 w-60 h-60 bg-amber-300/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {posts.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 mx-auto max-w-2xl">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada artikel</h3>
                        <p className="text-gray-500">Kami sedang menyiapkan konten menarik untuk Anda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {posts.map((post, index) => (
                            <BlogCard key={post.id} post={post} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
