import { redirect } from "next/navigation";

// Redirect /products → /shop (halaman produk yang sebenarnya)
export default function ProductsPage() {
    redirect("/shop");
}
