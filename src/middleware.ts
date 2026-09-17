import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Protege todo /(dashboard)/*: sin sesión -> /login.
// La restricción de QUÉ ve cada rol dentro del portal se hace con RLS en
// Supabase (ver supabase/migrations) + NAV_POR_ROL en el sidebar.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
    ["/sell-in", "/sell-out", "/mercaderismo", "/cubicaje"].some((p) =>
      request.nextUrl.pathname.startsWith(p)
    );

  if (!user && isDashboardRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/sell-in/:path*", "/sell-out/:path*", "/mercaderismo/:path*", "/cubicaje/:path*"]
};
