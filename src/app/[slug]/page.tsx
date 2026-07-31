import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/LandingPage";
import { getSubdomain } from "@/lib/subdomain";
import { headers } from "next/headers";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "metodogl.online";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MentoradoPage({ params }: PageProps) {
  const { slug } = await params;

  // Detecta se o acesso foi via subdomínio ou direto pela rota /[slug]
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const subdomain = getSubdomain(host, ROOT_DOMAIN);

  // Prioriza o subdomínio real; se não houver, usa o slug da URL
  const mentoradoSlug = subdomain || slug;

  const mentorado = await prisma.mentorado.findUnique({
    where: { slug: mentoradoSlug, ativo: true },
  });

  if (!mentorado) {
    notFound();
  }

  return <LandingPage mentorado={mentorado} />;
}
