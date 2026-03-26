# Analytrick Web

Painel web do Analytrick — consome dados do Supabase coletados pela extensão Chrome.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (banco de dados + auth)
- **Vercel** (deploy)

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas chaves do Supabase

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse http://localhost:3000

## Deploy no Vercel

1. Suba o projeto no GitHub
2. Conecte o repositório no Vercel
3. Faça a integração Vercel ↔ Supabase nas configurações
4. As variáveis de ambiente são injetadas automaticamente

## Estrutura

```
app/
  (auth)/login/     → Página de login
  (app)/
    dashboard/      → KPIs gerais
    anuncios/       → Tabela de anúncios (página principal)
    categorias/     → Módulo de categorias
    marcas/         → Módulo de marcas
    vendedores/     → Módulo de vendedores
    tendencias/     → Módulo de tendências
    destaques/      → Módulo de destaques
components/
  layout/           → Sidebar, Header
  ui/               → Componentes reutilizáveis
  charts/           → Gráficos (Recharts)
  tables/           → Tabelas genéricas
lib/
  supabase/         → Clients (browser e server)
types/              → Tipos TypeScript
```

## Módulos futuros

- [ ] Calculadora de precificação
- [ ] Cadastro de produtos por EAN/GTIN
- [ ] Associação produto ↔ anúncios
- [ ] Margem de lucro por anúncio
- [ ] Tabela dinâmica (pivot)
```
