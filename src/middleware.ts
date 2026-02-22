import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;

    // Proteksi semua route /admin/** kecuali /admin/login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!user) {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Kalau sudah login, jangan bisa ke /admin/login
    if (pathname === '/admin/login' && user) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*'],
};
