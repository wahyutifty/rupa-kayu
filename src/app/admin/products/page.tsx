'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Product, Category, ProductColor } from '@/lib/types';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    X,
    ChevronDown,
    Image as ImageIcon,
    UploadCloud,
    LayoutTemplate,
    ShoppingBag,
    Layers,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [creationStep, setCreationStep] = useState<'type-selection' | 'form'>('type-selection');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form Data
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        base_price: 0,
        category_id: undefined,
        image_url: '',
        images: [],
        stock: 0,
        colors: [],
        dimensions: {},
        template_type: 'standard',
        landing_content: {
            photo_descriptions: [],
            specs: []
        }
    });

    // File States
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

    // Previews
    const [previewMain, setPreviewMain] = useState<string>('');
    const [previewHero, setPreviewHero] = useState<string>('');
    const [previewGallery, setPreviewGallery] = useState<string[]>([]);

    // Fetch Data
    useEffect(() => {
        Promise.all([fetchProducts(), fetchCategories()]);
    }, []);

    async function fetchProducts() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`
                  *,
                  categories (
                    name,
                    slug
                  )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    }

    // Helper: Upload File
    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        return data.publicUrl;
    };

    // Form Handlers
    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setCreationStep('form');
            setFormData({
                ...product,
                colors: product.colors || [],
                images: product.images || [],
                template_type: product.template_type || 'standard',
                landing_content: product.landing_content || { features: [], specs: [] }
            });
            setPreviewMain(product.image_url || '');
            setPreviewHero(product.hero_image_url || '');
            setPreviewGallery(product.images || []);
        } else {
            setEditingProduct(null);
            setCreationStep('type-selection');
            setFormData({
                name: '',
                description: '',
                base_price: 0,
                category_id: categories[0]?.id,
                image_url: '',
                hero_image_url: '',
                images: [],
                stock: 10,
                colors: [],
                dimensions: {},
                template_type: 'standard',
                landing_content: { photo_descriptions: [], specs: [] }
            });
            setPreviewMain('');
            setPreviewHero('');
            setPreviewGallery([]);
        }
        setMainImageFile(null);
        setHeroImageFile(null);
        setGalleryFiles([]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setMainImageFile(null);
        setHeroImageFile(null);
        setGalleryFiles([]);
    };

    // --- Image Handlers ---

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMainImageFile(file);
            setPreviewMain(URL.createObjectURL(file));
        }
    };

    const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setHeroImageFile(file);
            setPreviewHero(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setGalleryFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(f => URL.createObjectURL(f));
            setPreviewGallery(prev => [...prev, ...newPreviews]);
        }
    };

    const removeGalleryImage = (index: number) => {
        const currentImages = formData.images || [];
        if (index < currentImages.length) {
            const newImages = [...currentImages];
            newImages.splice(index, 1);
            setFormData({ ...formData, images: newImages });
            setPreviewGallery(prev => prev.filter((_, i) => i !== index));
        } else {
            const fileIndex = index - currentImages.length;
            const newFiles = [...galleryFiles];
            newFiles.splice(fileIndex, 1);
            setGalleryFiles(newFiles);
            setPreviewGallery(prev => prev.filter((_, i) => i !== index));
        }
    };

    // --- Photo Description Handlers (landing page) ---

    const addPhotoDescription = () => {
        const current = formData.landing_content?.photo_descriptions || [];
        setFormData({
            ...formData,
            landing_content: {
                ...formData.landing_content,
                photo_descriptions: [...current, { image: '', desc: '' }]
            }
        });
    };

    const removePhotoDescription = (index: number) => {
        const current = [...(formData.landing_content?.photo_descriptions || [])];
        current.splice(index, 1);
        setFormData({
            ...formData,
            landing_content: { ...formData.landing_content, photo_descriptions: current }
        });
    };

    const updatePhotoDescription = (galleryIndex: number, desc: string) => {
        const current: any[] = [...(formData.landing_content?.photo_descriptions || [])];
        const existingIdx = current.findIndex(pd => pd.gallery_index === galleryIndex);

        if (existingIdx > -1) {
            current[existingIdx] = { ...current[existingIdx], desc };
        } else {
            current.push({ gallery_index: galleryIndex, desc });
        }

        setFormData({
            ...formData,
            landing_content: { ...formData.landing_content, photo_descriptions: current }
        });
    };



    // --- Submit ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setUploading(true);

        try {
            if (!formData.category_id) {
                alert('Mohon pilih kategori terlebih dahulu.');
                setLoading(false);
                setUploading(false);
                return;
            }

            let mainImageUrl = formData.image_url;
            let heroImageUrl = formData.hero_image_url;
            const galleryUrls = [...(formData.images || [])];

            if (mainImageFile) mainImageUrl = await uploadFile(mainImageFile);
            if (heroImageFile) heroImageUrl = await uploadFile(heroImageFile);

            if (galleryFiles.length > 0) {
                for (const file of galleryFiles) {
                    const url = await uploadFile(file);
                    galleryUrls.push(url);
                }
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                base_price: Number(formData.base_price),
                category_id: Number(formData.category_id),
                image_url: mainImageUrl,
                hero_image_url: heroImageUrl,
                images: galleryUrls,
                stock: Number(formData.stock),
                colors: formData.colors,
                dimensions: formData.dimensions || {},
                is_hero: formData.is_hero || false,
                is_promo: formData.is_promo || false,
                template_type: formData.template_type || 'standard',
                landing_content: formData.landing_content || {},
            };

            if (editingProduct) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('products').insert([payload]);
                if (error) throw error;
            }

            await fetchProducts();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving product:', error);
            alert(`Gagal menyimpan produk: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus produk ini?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            await fetchProducts();
        } catch (error: any) {
            alert(`Gagal menghapus: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Colors Handlers ---
    const addColor = () => setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), { name: 'New Color', code: '#000000' }] }));
    const updateColor = (index: number, key: keyof ProductColor, value: string) => {
        const newColors = [...(formData.colors || [])];
        newColors[index] = { ...newColors[index], [key]: value };
        setFormData({ ...formData, colors: newColors });
    };
    const removeColor = (index: number) => {
        const newColors = [...(formData.colors || [])];
        newColors.splice(index, 1);
        setFormData({ ...formData, colors: newColors });
    };

    return (
        <div className="space-y-6 bg-gray-50 min-h-screen p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Daftar Produk</h1>
                    <p className="text-gray-500">Kelola katalog dan inventaris produk.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30"
                >
                    <Plus size={20} /> Tambah Produk
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading && products.length === 0 ? (
                    <div className="p-12 flex justify-center items-center text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Memuat data...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Produk</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Harga</th>
                                    <th className="px-6 py-4">Stok</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative flex-shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{product.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {/* @ts-ignore */}
                                                            {product.categories?.name || 'Uncategorized'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.template_type === 'premium' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                                        <Layers size={12} /> Landing Page
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        <ShoppingBag size={12} /> Classic
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                                                Rp {product.base_price?.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.stock} Unit
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Belum ada produk.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="flex items-center gap-3">
                                    {creationStep === 'form' && !editingProduct && (
                                        <button onClick={() => setCreationStep('type-selection')} className="text-gray-400 hover:text-gray-600 transition-colors">
                                            <ArrowLeft size={20} />
                                        </button>
                                    )}
                                    <h3 className="font-bold text-xl text-gray-900">
                                        {creationStep === 'type-selection' ? 'Pilih Tipe Produk' : (editingProduct ? 'Edit Produk' : 'Tambah Produk Baru')}
                                    </h3>
                                </div>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto bg-white">

                                {/* Step 1: Type Selection */}
                                {creationStep === 'type-selection' ? (
                                    <div className="p-12 flex flex-col md:flex-row gap-8 justify-center items-stretch h-full">

                                        <button
                                            onClick={() => {
                                                setFormData({ ...formData, template_type: 'standard' });
                                                setCreationStep('form');
                                            }}
                                            className="flex-1 border-2 border-gray-200 rounded-3xl p-8 hover:border-amber-500 hover:bg-amber-50/30 transition-all group text-left relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <ShoppingBag size={120} />
                                            </div>
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-amber-500 group-hover:text-white transition-colors mb-6 shadow-sm">
                                                <ShoppingBag size={32} />
                                            </div>
                                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Classic Product</h4>
                                            <p className="text-gray-500 leading-relaxed">
                                                Tampilan standar e-commerce. Cocok untuk produk umum dengan galeri foto dan spesifikasi sederhana.
                                            </p>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setFormData({ ...formData, template_type: 'premium' });
                                                setCreationStep('form');
                                            }}
                                            className="flex-1 border-2 border-gray-200 rounded-3xl p-8 hover:border-purple-500 hover:bg-purple-50/30 transition-all group text-left relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Layers size={120} />
                                            </div>
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-6 shadow-sm">
                                                <Layers size={32} />
                                            </div>
                                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Landing Page (Premium)</h4>
                                            <p className="text-gray-500 leading-relaxed">
                                                Tampilan satu halaman penuh dengan storytelling, fitur parallax, dan showcase detail. Cocok untuk produk unggulan.
                                            </p>
                                        </button>

                                    </div>
                                ) : (
                                    /* Step 2: Form */
                                    <form id="productForm" onSubmit={handleSubmit} className="p-8 space-y-8">

                                        {/* Basic Info */}
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2">Informasi Utama</h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Produk</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="Contoh: Kursi Jati Minimalis"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none appearance-none"
                                                            value={formData.category_id || ''}
                                                            onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                                                        >
                                                            <option value="">Pilih Kategori</option>
                                                            {categories.map(c => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
                                                    </div>
                                                </div>

                                                {/* Price with Formatter */}
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Harga (IDR)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-3.5 text-gray-500 font-bold">Rp</span>
                                                        <input
                                                            type="text"
                                                            className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-mono font-bold"
                                                            value={formData.base_price ? new Intl.NumberFormat('id-ID').format(formData.base_price) : ''}
                                                            onChange={e => {
                                                                const raw = e.target.value.replace(/\D/g, '');
                                                                setFormData({ ...formData, base_price: Number(raw) });
                                                            }}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Stok</label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                                                        value={formData.stock}
                                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Singkat</label>
                                                <textarea
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none h-32 resize-none"
                                                    value={formData.description || ''}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Deskripsi singkat produk..."
                                                />
                                            </div>
                                        </div>

                                        {/* Ukuran Produk - Opsional untuk semua tipe */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2 flex-1">Ukuran Produk <span className="normal-case font-normal text-gray-400">[Opsional]</span></h4>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {(['panjang', 'lebar', 'tinggi', 'berat'] as const).map((key) => (
                                                    <div key={key}>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1 capitalize">{key === 'berat' ? 'Berat (kg)' : `${key.charAt(0).toUpperCase() + key.slice(1)} (cm)`}</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                                                            value={(formData.dimensions as any)?.[key] || ''}
                                                            onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions, [key]: e.target.value } })}
                                                            placeholder={key === 'berat' ? 'e.g. 15' : 'e.g. 120'}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Media Upload */}
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2">Media & Visual</h4>

                                            <div className="flex gap-6">
                                                {/* Main Image */}
                                                <div className="flex-1">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Gambar Utama (Thumbnail)</label>
                                                    <label className="block w-full h-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50/50 transition-all cursor-pointer relative overflow-hidden bg-gray-50">
                                                        {previewMain ? (
                                                            <img src={previewMain} alt="Preview" className="w-full h-full object-contain p-2" />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                                <UploadCloud size={32} className="mb-2" />
                                                                <span className="text-sm">Upload Image</span>
                                                            </div>
                                                        )}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                                                    </label>
                                                </div>

                                                {/* Gallery */}
                                                <div className="flex-[2]">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Galeri (Slide Show)</label>
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {previewGallery.map((url, idx) => (
                                                            <div key={idx} className="aspect-square rounded-xl bg-gray-100 border border-gray-200 relative group overflow-hidden">
                                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                                <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-white shadow-sm p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50/50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400">
                                                            <Plus size={24} />
                                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Promo & Discount Configuration */}
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2">Status Promo & Diskon</h4>

                                            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    {/* Promo Checkbox */}
                                                    <label className="flex items-start gap-4 cursor-pointer">
                                                        <div className="relative flex items-center mt-1">
                                                            <input
                                                                type="checkbox"
                                                                className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-red-300 bg-white checked:bg-red-600 checked:border-transparent transition-all"
                                                                checked={formData.is_promo || false}
                                                                onChange={e => setFormData({ ...formData, is_promo: e.target.checked })}
                                                            />
                                                            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                                <CheckCircle2 size={16} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-900 block text-lg">Aktifkan Status Promo</span>
                                                            <span className="text-sm text-gray-600">Produk akan ditandai dengan label "Promo" dan harga coret (jika diisi).</span>
                                                        </div>
                                                    </label>

                                                    {/* Original Price / Strikethrough Price */}
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-bold text-red-900 mb-2">Harga Coret / Harga Normal (Sebelum Diskon) <span className="text-gray-400 font-normal">[Opsional]</span></label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-3.5 text-red-300 font-bold">Rp</span>
                                                            <input
                                                                type="text"
                                                                className="w-full pl-10 px-4 py-3 rounded-xl border border-red-200 bg-white text-gray-900 placeholder-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-mono font-bold"
                                                                value={formData.landing_content?.original_price ? new Intl.NumberFormat('id-ID').format(formData.landing_content.original_price) : ''}
                                                                onChange={e => {
                                                                    const raw = e.target.value.replace(/\D/g, '');
                                                                    setFormData({
                                                                        ...formData,
                                                                        landing_content: {
                                                                            ...formData.landing_content,
                                                                            original_price: Number(raw)
                                                                        }
                                                                    });
                                                                }}
                                                                placeholder="Contoh: 5000000"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-red-400 mt-2">
                                                            *Harga jual saat ini: <span className="font-bold">Rp {new Intl.NumberFormat('id-ID').format(formData.base_price || 0)}</span>.
                                                            Pastikan harga coret lebih tinggi dari harga jual.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2">Pengaturan Header / Hero</h4>

                                            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                                                <label className="flex items-start gap-3 cursor-pointer mb-4">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-amber-400 bg-white checked:bg-amber-600 checked:border-transparent transition-all"
                                                            checked={formData.is_hero || false}
                                                            onChange={e => setFormData({ ...formData, is_hero: e.target.checked })}
                                                        />
                                                        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block">Jadikan Produk Unggulan (Hero Header)</span>
                                                        <span className="text-sm text-gray-600">Produk ini akan muncul di slider utama halaman depan.</span>
                                                    </div>
                                                </label>

                                                {/* Hero Image Upload - Only if is_hero */}
                                                <AnimatePresence>
                                                    {formData.is_hero && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pl-8 pt-2">
                                                                <label className="block text-sm font-bold text-amber-800 mb-2">
                                                                    Gambar Hero (PNG Transparan) <span className="text-amber-600 font-normal">*Wajib untuk hasil terbaik</span>
                                                                </label>
                                                                <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-amber-300 bg-white hover:bg-amber-50 transition-colors cursor-pointer relative">
                                                                    {previewHero ? (
                                                                        <img src={previewHero} alt="Hero Preview" className="h-full object-contain p-2" />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center text-amber-500">
                                                                            <ImageIcon className="w-8 h-8 mb-2" />
                                                                            <p className="text-xs font-bold">Klik untuk upload PNG</p>
                                                                            <p className="text-[10px] opacity-70">Pastikan background transparan</p>
                                                                        </div>
                                                                    )}
                                                                    <input type="file" className="hidden" accept="image/png, image/*" onChange={handleHeroImageChange} />
                                                                </label>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        {formData.template_type === 'premium' && (
                                            <div className="space-y-8 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Layers className="text-amber-600" />
                                                    <h4 className="text-lg font-bold text-stone-900">Konten Landing Page</h4>
                                                </div>

                                                {/* 1. Hero & Philosophy */}
                                                <div className="space-y-4">
                                                    <h5 className="text-sm font-bold text-stone-800 uppercase border-b border-stone-200 pb-1">1. Hero & Filosofi</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-stone-700 mb-1">Tagline (Hero)</label>
                                                            <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:border-amber-500 focus:outline-none" placeholder="e.g. Kehangatan Alami"
                                                                value={formData.landing_content?.tagline || ''}
                                                                onChange={e => setFormData({ ...formData, landing_content: { ...formData.landing_content, tagline: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-stone-700 mb-1">Judul Story</label>
                                                            <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:border-amber-500 focus:outline-none" placeholder="e.g. Dibuat dengan Hati"
                                                                value={formData.landing_content?.story_title || ''}
                                                                onChange={e => setFormData({ ...formData, landing_content: { ...formData.landing_content, story_title: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div className="col-span-full">
                                                            <label className="block text-xs font-bold text-stone-700 mb-1">Isi Cerita (Philosophy)</label>
                                                            <textarea className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm h-20 focus:border-amber-500 focus:outline-none" placeholder="Ceritakan detail filosofi produk..."
                                                                value={formData.landing_content?.story_text || ''}
                                                                onChange={e => setFormData({ ...formData, landing_content: { ...formData.landing_content, story_text: e.target.value } })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Foto + Deskripsi per Foto (OTOMATIS dari Galeri) */}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="text-sm font-bold text-stone-800 uppercase border-b border-stone-200 pb-1 flex-1">2. Deskripsi Foto Produk (Otomatis)</h5>
                                                    </div>
                                                    <p className="text-xs text-stone-500 italic">Isi deskripsi di bawah untuk menjelaskan setiap foto yang sudah Anda upload di bagian "Media & Visual". Foto akan otomatis sinkron.</p>

                                                    <div className="space-y-4">
                                                        {/* Foto Utama */}
                                                        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm relative">
                                                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
                                                                <div className="w-28 h-28 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                                                                    {previewMain ? <img src={previewMain} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300">No Image</div>}
                                                                    <div className="absolute top-0 left-0 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg uppercase">Utama</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Deskripsi Foto Utama</p>
                                                                    <textarea
                                                                        placeholder="Ceritakan detail menarik dari foto utama ini..."
                                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm resize-none h-20 focus:border-amber-500 focus:outline-none placeholder-gray-400"
                                                                        value={formData.landing_content?.photo_descriptions?.find((pd: any) => pd.gallery_index === -1)?.desc || ''}
                                                                        onChange={(e) => updatePhotoDescription(-1, e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Foto Galeri */}
                                                        {previewGallery.map((url, idx) => (
                                                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                                                                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
                                                                    <div className="w-28 h-28 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                                        <div className="absolute top-0 left-0 bg-gray-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg uppercase">Galeri {idx + 1}</div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Deskripsi Galeri {idx + 1}</p>
                                                                        <textarea
                                                                            placeholder="Jelaskan detail pada foto galeri ini..."
                                                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm resize-none h-20 focus:border-amber-500 focus:outline-none placeholder-gray-400"
                                                                            value={formData.landing_content?.photo_descriptions?.find((pd: any) => pd.gallery_index === idx)?.desc || ''}
                                                                            onChange={(e) => updatePhotoDescription(idx, e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Bagian untuk Data Terlanjur (Manual) - Hanya tampil jika ada data lama yang bukan merupakan indeks galeri */}
                                                        {formData.landing_content?.photo_descriptions?.filter((pd: any) => pd.image && pd.gallery_index === undefined).length > 0 && (
                                                            <div className="mt-8 pt-6 border-t border-gray-100">
                                                                <h6 className="text-xs font-bold text-gray-400 uppercase mb-4">Foto Tambahan (Data Lama)</h6>
                                                                <div className="space-y-4 opacity-70">
                                                                    {formData.landing_content.photo_descriptions.filter((pd: any) => pd.image && pd.gallery_index === undefined).map((pd: any, idx: number) => (
                                                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg flex gap-4 items-center">
                                                                            <img src={pd.image} className="w-12 h-12 object-cover rounded" alt="" />
                                                                            <p className="text-xs text-gray-600 italic line-clamp-2">{pd.desc}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </form>
                                )}

                            </div>

                            {/* Footer / Actions */}
                            {creationStep === 'form' && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        form="productForm"
                                        disabled={loading || uploading}
                                        className="px-8 py-2.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading || uploading ? <Loader2 className="animate-spin" size={18} /> : (editingProduct ? 'Simpan Perubahan' : 'Publish Produk')}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
