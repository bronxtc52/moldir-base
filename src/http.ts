import express, { type NextFunction, type Request, type Response } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMoldirMcpServer } from "./mcp.js";
import {
  compactDocument,
  findDocument,
  findProduct,
  loadKnowledgeBase,
  searchKnowledge
} from "./knowledge-base.js";
import { getKnowledgePaths } from "./paths.js";
import type { KnowledgeKind } from "./types.js";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4111);
const root = process.env.MOLDIR_KB_ROOT ?? process.cwd();
const paths = getKnowledgePaths(root);
const app = createMcpExpressApp({ host });

app.use(express.json({ limit: "2mb" }));
app.use("/assets", express.static(paths.rawAssets));

app.get(
  "/health",
  asyncRoute(async (_req, res) => {
    const base = await loadKnowledgeBase(root);
    res.json({
      ok: true,
      name: "moldir-base",
      generatedAt: base.generatedAt,
      counts: base.counts
    });
  })
);

app.get(
  "/api/catalog",
  asyncRoute(async (_req, res) => {
    const base = await loadKnowledgeBase(root);
    res.json({
      generatedAt: base.generatedAt,
      counts: base.counts,
      documents: base.documents.map(compactDocument)
    });
  })
);

app.get(
  "/api/search",
  asyncRoute(async (req, res) => {
    const query = String(req.query.q ?? "");
    const kind = req.query.kind ? (String(req.query.kind) as KnowledgeKind) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const base = await loadKnowledgeBase(root);
    res.json({ query, kind, results: searchKnowledge(base, query, { kind, limit }) });
  })
);

app.get(
  "/api/products",
  asyncRoute(async (_req, res) => {
    const base = await loadKnowledgeBase(root);
    res.json(base.products.map(compactDocument));
  })
);

app.get(
  "/api/products/:slug",
  asyncRoute(async (req, res) => {
    const base = await loadKnowledgeBase(root);
    const slug = String(req.params.slug);
    const product = findProduct(base, slug);
    if (!product) {
      res.status(404).json({ error: "Product not found", slug });
      return;
    }
    res.json(product);
  })
);

app.get(
  "/api/bundles",
  asyncRoute(async (_req, res) => {
    const base = await loadKnowledgeBase(root);
    res.json(base.bundles.map(compactDocument));
  })
);

app.get(
  "/api/documents/:id",
  asyncRoute(async (req, res) => {
    const base = await loadKnowledgeBase(root);
    const id = String(req.params.id);
    const document = findDocument(base, id);
    if (!document) {
      res.status(404).json({ error: "Document not found", id });
      return;
    }
    res.json(document);
  })
);

app.get(
  "/api/brand",
  asyncRoute(async (_req, res) => {
    const base = await loadKnowledgeBase(root);
    if (!base.brand) {
      res.status(404).json({ error: "Brand code not found" });
      return;
    }
    res.json(base.brand);
  })
);

app.get(
  "/api/assets",
  asyncRoute(async (_req, res) => {
    const base = await loadKnowledgeBase(root);
    res.json(base.assets);
  })
);

app.post("/mcp", async (req, res) => {
  const server = createMoldirMcpServer(root);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal server error"
        },
        id: null
      });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed. Use POST /mcp." },
    id: null
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    error: "Internal server error",
    message: error.message
  });
});

app.listen(port, host, () => {
  console.log(`Moldir Base HTTP API listening at http://${host}:${port}`);
});

function asyncRoute(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
