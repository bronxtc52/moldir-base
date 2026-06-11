import { promises as fs } from "node:fs";
import path from "node:path";
import { loadKnowledgeBase } from "../src/knowledge-base.js";
import { getKnowledgePaths } from "../src/paths.js";

const root = process.env.MOLDIR_KB_ROOT ?? process.cwd();
const paths = getKnowledgePaths(root);
const base = await loadKnowledgeBase(root);

await fs.mkdir(paths.indices, { recursive: true });
await fs.mkdir(paths.entityProducts, { recursive: true });
await fs.mkdir(paths.entityBundles, { recursive: true });
await fs.mkdir(paths.exportKnowledge, { recursive: true });

await removeJsonFiles(paths.entityProducts);
await removeJsonFiles(paths.entityBundles);

await writeJson(paths.indexFile, base);
await writeText(
  path.join(paths.exportKnowledge, "02-transcripts-index.md"),
  buildTranscriptsIndex(base.transcripts)
);
await writeText(
  path.join(paths.exportKnowledge, "03-assets-and-mockups.md"),
  buildAssetsIndex(base.assets)
);

for (const product of base.products) {
  await writeJson(path.join(paths.entityProducts, `${product.slug}.json`), product);
}

for (const bundle of base.bundles) {
  await writeJson(path.join(paths.entityBundles, `${bundle.slug}.json`), bundle);
}

console.log(
  [
    `Indexed ${base.counts.documents} documents`,
    `${base.counts.product} products`,
    `${base.counts.bundle} bundles`,
    `${base.counts.transcript} transcripts`,
    `${base.counts.asset} assets`
  ].join(", ")
);

async function writeJson(filePath: string, value: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeText(filePath: string, value: string) {
  await fs.writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

function buildTranscriptsIndex(transcripts: typeof base.transcripts): string {
  const lines = [
    "# YouTube Transcripts Index",
    "",
    "Этот файл генерируется командой `npm run index` и описывает доступные транскрибации для поиска и будущего content pipeline.",
    "",
    ...transcripts.map((transcript) =>
      [`## ${transcript.title}`, "", `- id: \`${transcript.id}\``, `- slug: \`${transcript.slug}\``, `- source: \`${transcript.source.path}\``, `- summary: ${transcript.summary}`, ""].join("\n")
    )
  ];

  return lines.join("\n");
}

function buildAssetsIndex(assets: typeof base.assets): string {
  const lines = [
    "# Assets And Mockups",
    "",
    "Этот файл генерируется командой `npm run index` и описывает визуальные ассеты, которые могут использовать генераторы статей, постов и видео.",
    "",
    ...assets.map((asset) =>
      [`## ${asset.title}`, "", `- id: \`${asset.id}\``, `- file: \`${asset.relativePath}\``, `- mime: \`${asset.mimeType}\``, `- size: ${asset.sizeBytes} bytes`, ""].join("\n")
    )
  ];

  return lines.join("\n");
}

async function removeJsonFiles(dir: string) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => fs.unlink(path.join(dir, entry.name)))
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
}
