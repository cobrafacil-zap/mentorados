import MentoradoForm from "@/components/MentoradoForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMentoradoPage({ params }: PageProps) {
  const { id } = await params;
  const mentorado = await prisma.mentorado.findUnique({ where: { id } });

  if (!mentorado) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold">Editar mentorado</h2>
      <MentoradoForm mentorado={mentorado} />
    </div>
  );
}
