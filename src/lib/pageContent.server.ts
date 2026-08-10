// =========================================================
// Funções server-side para ler conteúdo editável do banco.
// IMPORTADO APENAS POR SERVER COMPONENTS / API ROUTES.
//
// Separado de `./pageContent.ts` para que componentes client
// (Navbar, Footer, etc.) possam importar tipos + constantes
// sem trazer Prisma para o bundle do navegador.
//
// `prisma.ts` é estrito: lança erro se DATABASE_URL não estiver
// definida. Aqui só chamamos Prisma dentro de funções — então
// mesmo se algum bundler tree-shake errado tentar puxar este
// arquivo pro client, o erro só dispara no momento da chamada,
// não no import.
// =========================================================

import { prisma } from "@/lib/prisma";
import { DEFAULT_CONTENT, type PageContentKey } from "./pageContent";

/** Lê uma chave; cai pro `DEFAULT_CONTENT[key]` se DB falhar
 *  ou se a chave não existir no banco. */
export async function getPageContent<K extends PageContentKey>(
  key: K,
): Promise<(typeof DEFAULT_CONTENT)[K]> {
  const fallback = DEFAULT_CONTENT[key];
  try {
    const row = await prisma.pageContent.findUnique({ where: { key } });
    if (!row || !row.content) return fallback;
    // Merge raso: o que está no banco sobrescreve o default.
    const merged = { ...fallback, ...(row.content as object) };
    return merged as (typeof DEFAULT_CONTENT)[K];
  } catch (error) {
    // DB offline, tabela inexistente, etc. — nunca quebra a página.
    console.warn(`[pageContent] Falha ao ler ${key}, usando fallback`, error);
    return fallback;
  }
}

/** Lê várias chaves em paralelo. */
export async function getPageContents<K extends PageContentKey>(keys: readonly K[]) {
  return Promise.all(keys.map((k) => getPageContent(k)));
}
