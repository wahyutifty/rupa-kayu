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
    Search,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';

type Room = {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    items?: any[]; // Array of product IDs or objects
    created_at?: string;
};

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState<Partial<Room>>({
        name: '',
        description: '',
        image_url: '',
        items: []
    });

    // File State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    // Product Selection
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        Promise.all([fetchRooms(), fetchProducts()]);
    }, []);

    async function fetchRooms() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRooms(data || []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchProducts() {
        const { data } = await supabase.from('products').select('id, name, image_url');
        if (data) setProducts(data as unknown as Product[]);
    }

    const handleOpenModal = (room?: Room) => {
        if (room) {
            setEditingRoom(room);
            setFormData(room);
            setPreview(room.image_url || '');
        } else {
            setEditingRoom(null);
            setFormData({
                name: '',
                description: '',
                image_url: '',
                items: []
            });
            setPreview('');
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
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

    const toggleProductSelection = (productId: number) => {
        const currentItems = (formData.items as number[]) || [];
        if (currentItems.includes(productId)) {
            setFormData({ ...formData, items: currentItems.filter(id => id !== productId) });
        } else {
            setFormData({ ...formData, items: [...currentItems, productId] });
        }
    };

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to 'rooms' bucket
        const { error: uploadError } = await supabase.storage
            .from('rooms')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.warn('Upload to rooms bucket failed, trying products bucket...', uploadError);
            // Fallback
            const { error: fallbackError } = await supabase.storage
                .from('products')
                .upload(`rooms/${filePath}`, file);

            if (fallbackError) throw fallbackError;

            const { data } = supabase.storage.from('products').getPublicUrl(`rooms/${filePath}`);
            return data.publicUrl;
        }

        const { data } = supabase.storage.from('rooms').getPublicUrl(filePath);
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
                name: formData.name,
                description: formData.description,
                image_url: imageUrl,
                items: formData.items || []
            };

            if (editingRoom) {
                const { error } = await supabase
                    .from('rooms')
                    .update(payload)
                    .eq('id', editingRoom.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('rooms')
                    .insert([payload]);
                if (error) throw error;
            }

            await fetchRooms();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving room:', error);
            alert(`Gagal menyimpan inspirasi ruang: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus inspirasi ruang ini?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('rooms').delete().eq('id', id);
            if (error) throw error;
            await fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Gagal menghapus data');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inspirasi Ruang</h1>
                    <p className="text-gray-500 text-sm">Kelola galeri inspirasi ruangan (Lookbook).</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                >
                    <Plus size={18} />
                    Tambah Ruang
                </button>
            </div>

            {/* List Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden group hover:shadow-md transition-all">
                        <div className="aspect-video bg-gray-100 dark:bg-zinc-700 relative overflow-hidden">
                            {room.image_url ? (
                                <img src={room.image_url} alt={room.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(room)} className="p-2 bg-white/90 text-amber-600 rounded-full shadow-sm hover:bg-white transition-colors">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(room.id)} className="p-2 bg-white/90 text-red-600 rounded-full shadow-sm hover:bg-white transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">{room.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{room.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {(room.items as any[])?.length > 0 ? (
                                    <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
                                        {(room.items as any[])?.length} Produk terkait
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Tidak ada produk terkait</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && rooms.length === 0 && (
                <div className="p-12 flex justify-center items-center text-gray-500">
                    <Loader2 className="animate-spin mr-2" /> Memuat data...
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {editingRoom ? 'Edit Ruang Inspirasi' : 'Tambah Ruang Inspirasi'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <form id="roomForm" onSubmit={handleSubmit} className="space-y-4">

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Ruangan</label>
                                        <div className="h-48 w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 overflow-hidden flex flex-col items-center justify-center relative cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors">
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <ImageIcon size={32} />
                                                    <span className="text-sm mt-2 font-medium">Klik untuk upload foto</span>
                                                </div>
                                            )}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Ruangan</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name || ''}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                placeholder="Contoh: Ruang Tamu Scandinavian"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description || ''}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                                                placeholder="Jelaskan nuansa ruangan ini..."
                                            />
                                        </div>
                                    </div>

                                    {/* Product Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Produk Terkait</label>
                                        <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3">
                                            <div className="relative mb-3">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Cari produk..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-200 dark:border-zinc-600 text-sm focus:outline-none focus:border-amber-500"
                                                />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto space-y-1">
                                                {filteredProducts.map(product => {
                                                    const isSelected = (formData.items as number[])?.includes(product.id);
                                                    return (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => toggleProductSelection(product.id)}
                                                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected
                                                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100'
                                                                : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-600 border-amber-600' : 'border-gray-300'
                                                                }`}>
                                                                {isSelected && <Check size={12} className="text-white" />}
                                                            </div>
                                                            <div className="h-8 w-8 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                                                                {product.image_url && (
                                                                    <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                                                                )}
                                                            </div>
                                                            <span className="text-sm truncate flex-1">{product.name}</span>
                                                        </div>
                                                    );
                                                })}
                                                {filteredProducts.length === 0 && (
                                                    <div className="text-center py-4 text-xs text-gray-500">Tidak ada produk ditemukan</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

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
                                    form="roomForm"
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
