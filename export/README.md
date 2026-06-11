# Moldir Base — Context Export

Этот каталог является главным контрактом базы знаний. Его читают HTTP API, MCP tools и будущие генераторы контента.

## Структура

```text
export/
├── README.md
├── SYSTEM_PROMPT.md
├── knowledge/
│   ├── 00-brand-code.md
│   ├── 01-products.md
│   ├── 02-transcripts-index.md
│   └── 03-assets-and-mockups.md
├── runtime/
│   ├── CONTENT_PIPELINE.md
│   └── MCP_AND_HTTP.md
├── lessons/
│   └── PAST_PROBLEMS.md
├── templates/
│   ├── article-brief.md
│   ├── social-post-brief.md
│   └── video-brief.md
├── assets/
└── transcripts/
```

## Как читать

1. `SYSTEM_PROMPT.md` — поведение будущего генератора.
2. `knowledge/00-brand-code.md` — стиль и голос Marine Health.
3. `knowledge/01-products.md` — продукты и наборы.
4. `knowledge/02-transcripts-index.md` — карта доступных транскрибаций.
5. `knowledge/03-assets-and-mockups.md` — карта визуальных материалов.
6. `runtime/*` — как подключаться и строить контент-конвейер.

## Правило

`export/` — активная база. Если файл не должен использоваться сервисами или агентами, он не должен лежать в `export/`.
