import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSubdomain } from "./lib/subdomain";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "metodogl.online";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Só ativa rewrite quando o host realmente pertence ao domínio raiz
  const isRootDomain = host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`);
  if (!isRootDomain) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(host, ROOT_DOMAIN);
  if (!subdomain) {
    return NextResponse.next();
  }

  // Impede que subdomínios acessem /admin
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
