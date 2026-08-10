// =========================================================
// Cliente GitHub App — usado pelo endpoint /api/admin/videos/
// sync-static para commitar `src/data/videos.ts` automaticamente
// quando o admin sincroniza o catálogo público.
//
// Fluxo:
//  1. Gera um JWT assinado com a private key do App.
//  2. Troca o JWT por um installation access token.
//  3. Usa o token para chamar Contents API (PUT file).
//
// Cache: o installation token vale 1h. Cacheamos pra evitar
// bater no GitHub a cada request.
// =========================================================

const GITHUB_API = "https://api.github.com";
const APP_ID = process.env.GITHUB_APP_ID;
const APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
const APP_INSTALLATION_ID = process.env.GITHUB_APP_INSTALLATION_ID;
const REPO = process.env.GITHUB_REPO ?? "cobrafacil-zap/mentorados";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";

let tokenCache: { token: string; expiresAt: number } | null = null;

// Base64 seguro pra Buffer (Node runtime).
function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signJwt(payload: Record<string, unknown>): Promise<string> {
  const crypto = await import("crypto");
  const header = { alg: "RS256", typ: "JWT" };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  if (!APP_PRIVATE_KEY) {
    throw new Error("GITHUB_APP_PRIVATE_KEY não configurada");
  }
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(APP_PRIVATE_KEY).toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${data}.${signature}`;
}

async function getInstallationToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }
  if (!APP_ID || !APP_INSTALLATION_ID || !APP_PRIVATE_KEY) {
    throw new Error(
      "GitHub App não configurado. Defina GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID e GITHUB_APP_PRIVATE_KEY.",
    );
  }

  // JWT do App (válido 10 min).
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwt({
    iat: now - 30,
    exp: now + 9 * 60,
    iss: APP_ID,
  });

  // Trocar por installation token.
  const res = await fetch(
    `${GITHUB_API}/app/installations/${APP_INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  if (!res.ok) {
    throw new Error(`GitHub installation token falhou: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { token: string; expires_at: string };
  tokenCache = {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  };
  return data.token;
}

/**
 * Cria (ou atualiza) um arquivo no GitHub via Contents API.
 * Retorna o SHA do commit.
 */
export async function commitFile(opts: {
  path: string;        // ex.: "src/data/videos.ts"
  content: string;     // conteúdo UTF-8
  message: string;     // commit message
}): Promise<{ commitSha: string; htmlUrl: string }> {
  const token = await getInstallationToken();

  // 1. Buscar SHA atual do arquivo (se existir) pra fazer update em vez de create.
  let currentSha: string | null = null;
  const getRes = await fetch(
    `${GITHUB_API}/repos/${REPO}/contents/${encodeURI(opts.path)}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  if (getRes.ok) {
    const data = (await getRes.json()) as { sha?: string };
    currentSha = data.sha ?? null;
  } else if (getRes.status !== 404) {
    throw new Error(`GET contents falhou: ${getRes.status} ${await getRes.text()}`);
  }

  // 2. PUT do arquivo.
  const putBody: Record<string, unknown> = {
    message: opts.message,
    branch: BRANCH,
    content: Buffer.from(opts.content, "utf8").toString("base64"),
    committer: {
      name: "Método GL Bot",
      email: "noreply@metodogl.online",
    },
  };
  if (currentSha) putBody.sha = currentSha;

  const putRes = await fetch(
    `${GITHUB_API}/repos/${REPO}/contents/${encodeURI(opts.path)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(putBody),
    },
  );
  if (!putRes.ok) {
    throw new Error(`PUT contents falhou: ${putRes.status} ${await putRes.text()}`);
  }
  const putData = (await putRes.json()) as { commit: { sha: string; html_url: string } };
  return { commitSha: putData.commit.sha, htmlUrl: putData.commit.html_url };
}

export const githubConfig = {
  configured: Boolean(APP_ID && APP_INSTALLATION_ID && APP_PRIVATE_KEY),
  repo: REPO,
  branch: BRANCH,
};