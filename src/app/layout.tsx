import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Método GL — Método de Grupos Lucrativos",
  description:
    "Plataforma gratuita com conteúdos, estratégias e ferramentas para você aprender a estruturar, divulgar e analisar operações de grupos de ofertas com tráfego pago.",
  metadataBase: new URL("https://metodogl.online"),
  openGraph: {
    title: "Método GL — Método de Grupos Lucrativos",
    description:
      "Conteúdos, estratégias e ferramentas gratuitas para estruturar sua operação de grupos e analisar as métricas que importam.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#050a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
