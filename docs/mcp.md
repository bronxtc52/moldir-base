# MCP Contract

The project exposes a local MCP server over stdio and Streamable HTTP.

## stdio

```bash
npm run mcp
```

Example client config:

```json
{
  "mcpServers": {
    "moldir-base": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/Users/bronxtc52/Projects/moldir_base"
    }
  }
}
```

## Streamable HTTP

```bash
npm run dev
```

Endpoint:

```text
POST http://127.0.0.1:4111/mcp
```

## Tools

`search_knowledge`

Searches products, bundles, brand code, transcripts, and assets.

`get_document`

Returns a full document by `id` or `slug`.

`list_catalog`

Lists compact catalog entries by kind.

`get_product`

Returns a product card by slug or title.

`get_brand_code`

Returns the Marine Health brand code and style guidance.

`get_content_context`

Builds a source-backed context pack for article, social post, or video brief generation.

## Source Layout

MCP tools read from:

- `export/knowledge/*.md`
- `export/assets`
- `export/transcripts`
- `data/entities`
- `data/indices`
