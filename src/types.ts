export type KnowledgeKind =
  | "product"
  | "bundle"
  | "brand"
  | "transcript"
  | "asset"
  | "catalog-section";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export interface SourceRef {
  path: string;
  type: "markdown" | "transcript" | "image" | "generated";
  collectedAt?: string;
}

export interface PriceTable {
  title: string;
  columns: string[];
  rows: Record<string, string>[];
}

export interface AssetRef {
  id: string;
  title: string;
  filename: string;
  path: string;
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
}

export interface KnowledgeDocument {
  id: string;
  kind: KnowledgeKind;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  sections: Record<string, string>;
  metadata: JsonObject;
  source: SourceRef;
  assets?: AssetRef[];
}

export interface CatalogEntity extends KnowledgeDocument {
  kind: "product" | "bundle";
  priceTables: PriceTable[];
}

export interface SearchResult {
  id: string;
  kind: KnowledgeKind;
  slug: string;
  title: string;
  summary: string;
  score: number;
  tags: string[];
  sourcePath: string;
}

export interface KnowledgeBase {
  generatedAt: string;
  root: string;
  counts: Record<KnowledgeKind | "documents", number>;
  products: CatalogEntity[];
  bundles: CatalogEntity[];
  brand: KnowledgeDocument | null;
  transcripts: KnowledgeDocument[];
  assets: AssetRef[];
  documents: KnowledgeDocument[];
}
