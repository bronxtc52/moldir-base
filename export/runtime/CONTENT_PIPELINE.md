# Content Pipeline

The content pipeline consumes the active Moldir Base knowledge contract and stores generated outputs under `content/`.

Source knowledge stays in `export/`. Machine-readable derived data stays in `data/`. Generated drafts, jobs, scripts, and future video briefs stay in `content/`.

## Phase 2 Foundation

Phase 2 starts with an auditable file contract before automated generation.

Directories:

- `content/jobs` stores generation requests.
- `content/articles` stores article drafts and approved articles.
- `content/social-posts` stores captions, carousel outlines, and short-form scripts.
- `content/video-briefs` is reserved for Phase 3 video briefs and HeyGen-ready payload drafts.

Templates:

- `export/templates/content-job.md`
- `export/templates/generated-article.md`
- `export/templates/generated-social-post.md`

## Content Job Input

Each job should define:

- topic;
- audience;
- product slugs;
- source document IDs;
- source transcript IDs;
- source asset IDs;
- format;
- platform;
- call to action;
- forbidden claims;
- review owner.

## Generated Output

Article and social outputs should include:

- generated body or script;
- source IDs;
- product slugs;
- prompt version;
- generator and model;
- created and updated dates;
- review status;
- reviewer;
- compliance notes.

Generated outputs must not be copied into `export/knowledge`. The `export/knowledge` directory is the trusted source contract, not a draft workspace.

## Review States

- `draft` means the item is generated or manually drafted and has not been reviewed.
- `needs-review` means the item is ready for human review.
- `approved` means the item is cleared for reuse or publishing.
- `published` means the item has been published outside this repository.

## Source Discipline

Every generated item must include source document IDs and review status.

Use IDs from:

- `export/knowledge/*.md`;
- `export/transcripts`;
- `export/assets`;
- `data/entities/products`;
- `data/entities/bundles`.

If a claim cannot be traced to source knowledge, remove it or mark it for review.

## Compliance

Generated Marine Health content may discuss wellness, nutrition, beauty, routines, and general support. It must avoid:

- diagnosis;
- treatment promises;
- disease cure claims;
- guaranteed outcomes;
- replacing medication or medical care.

Prefer support language such as "supports", "helps maintain", "may contribute to", and "as part of a wellness routine".

## Phase 3 Video

Phase 3 will reuse approved scripts and source context.

Input:

- approved script;
- product/source context;
- avatar and voice settings;
- aspect ratio;
- subtitles setting.

Output:

- HeyGen-ready brief;
- final script;
- asset references;
- generation metadata;
- final video asset metadata.
