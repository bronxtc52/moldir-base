# Moldir Base

База знаний для продуктов Marine Health, мокапов, бренд-стиля и будущего контент-конвейера.

Первая фаза проекта уже заложена так, чтобы другие сервисы могли забирать данные через MCP или HTTP API, а будущие генераторы статей, постов и видео работали от одного источника правды.

## Что внутри

- `knowledge/raw` — первоисточники: продуктовая база, бренд-код, транскрибации, логотип и мокапы.
- `knowledge/entities` — машинные карточки продуктов и наборов, которые генерируются из сырья.
- `knowledge/indices` — общий индекс для поиска и внешних агентов.
- `knowledge/templates` — шаблоны брифов для статей, соцсетей и видео.
- `knowledge/generated` — будущие результаты контент-конвейера.
- `src` — HTTP API и MCP сервер.
- `docs` — архитектура, хранение, roadmap и правила контента.

## Быстрый старт

```bash
npm install
npm run index
npm run dev
```

HTTP API будет доступен на `http://127.0.0.1:4111`.

Полезные ручки:

- `GET /health`
- `GET /api/catalog`
- `GET /api/search?q=ashitaba`
- `GET /api/products`
- `GET /api/products/ashitaba-kapsuly`
- `GET /api/bundles`
- `GET /api/brand`
- `POST /mcp` — Streamable HTTP MCP endpoint

## MCP через stdio

Для MCP-клиентов, которые запускают сервер как процесс:

```bash
npm run mcp
```

Инструменты MCP:

- `search_knowledge` — поиск по базе.
- `get_document` — получить документ по `id` или `slug`.
- `list_catalog` — список продуктов, наборов, транскрибаций, ассетов.
- `get_product` — карточка продукта по slug или названию.
- `get_brand_code` — бренд-код Marine Health.
- `get_content_context` — готовый контекст для генерации статьи, поста или видео-брифа.

## Проверка

```bash
npm run validate
```

Команда собирает TypeScript и пересоздает индекс базы знаний.
