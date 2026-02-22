# Rupa Kayu — Premium Furniture E-Commerce Template

Template toko furnitur premium berbasis **Next.js 15** + **Supabase**, dilengkapi dengan admin panel responsif dan fitur lengkap siap pakai.

---

## ✨ Fitur Utama

### 🛍️ Toko (Website Publik)
- Halaman produk dengan template **Standard** dan **Premium**
- Sistem kategori produk
- Halaman promo otomatis (masonry layout)
- Pencarian produk real-time
- Keranjang belanja
- Halaman checkout (redirect ke WhatsApp)
- Inspirasi ruang (Room Visualizer)
- Blog / Berita
- Wishlist
- Tombol WhatsApp floating + di halaman produk
- Mobile-responsive + PWA-ready

### 🔧 Admin Panel
- Dashboard dengan statistik real (total produk, kategori, promo, dll)
- Kelola Produk (CRUD + upload gambar ke Supabase Storage)
- Kelola Kategori
- Kelola Promo (validasi double-promo + auto-expiry)
- Kelola Inspirasi Ruang
- Kelola Artikel/Blog
- Mobile-friendly (bottom nav bar di HP)
- **Login aman** dengan autentikasi Supabase Auth

---

## 🚀 Cara Setup

### 1. Clone & Install
```bash
git clone https://github.com/username/rupa-kayu.git
cd rupa-kayu
npm install
```

### 2. Buat file `.env.local`
```bash
cp .env.example .env.local
```

### 3. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan SQL di folder `supabase/` pada SQL Editor Supabase
3. Buat Storage bucket bernama `products` (public)
4. Salin **Project URL** dan **Anon Key** ke `.env.local`

### 4. Buat Admin User
Di **Supabase Dashboard → Authentication → Users**, klik "Add User" dan masukkan email + password admin kamu.

### 5. Jalankan lokal
```bash
npm run dev
```
- Toko: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) *(login dulu)*

---

## ⚙️ Konfigurasi Penting

### Nomor WhatsApp Penjual
Ganti di **3 file** ini:
| File | Variable |
|---|---|
| `src/components/WhatsAppButton.tsx` | `const WA_NUMBER` |
| `src/components/AddToCartSection.tsx` | `const WA_NUMBER` |
| `src/app/checkout/page.tsx` | URL di `waUrl` |
| `src/components/Footer.tsx` | `const WA_NUMBER` |

Format: `62` + nomor tanpa 0 depan. Contoh: `08123456789` → `628123456789`

### Nama & Branding
Cari-ganti `Rupa Kayu` / `rupakayu` di:
- `src/app/layout.tsx` (metadata SEO)
- `src/components/Footer.tsx`
- `src/app/admin/layout.tsx`

---

## 🌐 Deploy ke Vercel (Gratis)

1. Push ke GitHub: `git push origin main`
2. Import repo di [vercel.com](https://vercel.com)
3. Tambah **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. Klik **Deploy** — selesai!

---

## 🗄️ Tabel Database

| Tabel | Fungsi |
|---|---|
| `products` | Produk (nama, harga, gambar, warna, dimensi) |
| `categories` | Kategori produk |
| `promos` | Promo dengan tanggal expired |
| `rooms` | Inspirasi desain ruang |
| `posts` | Artikel blog |

---

## 📦 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Animasi | Framer Motion |
| Icons | Lucide React |
| Font | Outfit (Google Fonts) |

---

## 📞 Dukungan

Jika ada pertanyaan setup, hubungi via WhatsApp atau email yang tertera di profil penjual template.

---

© 2025 Rupa Kayu Template. Untuk penggunaan komersial.
