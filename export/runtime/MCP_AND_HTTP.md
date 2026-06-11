# MCP And HTTP Contract

## HTTP

Base URL for local development:

```text
http://127.0.0.1:4111
```

Endpoints:

- `GET /health`
- `GET /api/catalog`
- `GET /api/search?q=...`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/bundles`
- `GET /api/brand`
- `GET /api/assets`
- `POST /mcp`

## MCP Tools

- `search_knowledge`
- `get_document`
- `list_catalog`
- `get_product`
- `get_brand_code`
- `get_content_context`

## Data Contract

Consumers should treat `export/` as the human-readable source and `data/` as the generated machine index.
