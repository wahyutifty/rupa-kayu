'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/types';

export interface CartItem extends Product {
    quantity: number;
    selectedColor?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number, color?: string) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('rupa_kayu_cart');
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rupa_kayu_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (product: Product, quantity = 1, color?: string) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (item) => item.id === product.id && item.selectedColor === color
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                return [...prevCart, { ...product, quantity, selectedColor: color }];
            }
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.base_price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
