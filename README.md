# Painel de Mentorados - Método GL

Sistema multi-tenant para criar páginas de captura individuais para cada mentorado, com subdomínio automático e Meta Pixel individual.

## Funcionalidades

- **Painel administrativo** protegido por login (`/admin`)
- **CRUD de mentorados** com todos os textos, cores, imagem e link editáveis
- **Subdomínio automático** no formato `slug.metodogl.online`
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

Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL="postgresql://postgres:senha@host.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="coloque-um-hash-seguro-aqui"
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
NEXT_PUBLIC_ROOT_DOMAIN="metodogl.online"
```

## Rodando localmente

```bash
npm install
npx prisma migrate dev
npm run dev
```

Depois acesse `http://localhost:3000/api/seed` para criar o usuário administrador padrão:

- Email: `admin@metodogl.online`
- Senha: `admin123`

## Configuração de DNS para subdomínios

No painel da LocalWeb (ou gerenciador de DNS do domínio), aponte:

| Tipo | Host | Valor |
|---|---|---|
| A | `@` | IP que a Vercel indicar |
| CNAME | `*` | `cname.vercel-dns.com` |

> Confira os valores exatos na Vercel em **Project → Settings → Domains** ao adicionar `metodogl.online` e `*.metodogl.online`.

## Deploy na Vercel

1. Crie um repositório no GitHub e envie o código.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente.
4. Adicione os domínios `metodogl.online` e `*.metodogl.online`.
5. Aplique as migrations no banco de dados.

## Estrutura de subdomínios

- Painel: `metodogl.online/admin`
- Página do mentorado: `slug.metodogl.online`

## Licença

Uso interno - SM Company.
