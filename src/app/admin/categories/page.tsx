'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Category } from '@/lib/types';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Image as ImageIcon,
    Loader2,
    UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<Partial<Category>>({ name: '', slug: '', image_url: '' });

    // File State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData(category);
            setPreview(category.image_url || '');
        } else {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', image_url: '' });
            setPreview('');
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({});
        setImageFile(null);
        setPreview('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to 'categories' bucket
        const { error: uploadError } = await supabase.storage
            .from('categories')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.warn('Upload to categories bucket failed, trying products bucket...', uploadError);
            // Fallback: try 'products' bucket if categories fails
            const { error: fallbackError } = await supabase.storage
                .from('products')
                .upload(`categories/${filePath}`, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (fallbackError) {
                console.error("Fallback upload error:", fallbackError);
                throw fallbackError;
            }

            const { data } = supabase.storage.from('products').getPublicUrl(`categories/${filePath}`);
            return data.publicUrl;
        }

        const { data } = supabase.storage.from('categories').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setUploading(true);

        try {
            let imageUrl = formData.image_url;

            if (imageFile) {
                imageUrl = await uploadFile(imageFile);
            }

            const payload = {
                ...formData,
                image_url: imageUrl
            };

            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .update(payload)
                    .eq('id', editingCategory.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([payload]);

                if (error) throw error;
            }

            await fetchCategories();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving category:', error);
            alert(`Gagal menyimpan kategori: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Gagal menghapus kategori');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kategori Produk</h1>
                    <p className="text-gray-500 text-sm">Kelola semua kategori furnitur Anda di sini.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                >
                    <Plus size={18} />
                    Tambah Kategori
                </button>
            </div>

            {/* List Categories */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                {loading && categories.length === 0 ? (
                    <div className="p-12 flex justify-center items-center text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Memuat data...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Nama Kategori</th>
                                    <th className="px-6 py-4">Slug</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-zinc-700 overflow-hidden relative border border-gray-200 dark:border-zinc-600">
                                                    {category.image_url ? (
                                                        <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{category.slug}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(category)}
                                                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            Belum ada kategori. Silakan tambah baru.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form id="categoryForm" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Kategori</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        placeholder="Contoh: Kursi Minimalis"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug || ''}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono text-sm"
                                        placeholder="contoh: kursi-minimalis"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gambar</label>

                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="h-20 w-20 rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="text-gray-400" size={24} />
                                            )}
                                        </div>
                                        <label className="flex-1 cursor-pointer">
                                            <div className="flex flex-col items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:bg-gray-50 hover:border-amber-500 transition-colors">
                                                <UploadCloud className="text-gray-400 mb-1" size={20} />
                                                <span className="text-xs text-gray-500">Upload Gambar</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={formData.image_url || ''}
                                            onChange={(e) => {
                                                setFormData({ ...formData, image_url: e.target.value });
                                                setPreview(e.target.value);
                                            }}
                                            className="w-full pl-3 pr-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-600 text-xs text-gray-500"
                                            placeholder="Atau masukkan URL..."
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="p-4 border-t border-gray-100 dark:border-zinc-700 flex gap-3 bg-gray-50/50 dark:bg-zinc-900/50 mt-auto">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    form="categoryForm"
                                    disabled={loading || uploading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium shadow-sm flex justify-center items-center"
                                >
                                    {loading || uploading ? <Loader2 className="animate-spin" size={18} /> : 'Simpan'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
