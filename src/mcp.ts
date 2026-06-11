import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import {
  buildContentContext,
  compactDocument,
  findDocument,
  findProduct,
  loadKnowledgeBase,
  searchKnowledge
} from "./knowledge-base.js";
import type { KnowledgeKind } from "./types.js";

const knowledgeKinds = ["product", "bundle", "brand", "transcript", "asset"] as const;

export function createMoldirMcpServer(root = process.env.MOLDIR_KB_ROOT ?? process.cwd()): McpServer {
  const server = new McpServer({
    name: "moldir-base",
    version: "0.1.0"
  });

  server.registerTool(
    "search_knowledge",
    {
      title: "Search Moldir Base",
      description: "Search Marine Health products, bundles, brand code, transcripts, and assets.",
      inputSchema: {
        query: z.string().describe("Search query, for example: Ashitaba, heart, collagen."),
        kind: z.enum(knowledgeKinds).optional().describe("Optional document kind filter."),
        limit: z.number().int().min(1).max(30).default(10)
      }
    },
    async ({ query, kind, limit }) => {
      const base = await loadKnowledgeBase(root);
      const results = searchKnowledge(base, query, {
        kind: kind as KnowledgeKind | undefined,
        limit
      });

      return jsonResult({ query, kind, results });
    }
  );

  server.registerTool(
    "get_document",
    {
      title: "Get Knowledge Document",
      description: "Return a full knowledge document by id or slug.",
      inputSchema: {
        id: z.string().describe("Document id or slug, for example product:ashitaba-kapsuly.")
      }
    },
    async ({ id }) => {
      const base = await loadKnowledgeBase(root);
      const document = findDocument(base, id);
      if (!document) {
        return jsonResult({ error: "Document not found", id });
      }
      return jsonResult(document);
    }
  );

  server.registerTool(
    "list_catalog",
    {
      title: "List Catalog",
      description: "List compact catalog entries by kind.",
      inputSchema: {
        kind: z.enum(knowledgeKinds).optional(),
        limit: z.number().int().min(1).max(200).default(100)
      }
    },
    async ({ kind, limit }) => {
      const base = await loadKnowledgeBase(root);
      const documents = base.documents
        .filter((document) => !kind || document.kind === kind)
        .slice(0, limit)
        .map(compactDocument);

      return jsonResult({ generatedAt: base.generatedAt, counts: base.counts, documents });
    }
  );

  server.registerTool(
    "get_product",
    {
      title: "Get Product",
      description: "Return a product card by slug or title.",
      inputSchema: {
        product: z.string().describe("Product slug or title.")
      }
    },
    async ({ product }) => {
      const base = await loadKnowledgeBase(root);
      const found = findProduct(base, product);
      if (!found) {
        return jsonResult({ error: "Product not found", product });
      }
      return jsonResult(found);
    }
  );

  server.registerTool(
    "get_brand_code",
    {
      title: "Get Brand Code",
      description: "Return Marine Health brand style and tone guidance."
    },
    async () => {
      const base = await loadKnowledgeBase(root);
      return jsonResult(base.brand ?? { error: "Brand code not found" });
    }
  );

  server.registerTool(
    "get_content_context",
    {
      title: "Get Content Context",
      description:
        "Build a source-backed context pack for an article, social post, or video brief.",
      inputSchema: {
        topic: z.string().describe("Content topic or user request."),
        format: z.enum(["article", "social-post", "video-brief"]).default("article"),
        products: z.array(z.string()).default([]),
        limit: z.number().int().min(1).max(20).default(8)
      }
    },
    async ({ topic, format, products, limit }) => {
      const context = await buildContentContext(topic, {
        format,
        products,
        limit,
        root
      });

      return jsonResult(context);
    }
  );

  server.registerResource(
    "knowledge-catalog",
    "moldir://knowledge/catalog",
    {
      title: "Moldir Base Catalog",
      description: "Compact catalog index for Moldir Base.",
      mimeType: "application/json"
    },
    async (uri) => {
      const base = await loadKnowledgeBase(root);
      const payload = {
        generatedAt: base.generatedAt,
        counts: base.counts,
        documents: base.documents.map(compactDocument)
      };

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(payload, null, 2)
          }
        ]
      };
    }
  );

  server.registerResource(
    "knowledge-document",
    new ResourceTemplate("moldir://knowledge/document/{id}", {
      list: async () => {
        const base = await loadKnowledgeBase(root);
        return {
          resources: base.documents.map((document) => ({
            name: document.id,
            title: document.title,
            uri: `moldir://knowledge/document/${encodeURIComponent(document.id)}`,
            mimeType: "application/json"
          }))
        };
      },
      complete: {
        id: async (value) => {
          const base = await loadKnowledgeBase(root);
          return base.documents
            .map((document) => document.id)
            .filter((id) => id.includes(value))
            .slice(0, 20);
        }
      }
    }),
    {
      title: "Moldir Base Document",
      description: "Read one knowledge document by encoded id.",
      mimeType: "application/json"
    },
    async (uri, variables) => {
      const idVariable = variables.id;
      const encodedId = Array.isArray(idVariable) ? idVariable[0] : idVariable;
      const id = decodeURIComponent(encodedId ?? "");
      const base = await loadKnowledgeBase(root);
      const document = findDocument(base, id);

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(document ?? { error: "Document not found", id }, null, 2)
          }
        ]
      };
    }
  );

  server.registerPrompt(
    "content-brief",
    {
      title: "Content Brief",
      description: "Create a generation prompt backed by Moldir Base context.",
      argsSchema: {
        topic: z.string(),
        format: z.enum(["article", "social-post", "video-brief"]).default("article"),
        products: z.string().optional().describe("Comma-separated product slugs or names.")
      }
    },
    async ({ topic, format, products }) => {
      const productList =
        products
          ?.split(",")
          .map((product) => product.trim())
          .filter(Boolean) ?? [];
      const context = await buildContentContext(topic, {
        format,
        products: productList,
        root
      });

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Create a ${format} for this topic: ${topic}`,
                "",
                "Use this Moldir Base context:",
                JSON.stringify(context, null, 2),
                "",
                "Follow Marine Health tone and supplement claim safety notes."
              ].join("\n")
            }
          }
        ]
      };
    }
  );

  return server;
}

function jsonResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}
