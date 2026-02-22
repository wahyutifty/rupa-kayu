'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Gunakan createBrowserClient dari @supabase/ssr
    // agar session disimpan dalam cookie yang bisa dibaca middleware
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.session) {
                router.push('/admin');
                router.refresh();
            }
        } catch (err: any) {
            setError('Email atau password salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 flex items-center justify-center p-4">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                {/* Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-600 to-amber-800 px-8 py-8 text-white text-center">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">RUPA KAYU</h1>
                        <p className="text-amber-200 text-sm mt-1">Admin Panel · Masuk untuk melanjutkan</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="p-8 space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@rupakayu.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-sm text-gray-900 bg-white"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-sm text-gray-900 bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Masuk...</>
                            ) : (
                                'Masuk ke Admin Panel'
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            Hanya untuk admin Rupa Kayu yang berwenang
                        </p>
                    </form>
                </div>

                <p className="text-center text-stone-500 text-xs mt-6">
                    © {new Date().getFullYear()} Rupa Kayu Furniture
                </p>
            </motion.div>
        </div>
    );
}
