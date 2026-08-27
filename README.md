# Agora Admin

Админка каталога: поставщики, офферы, сводка, тест ИИ-подбора, список чатов.

Ходит в Laravel API. Токен Sanctum лежит в `localStorage`.

## Стек

Vite, React 19, TypeScript, React Router.

## Запуск

Нужен API на `:8000`.

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://127.0.0.1:8000
```

```bash
npm install
npm run dev
```

http://localhost:5173 — `admin@agora.local` / `password` (после `migrate --seed` на API).

На бэке: `ADMIN_FRONTEND_URL=http://localhost:5173`

## Экраны

| Путь | Что |
|---|---|
| `/` | сводка каталога и расход ИИ |
| `/offers` | SKU |
| `/suppliers` | компании |
| `/ai` | чат подбора (как будет на витрине + счётчик ₽) |
| `/ai/sessions` | все диалоги |

Стоимость LLM только здесь. Публичный `/api/ai` её не отдаёт.

## Vercel

Import этого репо, фреймворк Vite.

```env
VITE_API_URL=https://your-api.example
```

Корень API без обязательного `/api` — клиент сам клеит путь. Rewrite SPA уже в `vercel.json`.

На бэке: `ADMIN_FRONTEND_URL=https://your-admin.vercel.app`
