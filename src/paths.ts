import path from "node:path";

export interface KnowledgePaths {
  root: string;
  knowledge: string;
  raw: string;
  rawProducts: string;
  rawBrand: string;
  rawAssets: string;
  rawTranscripts: string;
  entities: string;
  entityProducts: string;
  entityBundles: string;
  indices: string;
  indexFile: string;
}

export function getKnowledgePaths(root = process.env.MOLDIR_KB_ROOT ?? process.cwd()): KnowledgePaths {
  const absoluteRoot = path.resolve(root);
  const knowledge = path.join(absoluteRoot, "knowledge");
  const raw = path.join(knowledge, "raw");
  const entities = path.join(knowledge, "entities");
  const indices = path.join(knowledge, "indices");

  return {
    root: absoluteRoot,
    knowledge,
    raw,
    rawProducts: path.join(raw, "products"),
    rawBrand: path.join(raw, "brand"),
    rawAssets: path.join(raw, "assets"),
    rawTranscripts: path.join(raw, "transcripts", "youtube"),
    entities,
    entityProducts: path.join(entities, "products"),
    entityBundles: path.join(entities, "bundles"),
    indices,
    indexFile: path.join(indices, "knowledge-index.json")
  };
}

export function toPosixRelative(root: string, absolutePath: string): string {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}
