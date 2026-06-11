# Moldir Base

Knowledge base для продуктов Marine Health, бренд-стиля, мокапов, транскрибаций и будущего контент-конвейера.

Структура приведена к стилю `MH_Knowledge_Gateway`: активный контракт базы лежит в `export/`, сервисный индекс и машинные карточки лежат в `data/`, будущий generated-контент лежит в `content/`.

## Что внутри

- `export/` — главный слой для внешних сервисов, MCP и будущих генераторов.
- `export/knowledge/*.md` — prompt-loaded база знаний: бренд, продукты, транскрибации index, ассеты index.
- `export/assets` — логотип и мокапы.
- `export/transcripts` — полные транскрибации YouTube.
- `export/runtime` — контракт MCP/API и будущий content pipeline.
- `export/templates` — шаблоны брифов для статей, соцсетей и видео.
- `data/entities` — структурированные JSON-карточки продуктов и наборов.
- `data/indices` — общий индекс для поиска и API.
- `content/` — рабочая зона будущих jobs, статей, постов и видео-брифов с review metadata.

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

## Content pipeline foundation

Phase 2 начинается с файлового контракта, а не с прямых LLM-вызовов:

- `content/jobs` — заявки на генерацию.
- `content/articles` — черновики и утвержденные статьи.
- `content/social-posts` — captions, carousel outlines и short-form scripts.
- `content/video-briefs` — будущие видео-брифы и HeyGen-ready drafts.

Шаблоны лежат в `export/templates`: `content-job.md`, `generated-article.md`, `generated-social-post.md`.
Сгенерированный контент не должен попадать в `export/knowledge`; там остается только trusted knowledge contract.

## Проверка

```bash
npm run validate
```

Команда собирает TypeScript и пересоздает `data/indices`, `data/entities`, а также index-файлы в `export/knowledge`.
