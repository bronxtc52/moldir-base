import { promises as fs } from "node:fs";
import path from "node:path";
import type { AssetRef } from "./types.js";
import { toPosixRelative } from "./paths.js";
import { toSlug } from "./text.js";

const imageMimeTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

export async function listAssets(root: string, projectRoot: string): Promise<AssetRef[]> {
  const files = await listFiles(root);
  const assets: AssetRef[] = [];

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = imageMimeTypes[ext];
    if (!mimeType) {
      continue;
    }

    const stats = await fs.stat(filePath);
    const filename = path.basename(filePath);
    const title = path.basename(filePath, ext);

    assets.push({
      id: `asset:${toSlug(path.relative(root, filePath))}`,
      title,
      filename,
      path: filePath,
      relativePath: toPosixRelative(projectRoot, filePath),
      mimeType,
      sizeBytes: stats.size
    });
  }

  return assets.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return listFiles(fullPath);
        }
        if (entry.isFile()) {
          return [fullPath];
        }
        return [];
      })
    );

    return nested.flat();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
