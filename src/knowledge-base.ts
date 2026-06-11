import { promises as fs } from "node:fs";
import path from "node:path";
import { listAssets } from "./assets.js";
import { parseProductCatalog } from "./catalog-parser.js";
import { getKnowledgePaths, toPosixRelative } from "./paths.js";
import type {
  AssetRef,
  CatalogEntity,
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeKind,
  SearchResult
} from "./types.js";
import { normalizeText, stripMarkdown, summarize, toSlug, uniqueStrings } from "./text.js";

export async function loadKnowledgeBase(root?: string): Promise<KnowledgeBase> {
  const paths = getKnowledgePaths(root);
  const generatedAt = new Date().toISOString();
  const assets = await listAssets(paths.rawAssets, paths.root);

  const productCatalogPath = path.join(paths.rawProducts, "products-full.md");
  const productCatalogMarkdown = await readOptionalText(productCatalogPath);
  const relativeProductPath = toPosixRelative(paths.root, productCatalogPath);
  const { products, bundles } = productCatalogMarkdown
    ? parseProductCatalog(productCatalogMarkdown, relativeProductPath, assets)
    : { products: [] as CatalogEntity[], bundles: [] as CatalogEntity[] };

  const brand = await loadBrandDocument(paths.root, paths.rawBrand);
  const transcripts = await loadTranscripts(paths.root, paths.rawTranscripts);
  const assetDocuments = assets.map((asset) => assetToDocument(asset));
  const documents: KnowledgeDocument[] = [
    ...products,
    ...bundles,
    ...(brand ? [brand] : []),
    ...transcripts,
    ...assetDocuments
  ];

  return {
    generatedAt,
    root: paths.root,
    counts: {
      product: products.length,
      bundle: bundles.length,
      brand: brand ? 1 : 0,
      transcript: transcripts.length,
      asset: assets.length,
      "catalog-section": 0,
      documents: documents.length
    },
    products,
    bundles,
    brand,
    transcripts,
    assets,
    documents
  };
}

export function searchKnowledge(
  base: KnowledgeBase,
  query: string,
  options: { kind?: KnowledgeKind; limit?: number } = {}
): SearchResult[] {
  const normalizedQuery = normalizeText(query);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const limit = options.limit ?? 10;
  const kindBoost: Record<KnowledgeKind, number> = {
    product: 14,
    bundle: 12,
    brand: 4,
    transcript: 0,
    asset: -16,
    "catalog-section": 0
  };

  return base.documents
    .filter((document) => !options.kind || document.kind === options.kind)
    .map((document) => {
      const normalizedTitle = normalizeText(document.title);
      const haystack = normalizeText(
        [
          document.title,
          document.slug,
          document.summary,
          document.body,
          document.tags.join(" "),
          JSON.stringify(document.metadata),
          document.assets?.map((asset) => asset.title).join(" ") ?? ""
        ].join(" ")
      );

      const score =
        terms.length === 0
          ? 1
          : terms.reduce((total, term) => {
              const inTitle = normalizedTitle.includes(term) ? 8 : 0;
              const inSlug = document.slug.includes(term) ? 5 : 0;
              const count = haystack.split(term).length - 1;
              return total + inTitle + inSlug + count;
            }, kindBoost[document.kind]) +
            (normalizedTitle === normalizedQuery ? 20 : 0) +
            (normalizedTitle.startsWith(normalizedQuery) ? 12 : 0);

      return { document, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title))
    .slice(0, limit)
    .map(({ document, score }) => ({
      id: document.id,
      kind: document.kind,
      slug: document.slug,
      title: document.title,
      summary: document.summary,
      score,
      tags: document.tags,
      sourcePath: document.source.path
    }));
}

export function findDocument(base: KnowledgeBase, idOrSlug: string): KnowledgeDocument | null {
  const decoded = decodeURIComponent(idOrSlug);
  return (
    base.documents.find((document) => document.id === decoded || document.slug === decoded) ?? null
  );
}

export function compactDocument(document: KnowledgeDocument): Omit<KnowledgeDocument, "body" | "sections"> & {
  bodyLength: number;
  sectionLabels: string[];
} {
  return {
    id: document.id,
    kind: document.kind,
    slug: document.slug,
    title: document.title,
    summary: document.summary,
    tags: document.tags,
    metadata: document.metadata,
    source: document.source,
    assets: document.assets,
    bodyLength: document.body.length,
    sectionLabels: Object.keys(document.sections)
  };
}

export async function buildContentContext(
  topic: string,
  options: {
    format?: "article" | "social-post" | "video-brief";
    products?: string[];
    limit?: number;
    root?: string;
  } = {}
): Promise<{
  topic: string;
  format: string;
  brand: KnowledgeDocument | null;
  selectedProducts: CatalogEntity[];
  searchResults: SearchResult[];
  safetyNotes: string[];
}> {
  const base = await loadKnowledgeBase(options.root);
  const selectedProducts = (options.products ?? [])
    .map((value) => findProduct(base, value))
    .filter((product): product is CatalogEntity => Boolean(product));
  const searchResults = searchKnowledge(base, topic, { limit: options.limit ?? 8 });

  return {
    topic,
    format: options.format ?? "article",
    brand: base.brand,
    selectedProducts,
    searchResults,
    safetyNotes: [
      "Avoid disease cure, treatment, or guaranteed outcome claims.",
      "Use support-oriented wellness language: supports, helps maintain, may contribute.",
      "Recommend consulting a qualified healthcare professional where appropriate."
    ]
  };
}

export function findProduct(base: KnowledgeBase, slugOrTitle: string): CatalogEntity | null {
  const normalized = normalizeText(slugOrTitle);
  return (
    base.products.find(
      (product) =>
        product.slug === slugOrTitle ||
        normalizeText(product.title) === normalized ||
        normalizeText(product.title).includes(normalized)
    ) ?? null
  );
}

async function loadBrandDocument(
  projectRoot: string,
  rawBrandPath: string
): Promise<KnowledgeDocument | null> {
  const filePath = path.join(rawBrandPath, "marine-health-brand-code.md");
  const body = await readOptionalText(filePath);
  if (!body) {
    return null;
  }

  return {
    id: "brand:marine-health",
    kind: "brand",
    slug: "marine-health",
    title: "Marine Health Brand Code",
    summary: summarize(body),
    body,
    tags: ["brand", "style", "tone-of-voice", "marine-health"],
    sections: parseMarkdownHeadings(body),
    metadata: {
      brandName: "Marine Health",
      language: "ru"
    },
    source: {
      path: toPosixRelative(projectRoot, filePath),
      type: "markdown"
    }
  };
}

async function loadTranscripts(
  projectRoot: string,
  transcriptsPath: string
): Promise<KnowledgeDocument[]> {
  const files = await listTextFiles(transcriptsPath);
  const documents: KnowledgeDocument[] = [];

  for (const filePath of files) {
    const body = await fs.readFile(filePath, "utf8");
    const title = path.basename(filePath, path.extname(filePath));
    const slug = toSlug(title);
    documents.push({
      id: `transcript:${slug}`,
      kind: "transcript",
      slug,
      title,
      summary: summarize(body),
      body,
      tags: uniqueStrings(["transcript", "youtube", ...title.split(/\s+/).slice(0, 6)]),
      sections: {},
      metadata: {
        channel: "youtube",
        filename: path.basename(filePath)
      },
      source: {
        path: toPosixRelative(projectRoot, filePath),
        type: "transcript"
      }
    });
  }

  return documents.sort((a, b) => a.title.localeCompare(b.title));
}

function assetToDocument(asset: AssetRef): KnowledgeDocument {
  return {
    id: asset.id,
    kind: "asset",
    slug: asset.id.replace(/^asset:/, ""),
    title: asset.title,
    summary: `${asset.mimeType}, ${asset.relativePath}`,
    body: "",
    tags: ["asset", "mockup", asset.mimeType],
    sections: {},
    metadata: {
      filename: asset.filename,
      sizeBytes: asset.sizeBytes,
      mimeType: asset.mimeType,
      relativePath: asset.relativePath
    },
    source: {
      path: asset.relativePath,
      type: "image"
    },
    assets: [asset]
  };
}

function parseMarkdownHeadings(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = markdown.split(/\r?\n/);
  let current: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) {
      sections[current] = buffer.join("\n").trim();
    }
    buffer = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##+\s+(.+)$/);
    if (heading) {
      flush();
      current = stripMarkdown(heading[1] ?? "");
      continue;
    }
    if (current) {
      buffer.push(line);
    }
  }

  flush();
  return sections;
}

async function listTextFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
      .map((entry) => path.join(dir, entry.name));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function readOptionalText(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
