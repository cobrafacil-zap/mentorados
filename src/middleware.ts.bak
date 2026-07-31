import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSubdomain } from "./lib/subdomain";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "metodogl.online";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Se o acesso for pelo subdomínio, reescreve internamente para /[slug]
  const subdomain = getSubdomain(host, ROOT_DOMAIN);

  if (subdomain) {
    // Impede que subdomínio acesse /admin
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Domínio raiz: libera /admin e página inicial normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ignora arquivos estáticos e API
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
