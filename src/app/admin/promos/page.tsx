'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Image as ImageIcon,
    Loader2,
    UploadCloud,
    Calendar,
    Percent,
    Search,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';

type Promo = {
    id: number;
    title: string;
    description?: string;
    discount_percentage?: number;
    amount?: number;
    image_url?: string;
    valid_until?: string;
    created_at?: string;
    product_ids?: number[];
};

export default function PromosPage() {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
    const [formData, setFormData] = useState<Partial<Promo>>({
        title: '',
        description: '',
        discount_percentage: 0,
        amount: 0,
        image_url: '',
        valid_until: '',
        product_ids: []
    });

    // File State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPromos();
        fetchProducts();
    }, []);

    async function fetchPromos() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('promos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPromos(data || []);
        } catch (error) {
            console.error('Error fetching promos:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchProducts() {
        const { data } = await supabase.from('products').select('*');
        setProducts(data || []);
    }

    const handleOpenModal = (promo?: Promo) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                ...promo,
                product_ids: promo.product_ids || []
            });
            setPreview(promo.image_url || '');
        } else {
            setEditingPromo(null);
            setFormData({
                title: '',
                description: '',
                discount_percentage: 0,
                amount: 0,
                image_url: '',
                valid_until: '',
                product_ids: []
            });
            setPreview('');
        }
        setImageFile(null);
        setSearchQuery('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromo(null);
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

        // Upload to 'promos' bucket
        const { error: uploadError } = await supabase.storage
            .from('promos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.warn('Upload to promos bucket failed, trying public bucket...', uploadError);
            // Fallback to 'products' bucket if 'promos' doesn't exist yet
            const { error: fallbackError } = await supabase.storage
                .from('products')
                .upload(`promos/${filePath}`, file);

            if (fallbackError) throw fallbackError;

            const { data } = supabase.storage.from('products').getPublicUrl(`promos/${filePath}`);
            return data.publicUrl;
        }

        const { data } = supabase.storage.from('promos').getPublicUrl(filePath);
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
                title: formData.title,
                description: formData.description,
                discount_percentage: Number(formData.discount_percentage) || 0,
                amount: Number(formData.amount) || 0,
                image_url: imageUrl,
                valid_until: formData.valid_until || null,
                product_ids: formData.product_ids || []
            };

            if (editingPromo) {
                const { error } = await supabase
                    .from('promos')
                    .update(payload)
                    .eq('id', editingPromo.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('promos')
                    .insert([payload]);
                if (error) throw error;
            }

            // --- AUTOMATIC PRICE UPDATE FOR SELECTED PRODUCTS ---
            if (formData.product_ids && formData.product_ids.length > 0 && formData.discount_percentage && formData.discount_percentage > 0) {
                const { data: selectedProducts } = await supabase
                    .from('products')
                    .select('*') // Need all fields properly typed ideally, but '*' works
                    .in('id', formData.product_ids);

                if (selectedProducts) {
                    const updatePromises = selectedProducts.map(async (product) => {
                        // 1. Determine the TRUE original price.
                        // If product already has an original_price (from previous promo), use it.
                        // Otherwise, use the current base_price as the original price.
                        // We cast to any to avoid strict type issues with jsonb landing_content for now if needed, 
                        // but Typescript might complain if landing_content isn't typed as object with original_price.
                        // Assuming Product type has landing_content.

                        const currentRefPrice = product.landing_content?.original_price || product.base_price;

                        // 2. Calculate New Price
                        const discountFactor = (100 - (formData.discount_percentage || 0)) / 100;
                        const newBasePrice = Math.floor(currentRefPrice * discountFactor);

                        // 3. Update Product
                        // We set is_promo to true, update base_price, and store the original price.
                        return supabase
                            .from('products')
                            .update({
                                is_promo: true,
                                base_price: newBasePrice,
                                landing_content: {
                                    ...(product.landing_content || {}),
                                    original_price: currentRefPrice
                                }
                            })
                            .eq('id', product.id);
                    });

                    await Promise.all(updatePromises);
                }
            }
            // ----------------------------------------------------

            await fetchPromos();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving promo:', error);
            alert(`Gagal menyimpan promo: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus promo ini?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('promos').delete().eq('id', id);
            if (error) throw error;
            await fetchPromos();
        } catch (error) {
            console.error('Error deleting promo:', error);
            alert('Gagal menghapus promo');
        } finally {
            setLoading(false);
        }
    };

    // Cek apakah produk sudah ada di promo aktif LAIN (bukan promo yang sedang diedit)
    const getConflictingPromo = (productId: number): Promo | undefined => {
        return promos.find(p =>
            p.id !== editingPromo?.id &&  // bukan promo yang sedang diedit
            (p.product_ids || []).includes(productId) &&
            // promo masih aktif (belum expired)
            (!p.valid_until || new Date(p.valid_until) >= new Date())
        );
    };

    const toggleProductSelection = (productId: number) => {
        const conflict = getConflictingPromo(productId);
        if (conflict) {
            alert(`Produk ini sudah ada di promo "${conflict.title}". Hapus dari promo tersebut dulu sebelum menambahkannya ke promo baru.`);
            return;
        }
        const currentIds = formData.product_ids || [];
        if (currentIds.includes(productId)) {
            setFormData({ ...formData, product_ids: currentIds.filter(id => id !== productId) });
        } else {
            setFormData({ ...formData, product_ids: [...currentIds, productId] });
        }
    };

    // Akhiri promo: restore harga asli produk
    const handleEndPromo = async (promo: Promo) => {
        if (!confirm(`Akhiri promo "${promo.title}" dan kembalikan harga asli semua produk?`)) return;
        setLoading(true);
        try {
            if (promo.product_ids && promo.product_ids.length > 0) {
                const { data: promoProducts } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', promo.product_ids);

                if (promoProducts) {
                    await Promise.all(promoProducts.map(product => {
                        const originalPrice = product.landing_content?.original_price;
                        if (!originalPrice) return Promise.resolve();
                        return supabase.from('products').update({
                            is_promo: false,
                            base_price: originalPrice,
                            landing_content: {
                                ...product.landing_content,
                                original_price: null
                            }
                        }).eq('id', product.id);
                    }));
                }
            }
            // Hapus promo dari DB
            await supabase.from('promos').delete().eq('id', promo.id);
            await fetchPromos();
            alert('Promo diakhiri dan harga produk sudah dikembalikan.');
        } catch (err: any) {
            alert('Gagal mengakhiri promo: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const isExpired = (promo: Promo) =>
        promo.valid_until ? new Date(promo.valid_until) < new Date() : false;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Promo & Diskon</h1>
                    <p className="text-gray-500 text-sm">Kelola banner promo dan pilih produk yang terlibat.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                >
                    <Plus size={18} />
                    Tambah Promo
                </button>
            </div>

            {/* List Promos */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                {loading && promos.length === 0 ? (
                    <div className="p-12 flex justify-center items-center text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Memuat data...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Judul Promo</th>
                                    <th className="px-6 py-4">Diskon</th>
                                    <th className="px-6 py-4">Produk</th>
                                    <th className="px-6 py-4">Berlaku Sampai</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {promos.length > 0 ? (
                                    promos.map((promo) => (
                                        <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="h-12 w-20 rounded-lg bg-gray-100 dark:bg-zinc-700 overflow-hidden relative border border-gray-200 dark:border-zinc-600">
                                                    {promo.image_url ? (
                                                        <img src={promo.image_url} alt={promo.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{promo.title}</span>
                                                    {isExpired(promo) && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full uppercase">Expired</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{promo.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {promo.discount_percentage ? (
                                                    <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md font-bold text-xs">
                                                        {promo.discount_percentage}% OFF
                                                    </span>
                                                ) : promo.amount ? (
                                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md font-bold text-xs">
                                                        Rp {promo.amount.toLocaleString()}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {promo.product_ids?.length ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        {promo.product_ids.length} Produk
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Semua / Umum</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                                {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString() : 'Selamanya'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!isExpired(promo) && (
                                                        <button
                                                            onClick={() => handleEndPromo(promo)}
                                                            title="Akhiri promo & kembalikan harga asli"
                                                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-[11px] font-bold px-3 border border-gray-200 hover:border-orange-300"
                                                        >
                                                            Akhiri
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleOpenModal(promo)} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(promo.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            Belum ada promo aktif.
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
                            className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form id="promoForm" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Banner Promo
                                    </label>

                                    {/* Info Masonry */}
                                    <div className="mb-3 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 flex items-start gap-2">
                                        <span className="text-lg leading-none">🧱</span>
                                        <span>
                                            <strong>Layout Masonry (Pinterest-style).</strong> Upload foto dengan orientasi <em>apapun</em> — portrait, landscape, atau square — tampilan akan otomatis menyesuaikan proporsi asli foto.
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        {/* Preview */}
                                        <div className="h-28 w-24 rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center relative shrink-0">
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-300 gap-1">
                                                    <ImageIcon size={24} />
                                                    <span className="text-[9px] text-center leading-tight">Preview<br />Banner</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Area */}
                                        <label className="flex-1 cursor-pointer">
                                            <div className="flex flex-col items-center justify-center px-4 py-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:bg-gray-50 hover:border-amber-500 transition-colors">
                                                <UploadCloud className="text-gray-400 mb-2" size={24} />
                                                <span className="text-xs text-gray-500 font-medium text-center">Klik untuk upload banner</span>
                                                <span className="text-[10px] text-gray-400 mt-1">Semua orientasi foto diterima</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Promo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        placeholder="Contoh: Diskon Kemerdekaan 17%"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                                        placeholder="Keterangan singkat promo..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diskon (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.discount_percentage || ''}
                                                onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Berlaku Sampai</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="date"
                                                value={formData.valid_until ? new Date(formData.valid_until).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Produk Promo</label>
                                    <div className="border border-gray-200 dark:border-zinc-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-900">
                                        <div className="p-2 border-b border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Cari produk..."
                                                    className="w-full pl-9 pr-4 py-1.5 text-sm rounded-md border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                                            {filteredProducts.map(product => {
                                                const isSelected = (formData.product_ids || []).includes(product.id);
                                                const conflict = getConflictingPromo(product.id);
                                                return (
                                                    <div
                                                        key={product.id}
                                                        onClick={() => !conflict && toggleProductSelection(product.id)}
                                                        title={conflict ? `Sudah di promo: "${conflict.title}"` : ''}
                                                        className={`flex items-center gap-3 p-2 rounded-md transition-colors
                                                            ${conflict
                                                                ? 'opacity-40 cursor-not-allowed bg-gray-50'
                                                                : isSelected
                                                                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer'
                                                                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'}`}>
                                                            {isSelected && <Check size={12} />}
                                                        </div>
                                                        <div className="h-8 w-8 rounded bg-gray-200 overflow-hidden shrink-0">
                                                            {product.image_url && (
                                                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{product.name}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500">Rp {product.base_price.toLocaleString()}</span>
                                                                {conflict && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">Promo lain</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {filteredProducts.length === 0 && (
                                                <p className="text-center text-xs text-gray-500 py-4">Produk tidak ditemukan</p>
                                            )}
                                        </div>
                                        <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                            {(formData.product_ids || []).length} produk dipilih
                                        </div>
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
                                    form="promoForm"
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
