# Storage Model

Проект использует `export-first` модель, как в `MH_Knowledge_Gateway`.

## Слои

`export`

Главный контракт базы знаний. Это то, что можно читать MCP-клиентам, HTTP-сервисам, AI-агентам и будущему content pipeline.

`export/knowledge`

Prompt-loaded документы:

- `00-brand-code.md` — бренд-код Marine Health.
- `01-products.md` — продуктовая база и наборы.
- `02-transcripts-index.md` — генерируемый индекс транскрибаций.
- `03-assets-and-mockups.md` — генерируемый индекс визуальных ассетов.

`export/assets`

Логотип и мокапы. Это активные визуальные материалы, а не сырой архив.

`export/transcripts`

Полные транскрибации, доступные для поиска и генерации контента.

`data`

Машинный слой для сервера:

- `data/entities` — JSON-карточки продуктов и наборов.
- `data/indices` — общий индекс поиска.

`content`

Будущий output конвейера: статьи, посты, сценарии и видео-брифы.

## Источник правды

Если меняется продуктовая информация, обновляется `export/knowledge/01-products.md`, затем запускается:

```bash
npm run index
```

Если меняется бренд-стиль, обновляется `export/knowledge/00-brand-code.md`.

Если добавляются мокапы или транскрибации, они кладутся в `export/assets` или `export/transcripts`, затем снова запускается `npm run index`.
