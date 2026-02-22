import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import MobileTaskbar from "@/components/MobileTaskbar";
import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Rupa Kayu | Furnitur Premium",
  description: "Temukan furnitur berkualitas tinggi dengan sentuhan pengrajin lokal terbaik. Desain modern, harga terjangkau.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} antialiased bg-gray-50 pb-16 md:pb-0`}>
        <CartProvider>
          <WishlistProvider>
            {children}
            <MobileTaskbar />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
