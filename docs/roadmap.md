# Roadmap

## Phase 1: Knowledge Base Foundation

Status: done.

- Organize product, brand, mockup, and transcript files under `export/`.
- Generate structured product and bundle entities under `data/entities`.
- Provide HTTP API and MCP access.
- Keep source paths and provenance for every generated entity.
- Add content safety notes for supplement-related claims.

## Phase 2: Article and Social Content Generation

- Add content job files under `content/`.
- Generate outlines, drafts, captions, carousels, and short-form scripts.
- Add review states: `draft`, `needs-review`, `approved`, `published`.
- Store every output with source products, prompt version, model, date, and reviewer.
- Add platform-specific templates for Instagram, Telegram, YouTube Shorts, TikTok, and website articles.

## Phase 3: Video Generation

- Generate video briefs and scripts from approved knowledge.
- Add HeyGen-ready payload templates.
- Store voice, avatar, aspect ratio, source script, and final asset metadata.
- Add publish/export workflow for generated videos.

## Content Compliance Notes

Marine Health content may discuss wellness, nutrition, beauty, and general support. Generated content should avoid medical diagnosis, treatment promises, disease cure claims, and guaranteed outcomes. Where appropriate, it should recommend consulting a qualified healthcare professional.
