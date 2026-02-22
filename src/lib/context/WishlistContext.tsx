'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/types';

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (product: Product) => void;
    totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load dari localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('rupa_kayu_wishlist');
            if (saved) {
                try { setWishlist(JSON.parse(saved)); } catch { }
            }
            setIsLoaded(true);
        }
    }, []);

    // Simpan ke localStorage setiap berubah
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rupa_kayu_wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, isLoaded]);

    const addToWishlist = (product: Product) => {
        setWishlist(prev => prev.find(p => p.id === product.id) ? prev : [...prev, product]);
    };

    const removeFromWishlist = (productId: number) => {
        setWishlist(prev => prev.filter(p => p.id !== productId));
    };

    const isInWishlist = (productId: number) => wishlist.some(p => p.id === productId);

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const totalWishlist = wishlist.length;

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, totalWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist harus dipakai dalam WishlistProvider');
    return context;
}
