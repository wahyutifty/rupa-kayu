"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Truck, ShieldCheck, MapPin } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        zip: ''
    });

    const shippingCost = 50000;
    const total = totalPrice + shippingCost;

    useEffect(() => {
        if (cart.length === 0) {
            router.push('/cart');
        }
    }, [cart, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Construct WhatsApp Message
        const itemsList = cart.map(item =>
            `- ${item.name} (${item.quantity}x) - Rp ${(item.base_price * item.quantity).toLocaleString('id-ID')}`
        ).join('\n');

        const message = `*Halo Rupa Kayu, saya ingin memesan:*\n\n${itemsList}\n\n*Subtotal:* Rp ${totalPrice.toLocaleString('id-ID')}\n*Ongkir:* Rp ${shippingCost.toLocaleString('id-ID')}\n*Total Bayar:* Rp ${total.toLocaleString('id-ID')}\n\n*Data Pengiriman:*\nNama: ${formData.name}\nNo. HP: ${formData.phone}\nAlamat: ${formData.address}, ${formData.city} ${formData.zip}\nMetode Bayar: ${paymentMethod === 'bank_transfer' ? 'Transfer Bank' : paymentMethod === 'ewallet' ? 'E-Wallet' : 'COD'}`;

        const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;

        // Simulate delay for UX
        setTimeout(() => {
            window.open(waUrl, '_blank');
            clearCart();
            setIsProcessing(false);
            router.push('/');
            alert('Pesanan dialihkan ke WhatsApp! Terima kasih.');
        }, 1500);
    };

    if (cart.length === 0) return null;

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali Belanja
                </Link>

                <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* LEFT: Shipping Form */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Alamat Pengiriman */}
                        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#c5a47e]/10 rounded-full text-[#c5a47e]">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Alamat Pengiriman</h2>
                            </div>

                            <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c5a47e]/50 transition-all font-medium"
                                        placeholder="Nama Penerima"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">No. Telepon</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c5a47e]/50 transition-all font-medium"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c5a47e]/50 transition-all font-medium"
                                        placeholder="email@contoh.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Lengkap</label>
                                    <textarea
                                        name="address"
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c5a47e]/50 transition-all font-medium resize-none"
                                        placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kota / Kabupaten</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c5a47e]/50 transition-all font-medium"
                                        placeholder="Kota..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kode Pos</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        required
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c5a47e]/50 transition-all font-medium"
                                        placeholder="xxxxx"
                                    />
                                </div>
                            </form>
                        </section>

                        {/* 2. Metode Pembayaran */}
                        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#c5a47e]/10 rounded-full text-[#c5a47e]">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Metode Pembayaran</h2>
                            </div>

                            <div className="space-y-4">
                                <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-[#c5a47e] bg-[#c5a47e]/5 ring-1 ring-[#c5a47e]' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank_transfer"
                                        checked={paymentMethod === 'bank_transfer'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-[#c5a47e] focus:ring-[#c5a47e]"
                                    />
                                    <div className="ml-4 flex-1">
                                        <span className="block font-bold text-gray-900">Transfer Bank (Virtual Account)</span>
                                        <span className="block text-sm text-gray-500">BCA, Mandiri, BNI, BRI</span>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'ewallet' ? 'border-[#c5a47e] bg-[#c5a47e]/5 ring-1 ring-[#c5a47e]' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="ewallet"
                                        checked={paymentMethod === 'ewallet'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-[#c5a47e] focus:ring-[#c5a47e]"
                                    />
                                    <div className="ml-4 flex-1">
                                        <span className="block font-bold text-gray-900">E-Wallet / QRIS</span>
                                        <span className="block text-sm text-gray-500">GoPay, OVO, Dana, ShopeePay</span>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#c5a47e] bg-[#c5a47e]/5 ring-1 ring-[#c5a47e]' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-[#c5a47e] focus:ring-[#c5a47e]"
                                    />
                                    <div className="ml-4 flex-1">
                                        <span className="block font-bold text-gray-900">Cash on Delivery (COD)</span>
                                        <span className="block text-sm text-gray-500">Bayar di tempat saat barang sampai</span>
                                    </div>
                                </label>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Pesanan</h2>

                            {/* Product List */}
                            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                            <Image
                                                src={item.hero_image_url || item.image_url || "https://placehold.co/100x100?text=No+Image"}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-500 mb-1">{item.selectedColor}</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">{item.quantity} x</span>
                                                <span className="font-bold text-gray-900">Rp {(item.base_price * item.quantity).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 py-6 border-t border-b border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">Rp {(totalPrice).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span className="font-medium">Rp {(shippingCost).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-[#c5a47e] font-medium text-sm">
                                    <span>Diskon</span>
                                    <span>- Rp 0</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center py-6">
                                <span className="font-bold text-lg text-gray-900">Total Bayar</span>
                                <span className="font-black text-2xl text-[#c5a47e]">Rp {(total).toLocaleString('id-ID')}</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isProcessing}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-[#c5a47e] transition-colors shadow-lg hover:shadow-xl hover:shadow-[#c5a47e]/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>Memproses...</>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        Pesanan via WhatsApp
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <Truck className="w-4 h-4" />
                                <span>Estimasi pengiriman 3-5 hari kerja</span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
