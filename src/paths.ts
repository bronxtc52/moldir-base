import path from "node:path";

export interface KnowledgePaths {
  root: string;
  exportDir: string;
  exportKnowledge: string;
  exportAssets: string;
  exportTranscripts: string;
  exportRuntime: string;
  exportLessons: string;
  exportTemplates: string;
  data: string;
  entityProducts: string;
  entityBundles: string;
  indices: string;
  indexFile: string;
  content: string;
}

export function getKnowledgePaths(root = process.env.MOLDIR_KB_ROOT ?? process.cwd()): KnowledgePaths {
  const absoluteRoot = path.resolve(root);
  const exportDir = path.join(absoluteRoot, "export");
  const exportKnowledge = path.join(exportDir, "knowledge");
  const data = path.join(absoluteRoot, "data");
  const entities = path.join(data, "entities");
  const indices = path.join(data, "indices");

  return {
    root: absoluteRoot,
    exportDir,
    exportKnowledge,
    exportAssets: path.join(exportDir, "assets"),
    exportTranscripts: path.join(exportDir, "transcripts", "youtube"),
    exportRuntime: path.join(exportDir, "runtime"),
    exportLessons: path.join(exportDir, "lessons"),
    exportTemplates: path.join(exportDir, "templates"),
    data,
    entityProducts: path.join(entities, "products"),
    entityBundles: path.join(entities, "bundles"),
    indices,
    indexFile: path.join(indices, "knowledge-index.json"),
    content: path.join(absoluteRoot, "content")
  };
}

export function toPosixRelative(root: string, absolutePath: string): string {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}
