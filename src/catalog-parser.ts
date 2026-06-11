import path from "node:path";
import type { AssetRef, CatalogEntity, JsonObject, PriceTable } from "./types.js";
import { splitLooseList, summarize, toSlug, uniqueStrings } from "./text.js";

type CatalogKind = "product" | "bundle";

interface CatalogBlock {
  kind: CatalogKind;
  title: string;
  lines: string[];
  order: number;
}

const metadataLabels: Record<string, string> = {
  URL: "url",
  Категория: "category",
  Слоган: "slogan",
  Направления: "directions",
  "Способ применения": "usage",
  Противопоказания: "contraindications",
  "Рекомендуемый курс": "recommendedCourse",
  "Для кого": "targetAudience",
  Состав: "composition",
  Форма: "form",
  "Форма выпуска": "form",
  Маркировка: "labeling",
  Особенности: "features",
  Результат: "result",
  Позиционирование: "positioning"
};

export function parseProductCatalog(
  markdown: string,
  sourcePath: string,
  assets: AssetRef[] = []
): { products: CatalogEntity[]; bundles: CatalogEntity[] } {
  const blocks = splitCatalogBlocks(markdown);
  const usedSlugs = new Set<string>();
  const products: CatalogEntity[] = [];
  const bundles: CatalogEntity[] = [];

  for (const block of blocks) {
    const entity = blockToEntity(block, sourcePath, usedSlugs, assets);
    if (entity.kind === "product") {
      products.push(entity);
    } else {
      bundles.push(entity);
    }
  }

  return { products, bundles };
}

function splitCatalogBlocks(markdown: string): CatalogBlock[] {
  const lines = markdown.split(/\r?\n/);
  let currentKind: CatalogKind | null = null;
  let currentBlock: CatalogBlock | null = null;
  const blocks: CatalogBlock[] = [];

  const flush = () => {
    if (currentBlock) {
      blocks.push(currentBlock);
      currentBlock = null;
    }
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const heading = h2[1] ?? "";
      if (heading.includes("НАБОРЫ")) {
        flush();
        currentKind = "bundle";
      } else if (heading.includes("ОТДЕЛЬНЫЕ ПРОДУКТЫ")) {
        flush();
        currentKind = "product";
      } else {
        flush();
        currentKind = null;
      }
      continue;
    }

    const h3 = line.match(/^###\s+\d+\.\s+(.+)$/);
    if (h3 && currentKind) {
      flush();
      currentBlock = {
        kind: currentKind,
        title: h3[1]?.trim() ?? "Untitled",
        lines: [],
        order: blocks.length + 1
      };
      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  flush();
  return blocks;
}

function blockToEntity(
  block: CatalogBlock,
  sourcePath: string,
  usedSlugs: Set<string>,
  assets: AssetRef[]
): CatalogEntity {
  const sections = parseBoldSections(block.lines);
  const slug = uniqueSlug(toSlug(block.title), usedSlugs);
  const body = block.lines.join("\n").trim();
  const metadata = extractMetadata(sections);
  const priceTables = extractPriceTables(sections);
  const tags = buildTags(block.kind, sections);
  const relatedAssets = findRelatedAssets(block.title, slug, assets);
  const summary =
    summarize(sections["Описание"] ?? sections["Действие"] ?? sections["Для кого"] ?? body) ||
    block.title;

  return {
    id: `${block.kind}:${slug}`,
    kind: block.kind,
    slug,
    title: block.title,
    summary,
    body,
    tags,
    sections,
    metadata: {
      ...metadata,
      order: block.order,
      sourceFile: path.basename(sourcePath)
    },
    source: {
      path: sourcePath,
      type: "markdown"
    },
    assets: relatedAssets,
    priceTables
  };
}

function uniqueSlug(baseSlug: string, used: Set<string>): string {
  let slug = baseSlug;
  let index = 2;

  while (used.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  used.add(slug);
  return slug;
}

function parseBoldSections(lines: string[]): Record<string, string> {
  const sections: Record<string, string> = {};
  let currentLabel: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentLabel) {
      return;
    }

    const value = cleanupSection(buffer);
    if (value) {
      sections[currentLabel] = value;
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (match) {
      flush();
      currentLabel = match[1]?.trim() ?? null;
      const rest = match[2]?.trim();
      buffer = rest ? [rest] : [];
      continue;
    }

    if (currentLabel) {
      buffer.push(line);
    }
  }

  flush();
  return sections;
}

function cleanupSection(lines: string[]): string {
  return lines
    .join("\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractMetadata(sections: Record<string, string>): JsonObject {
  const metadata: JsonObject = {};

  for (const [label, key] of Object.entries(metadataLabels)) {
    const value = sections[label];
    if (!value) {
      continue;
    }

    if (key === "directions") {
      metadata[key] = splitLooseList(value);
    } else {
      metadata[key] = value;
    }
  }

  const bundleComposition = sections["Состав набора"];
  if (bundleComposition) {
    metadata.components = splitLooseList(bundleComposition);
  }

  return metadata;
}

function buildTags(kind: CatalogKind, sections: Record<string, string>): string[] {
  const category = sections["Категория"];
  const directions = sections["Направления"];

  return uniqueStrings([
    kind,
    ...(category ? splitLooseList(category) : []),
    ...(directions ? splitLooseList(directions) : [])
  ]);
}

function extractPriceTables(sections: Record<string, string>): PriceTable[] {
  const tables: PriceTable[] = [];

  for (const [title, value] of Object.entries(sections)) {
    if (!title.startsWith("Цены")) {
      continue;
    }

    const table = parseMarkdownTable(value);
    if (table) {
      tables.push({ title, ...table });
    }
  }

  return tables;
}

function parseMarkdownTable(value: string): Pick<PriceTable, "columns" | "rows"> | null {
  const tableLines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));

  if (tableLines.length < 3) {
    return null;
  }

  const columns = splitTableRow(tableLines[0] ?? "");
  const rows = tableLines.slice(2).map((line) => {
    const cells = splitTableRow(line);
    return Object.fromEntries(columns.map((column, index) => [column, cells[index] ?? ""]));
  });

  return { columns, rows };
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/^-+$/, ""));
}

function findRelatedAssets(title: string, slug: string, assets: AssetRef[]): AssetRef[] {
  const normalizedTitle = normalizeForAssetMatch(`${title} ${slug}`);
  const titleTokens = new Set(splitAssetTokens(normalizedTitle));

  return assets.filter((asset) => {
    const normalizedAsset = normalizeForAssetMatch(`${asset.title} ${asset.filename}`);
    if (normalizedTitle.includes(normalizedAsset) || normalizedAsset.includes(normalizedTitle)) {
      return true;
    }

    return splitAssetTokens(normalizedAsset).some((token) => titleTokens.has(token));
  });
}

function splitAssetTokens(value: string): string[] {
  const stopWords = new Set([
    "marine",
    "mockup",
    "mockups",
    "mokapy",
    "product",
    "products",
    "plus",
    "png",
    "webp",
    "jpeg",
    "jpg"
  ]);

  return value
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !stopWords.has(token));
}

function normalizeForAssetMatch(value: string): string {
  return toSlug(value)
    .replace(/-/g, " ")
    .replace(/\barthro\b/g, "artro")
    .replace(/\bcardio\b/g, "cardio marine")
    .replace(/\bpremium\b/g, "premium squalene")
    .replace(/\biodium\b/g, "iodium kelp")
    .replace(/\bvitaa\b/g, "vita marine a")
    .replace(/\bvitab\b/g, "vita marine b")
    .replace(/\s+/g, " ")
    .trim();
}
