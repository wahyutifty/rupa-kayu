'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Post } from '@/lib/types';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    X,
    Image as ImageIcon,
    UploadCloud,
    FileText,
    CheckCircle,
    XCircle,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [formData, setFormData] = useState<Partial<Post>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image_url: '',
        author_name: 'Admin',
        published: true
    });

    // File States
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');

    // Fetch Data
    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }

    // Form Handlers
    const handleOpenModal = (post?: Post) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                ...post
            });
            setPreviewImage(post.image_url || '');
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                image_url: '',
                author_name: 'Admin',
                published: true
            });
            setPreviewImage('');
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        setImageFile(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = generateSlug(title);
        setFormData(prev => ({ ...prev, title, slug: editingPost ? prev.slug : slug }));
    };

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('blog')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error("Upload error detail:", uploadError);
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from('blog').getPublicUrl(filePath);
        return publicUrlData.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setUploading(true);

        try {
            let imageUrl = formData.image_url;

            // Upload Image
            if (imageFile) {
                imageUrl = await uploadFile(imageFile);
            }

            const payload = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                content: formData.content,
                image_url: imageUrl,
                author_name: formData.author_name,
                published: formData.published,
                updated_at: new Date().toISOString()
            };

            if (editingPost) {
                const { error } = await supabase
                    .from('posts')
                    .update(payload)
                    .eq('id', editingPost.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('posts')
                    .insert([payload]);
                if (error) throw error;
            }

            await fetchPosts();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving post:', error);
            alert(`Gagal menyimpan artikel: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus artikel ini?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('posts').delete().eq('id', id);
            if (error) throw error;
            await fetchPosts();
        } catch (error) {
            console.error(error);
            alert('Gagal menghapus');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Berita & Artikel</h1>
                    <p className="text-gray-500 text-sm">Kelola konten blog dan berita.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                    <Plus size={18} /> Tambah Artikel
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                {loading && posts.length === 0 ? (
                    <div className="p-12 flex justify-center items-center text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Memuat data...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4">Cover</th>
                                    <th className="px-6 py-4">Judul</th>
                                    <th className="px-6 py-4">Penulis</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="h-12 w-20 rounded-lg bg-gray-100 dark:bg-zinc-700 overflow-hidden border border-gray-200 dark:border-zinc-600 relative">
                                                    {post.image_url ? (
                                                        <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{post.title}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {post.author_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {post.published ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20">
                                                        <CheckCircle size={12} /> Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                        <XCircle size={12} /> Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                {post.created_at ? new Date(post.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-500 hover:text-blue-600 bg-transparent hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Lihat"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </Link>
                                                    <button onClick={() => handleOpenModal(post)} className="p-2 text-gray-500 hover:text-amber-600 bg-transparent hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-500 hover:text-red-600 bg-transparent hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Belum ada artikel.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {editingPost ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                <form id="postForm" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Artikel</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                                    value={formData.title}
                                                    onChange={handleTitleChange}
                                                    placeholder="Masukkan judul menarik..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 text-gray-500"
                                                    value={formData.slug}
                                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Konten Artikel (HTML Supported)
                                                </label>
                                                <textarea
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm leading-relaxed"
                                                    rows={15}
                                                    required
                                                    value={formData.content}
                                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                                    placeholder="<p>Tulis konten artikel di sini...</p>"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Anda bisa menggunakan HTML tags (p, h2, ul, li, b, i) untuk formatting.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Status Box */}
                                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Publikasi</label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded text-amber-600 focus:ring-amber-500"
                                                            checked={formData.published}
                                                            onChange={e => setFormData({ ...formData, published: e.target.checked })}
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {formData.published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </label>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penulis</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm"
                                                        value={formData.author_name}
                                                        onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Upload */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gambar Cover</label>
                                                <div className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group">
                                                    {previewImage ? (
                                                        <>
                                                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Ganti Gambar</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center pt-5 pb-6 text-gray-400">
                                                            <UploadCloud className="w-8 h-8 mb-2" />
                                                            <p className="text-xs">Klik untuk upload cover</p>
                                                        </div>
                                                    )}
                                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                                                </div>
                                            </div>

                                            {/* Excerpt */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kutipan Singkat (Excerpt)</label>
                                                <textarea
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm h-24 resize-none"
                                                    value={formData.excerpt || ''}
                                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                    placeholder="Ringkasan singkat artikel..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    form="postForm"
                                    disabled={loading || uploading}
                                    className="px-6 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium shadow-sm flex items-center"
                                >
                                    {uploading ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Simpan Artikel'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
