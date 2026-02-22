
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import StandardProductTemplate from "@/components/templates/StandardProductTemplate";
import PremiumProductTemplate from "@/components/templates/PremiumProductTemplate";

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch Product
    const { data: product, error } = await supabase
        .from("products")
        .select(`
            *,
            categories (
                name
            )
        `)
        .eq("id", id)
        .single();

    if (error || !product) {
        notFound();
    }

    // Fetch Related Products (get 4 latest excluding current)
    const { data: relatedProducts } = await supabase
        .from("products")
        .select(`
            *,
            categories (
                name
            )
        `)
        .neq("id", id)
        .limit(4);

    if (product.template_type === 'premium') {
        return <PremiumProductTemplate product={product} />;
    }

    return <StandardProductTemplate product={product} relatedProducts={relatedProducts || []} />;
}
