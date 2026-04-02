# Analytrick Web

SPA fiel à extensão Chrome. Mesma interface, mesmas tabelas, mesmo comportamento — sem o módulo Navegação (exclusivo da extensão).

## Estrutura

```
app/
  page.tsx              → redirect /app ou /auth/login
  app/page.tsx          → SPA completo (AnalytrickApp)
  auth/login/page.tsx   → Login
  auth/callback/route   → OAuth callback

components/
  AnalytrickApp.tsx     → SPA principal (H1 + tabs + conteúdo)
  table/DataTable.tsx   → Tabela reutilizável (sort, filtro, col manager, paginação)

lib/
  supabase/server.ts    → Client server-side
  supabase/client.ts    → Client browser
  renderCell.tsx        → Port fiel do renderCell da extensão
  colDefs.ts            → Definições de colunas por módulo

types/index.ts          → Tipos TypeScript
```

## Setup

1. Clone o repo
2. `npm install`
3. Copie `.env.local.example` para `.env.local` e preencha com suas credenciais Supabase
4. `npm run dev`

## Deploy Vercel

1. Push para GitHub
2. Conecte ao Vercel
3. Adicione as variáveis de ambiente no painel do Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Canal de dados

O dropdown de canal no H1 controla quais módulos ficam disponíveis:

| Canal         | Módulos disponíveis                                          |
|---------------|--------------------------------------------------------------|
| Sem canal     | Categorias, Marcas                                            |
| Mercado Livre | Anúncios, Categorias, Marcas, Tendências, Vendedores, TOP100, Destaques |

## Tabelas Supabase esperadas

- `mercadolibre_items` — anúncios e destaques
- `mercadolibre_categories` — categorias
- `mercadolibre_brands` — marcas
- `mercadolibre_trends` — tendências
- `mercadolibre_users` — vendedores
- `mercadolibre_top100` — ranking top 100

## Diferenças da extensão

- **Sem módulo Navegação** — depende de scraping de páginas ML, não existe em web
- **Sem colunas pos/pg/ps/offers** — exclusivas da navegação
- **Dados do banco** — tudo carregado do Supabase diretamente (sem scraping)
- **SPA** — uma única URL (`/app`), troca de módulo sem navegação
