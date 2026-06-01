# Catálogo WhatsApp

Catálogo PWA compartilhável pelo WhatsApp, com controle de estoque manual e pagamento PIX (v2).

## Stack

- Next.js 16 + TypeScript + Tailwind
- PostgreSQL + Prisma
- NextAuth (credenciais) para admin
- PIX via Mercado Pago (ou mock em desenvolvimento)

## Início rápido

### 1. Banco de dados

Por padrão o projeto usa **SQLite** em desenvolvimento (`file:./dev.db`).

Para **PostgreSQL** em produção, altere `provider` em `prisma/schema.prisma` para `postgresql` e configure `DATABASE_URL`.

Com Docker (opcional):

```bash
docker compose up -d
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `DATABASE_URL` e `AUTH_SECRET`.

### 3. Instalar e migrar

```bash
npm install
npm run db:push
npm run db:seed
```

### 4. Rodar

```bash
npm run dev
```

### Testar no emulador Android ou celular na mesma rede

```bash
npm run dev:mobile
```

| Onde abrir | URL |
|------------|-----|
| Emulador Android (Android Studio) | `http://10.0.2.2:3000/s/minha-loja` |
| Celular físico (mesmo Wi‑Fi) | `http://SEU_IP:3000/s/minha-loja` (ex: `http://192.168.0.6:3000/s/minha-loja`) |

No `.env`, ajuste `NEXT_PUBLIC_APP_URL` para o mesmo endereço que o emulador usa.

- **Catálogo público:** http://localhost:3000/s/minha-loja
- **Admin:** http://localhost:3000/admin/login — `admin@loja.com` / `admin123`

## Habilitar PIX (v2)

No `.env`:

```
PAYMENTS_ENABLED=true
NEXT_PUBLIC_PAYMENTS_ENABLED=true
MERCADOPAGO_ACCESS_TOKEN=seu_token
```

Sem token do Mercado Pago, o sistema usa provedor **mock** em desenvolvimento (botão "Simular pagamento" na tela do pedido).

Webhook PIX: `POST /api/webhooks/pix`

## Deploy (Vercel)

1. Conecte o repositório na Vercel
2. Configure `DATABASE_URL` (Neon, Supabase ou Prisma Postgres)
3. Configure `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
4. `npm run build` roda `prisma generate` automaticamente

## Estrutura

- `/s/[slug]` — catálogo público (cliente)
- `/admin` — painel do lojista
- `/api/webhooks/pix` — confirmação de pagamento

## Multi-loja (futuro)

O schema usa `storeId` em todas as entidades. Para adicionar lojas, crie novos registros em `stores` e usuários vinculados.
