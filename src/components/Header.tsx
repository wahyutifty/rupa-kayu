"use client";

import Link from "next/link";
import { ShoppingBag, Search, Menu, User, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/context/CartContext";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { totalItems } = useCart();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
                    RUPA<span className="text-foreground">KAYU</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                    <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
                    <Link href="/rooms" className="text-sm font-medium hover:text-primary transition-colors">Rooms</Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
                </nav>

                {/* Icons */}
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block relative group">
                        <Heart className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                    </Link>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                        <User className="w-5 h-5" />
                    </button>
                    <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative block">
                        <ShoppingBag className="w-5 h-5" />
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 py-4 animate-fade-in shadow-xl">
                    <div className="container mx-auto px-4 flex flex-col gap-4">
                        <Link href="/" className="text-sm font-medium py-2 border-b border-gray-50">Home</Link>
                        <Link href="/products" className="text-sm font-medium py-2 border-b border-gray-50">Products</Link>
                        <Link href="/rooms" className="text-sm font-medium py-2 border-b border-gray-50">Rooms</Link>
                        <Link href="/about" className="text-sm font-medium py-2">About</Link>
                    </div>
                </div>
            )}
        </header>
    );
}
