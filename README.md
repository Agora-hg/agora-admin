# Agora Admin (`agora-admin`)

React-админка каталога Agora: поставщики, офферы, сводка, тестовый ИИ-подбор, журнал чатов.

Org: [Agora-hg](https://github.com/Agora-hg)

| Репо | Назначение |
|---|---|
| [agora-back](https://github.com/Agora-hg/agora-back) | Laravel API |
| **[agora-admin](https://github.com/Agora-hg/agora-admin)** | этот репозиторий |
| [agora-leads](https://github.com/Agora-hg/agora-leads) | лиды для продаж |

## Стек

Vite · React 19 · TypeScript · React Router · Sanctum Bearer (`localStorage`)

## Локально

Сначала подними API (`agora-back` на `:8000`).

```bash
cp .env.example .env
# VITE_API_URL=http://127.0.0.1:8000
npm install
npm run dev
```

http://localhost:5173  

Логин после `php artisan migrate --seed` на бэке: `admin@agora.local` / `password`

В `agora-back` `.env`: `ADMIN_FRONTEND_URL=http://localhost:5173`

## Vercel

1. Import **этот** репо (`Agora-hg/agora-admin`)  
2. Framework: Vite  
3. Env: `VITE_API_URL=https://your-api-domain.com` (без хвоста `/api` или с — смотри `src/api/client.ts`)  
4. SPA rewrite в `vercel.json`  
5. На бэке: `ADMIN_FRONTEND_URL=https://your-admin.vercel.app`

## Страницы

`/` сводка · `/offers` · `/suppliers` · `/ai` тест подбора · `/ai/sessions` все чаты

Стоимость LLM видна **только** в админке, на витрину не отдаётся.

Не коммитить `.env`, `node_modules/`, `dist/`.
