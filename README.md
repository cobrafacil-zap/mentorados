# Painel de Mentorados - Método GL

Sistema multi-tenant para criar páginas de captura individuais para cada mentorado, com subdomínio automático e Meta Pixel individual.

## Funcionalidades

- **Painel administrativo** protegido por login (`/admin`)
- **CRUD de mentorados** com todos os textos, cores, imagem e link editáveis
- **Subdomínio automático** no formato `slug.metodogl.site`
- **Meta Pixel individual** por mentorado
- **Upload de imagens** via Supabase Storage

## Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js (Credentials)
- Supabase Storage

## Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example` (copie e preencha):

```bash
cp .env.example .env
```

Variáveis necessárias (todas têm placeholder no `.env.example`):

| Variável | O que é | Onde pegar |
|---|---|---|
| `DATABASE_URL` | Postgres pooled (porta 6543, com `?pgbouncer=true`) | Supabase → Settings → Database → "Transaction pooler" |
| `DIRECT_URL` | Postgres direto (porta 5432) — usado pelas migrations | Supabase → Settings → Database → "Direct connection" |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin (NUNCA expor no client) | Supabase → Settings → API |
| `NEXTAUTH_SECRET` | Assinatura dos JWTs do NextAuth | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL pública do app | `http://localhost:3000` em dev, `https://metodogl.site` em prod |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Domínio base dos subdomínios | `metodogl.site` |

## Setup do Supabase (passo a passo)

1. **Crie o projeto** em [supabase.com/dashboard](https://supabase.com/dashboard).

2. **Pegue as connection strings**:
   - Settings → Database → Connection string
   - Copie a aba **"Transaction pooler"** → `DATABASE_URL` (porta 6543, com `?pgbouncer=true&connection_limit=1`)
   - Copie a aba **"Direct connection"** → `DIRECT_URL` (porta 5432)

3. **Pegue as chaves de API**:
   - Settings → API
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secreta!) → `SUPABASE_SERVICE_ROLE_KEY`

4. **Crie o bucket de Storage** para upload de vídeos/thumbnails:
   - Storage → New bucket
   - Nome: `videos` (público)
   - Em "Policies", permita SELECT público + INSERT/UPDATE/DELETE apenas para usuários autenticados (a app usa `service_role` server-side, então você pode deixar policies abertas para `service_role` ou criar policies específicas)

5. **Rode as migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   Isso cria as tabelas `User`, `Mentorado`, `Video`, `VideoCategory`, `PageContent` no seu banco Supabase.

6. **Crie o usuário admin** acessando `http://localhost:3000/api/seed` uma vez após o deploy:
   - Email: `admin@metodogl.site`
   - Senha: `admin123`

## Configuração de DNS para subdomínios

No painel da LocalWeb (ou gerenciador de DNS do domínio), aponte:

| Tipo | Host | Valor |
|---|---|---|
| A | `@` | IP que a Vercel indicar |
| CNAME | `*` | `cname.vercel-dns.com` |

> Confira os valores exatos na Vercel em **Project → Settings → Domains** ao adicionar `metodogl.site` e `*.metodogl.site`.

## Deploy na Vercel

1. Crie um repositório no GitHub e envie o código.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente.
4. Adicione os domínios `metodogl.site` e `*.metodogl.site`.
5. Aplique as migrations no banco de dados.

## Estrutura de subdomínios

- Painel: `metodogl.site/admin`
- Página do mentorado: `slug.metodogl.site`

## Licença

Uso interno - SM Company.
