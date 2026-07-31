import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/LandingPage";
import { getSubdomain } from "@/lib/subdomain";
import { headers } from "next/headers";
import { Metadata } from "next";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "metodogl.online";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const subdomain = getSubdomain(host, ROOT_DOMAIN);
  const mentoradoSlug = subdomain || slug;

  const mentorado = await prisma.mentorado.findUnique({
    where: { slug: mentoradoSlug, ativo: true },
    select: { nome: true, imagemUrl: true },
  });

  if (!mentorado) {
    return {
      title: "Página não encontrada",
    };
  }

  return {
    title: mentorado.nome,
    icons: mentorado.imagemUrl
      ? {
          icon: mentorado.imagemUrl,
          shortcut: mentorado.imagemUrl,
          apple: mentorado.imagemUrl,
        }
      : undefined,
  };
}

export default async function MentoradoPage({ params }: PageProps) {
  const { slug } = await params;

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const subdomain = getSubdomain(host, ROOT_DOMAIN);
  const mentoradoSlug = subdomain || slug;

  const mentorado = await prisma.mentorado.findUnique({
    where: { slug: mentoradoSlug, ativo: true },
  });

  if (!mentorado) {
    notFound();
  }

  return <LandingPage mentorado={mentorado} />;
}
