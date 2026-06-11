# Spec: Armanda Content Pipeline For Moldir Base

Date: 2026-06-11
Status: Gate 1 approved

## Goal

Run the next Moldir Base work through the Armanda gated pipeline and prepare the project for Phase 2: article and social content generation on top of the existing knowledge base.

The project must remain a knowledge gateway first: external services, agents, and future generators consume trusted product, brand, transcript, and mockup data through MCP, HTTP, and the `export/` contract.

## Why This Matters

Moldir Base is intended to become the single source of truth for:

- Marine Health product knowledge;
- brand voice and content rules;
- product mockups and style assets;
- transcripts and educational source material;
- generated articles, posts, scripts, and later video briefs.

The next layer should make content generation repeatable and auditable instead of creating disconnected drafts.

## Target Consumers

- MCP clients that request product, brand, and source context.
- HTTP clients and other services that need catalog/search access.
- A future content generator that creates article drafts, captions, carousel outlines, and short scripts.
- Human editors who review and approve generated content.
- A future video generator that converts approved scripts into HeyGen-ready briefs.

## Existing Constraints

- `export/` is the active knowledge contract.
- `data/` contains generated machine-readable entities and indices.
- `content/` is reserved for generated outputs.
- Do not recreate a `knowledge/raw` layer unless explicitly requested.
- Every generated output should keep source IDs, product slugs, prompt/version metadata, date, and review status.
- Supplement-related content must avoid diagnosis, cure, treatment guarantees, and unsupported medical claims.
- Current TypeScript, HTTP, and MCP behavior should keep working.

## Scope For This Iteration

This Armanda run should define and then implement the Phase 2 foundation:

- content job/file conventions under `content/`;
- metadata requirements for generated articles and social posts;
- review states: `draft`, `needs-review`, `approved`, `published`;
- templates or examples for article/social generation requests;
- documentation updates in `export/runtime` and `docs`;
- validation that the knowledge gateway still indexes and serves correctly.

## Future Phases

Phase 2 later work may add actual model calls, prompt orchestration, batch generation, and platform-specific exporters.

Phase 3 later work may add video script generation, HeyGen payload creation, generation status tracking, and final video asset metadata.

## Out Of Scope For This Iteration

- Live LLM generation calls.
- HeyGen API integration.
- Publishing to social platforms.
- Admin UI.
- Database or hosted storage migration.
- Changing the existing `export/`-first architecture.

## User Stories

- As an external service, I can query Moldir Base through MCP or HTTP and receive stable product and brand context.
- As a content generator, I can create a draft with source IDs and review metadata so the output is traceable.
- As a human editor, I can see whether an item is draft, needs review, approved, or published.
- As a future video pipeline, I can reuse approved article/social script material as input for HeyGen-ready briefs.

## Acceptance Criteria

- A `plan.md` is created in Gate 2 before implementation begins.
- The plan separates MVP work from later article/social/video automation.
- The implementation preserves `export/` as the active contract.
- Generated or example content lives under `content/`, not inside `export/knowledge`.
- Runtime docs explain how content jobs consume source knowledge.
- `npm run validate` passes after implementation.
- At least one HTTP smoke check passes after implementation.
- MCP behavior is smoke-tested if MCP tools or context payloads change.

## Open Assumptions

- Default Phase 2 platforms are website articles, Instagram, Telegram, YouTube Shorts, and TikTok.
- Review remains manual in this iteration.
- Content generation should be auditable before it becomes automated.
