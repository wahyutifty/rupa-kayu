export type Category = {
    id: number;
    name: string;
    slug: string;
    image_url: string;
    description?: string;
    created_at?: string;
};

export type ProductColor = {
    name: string;
    code: string;
    image?: string;
};

export type Room = {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    items?: number[]; // Array of product IDs
    created_at?: string;
};

export type ProductDimensions = {
    panjang?: string;
    lebar?: string;
    tinggi?: string;
    berat?: string;
};

// landing_content structure (JSONB):
// {
//   tagline?: string,
//   story_title?: string,
//   story_text?: string,
//   original_price?: number,
//   photo_descriptions?: { image: string, desc: string }[],  // foto + deskripsi per foto
//   specs?: { label: string, value: string }[],
// }

export type Product = {
    id: number;
    name: string;
    description?: string;
    base_price: number;
    category_id?: number;
    image_url?: string;
    images?: string[];
    colors?: ProductColor[]; // JSONB in DB
    dimensions?: ProductDimensions; // JSONB - opsional, ukuran produk
    is_hero: boolean;
    hero_image_url?: string; // Optional: specific transparent PNG for hero
    is_promo: boolean;
    stock: number;
    created_at?: string;
    template_type?: 'standard' | 'premium';
    landing_content?: any; // JSONB for flexible content
    // Joined fields
    categories?: any; // Use 'any' to allow partial selection (e.g. only name) from joins
};

export type Post = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    image_url?: string;
    author_name: string;
    published: boolean;
    created_at?: string;
    updated_at?: string;
};

export type Database = {
    public: {
        Tables: {
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'created_at'>;
                Update: Partial<Omit<Category, 'id'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at'>;
                Update: Partial<Omit<Product, 'id'>>;
            };
            posts: {
                Row: Post;
                Insert: Omit<Post, 'id' | 'created_at'>;
                Update: Partial<Omit<Post, 'id'>>;
            };
        };
    };
};
