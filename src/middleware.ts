import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSubdomain } from "./lib/subdomain";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "metodogl.site";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Só processa subdomínios quando o host termina com o domínio raiz
  if (!host.endsWith(`.${ROOT_DOMAIN}`) && host !== `www.${ROOT_DOMAIN}`) {
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
