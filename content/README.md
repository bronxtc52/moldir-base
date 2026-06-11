# Content Workspace

This directory stores future generated content and human-reviewed drafts. It is not the source knowledge contract. Source knowledge remains in `export/`, and generated machine data remains in `data/`.

## Directories

- `jobs/` stores content generation requests before a draft exists.
- `articles/` stores long-form article drafts and approved articles.
- `social-posts/` stores captions, carousel outlines, and short-form scripts.
- `video-briefs/` stores future video briefs and HeyGen-ready payload drafts.

## Review States

- `draft` means the item is generated or manually drafted and has not been reviewed.
- `needs-review` means the item is ready for human review.
- `approved` means the item is cleared for reuse or publishing.
- `published` means the item has been published outside this repository.

## Required Metadata

Every job and output should keep these fields in its frontmatter or equivalent structured metadata:

- `content_id`
- `content_type`
- `review_status`
- `created_at`
- `updated_at`
- `topic`
- `audience`
- `platform`
- `format`
- `product_slugs`
- `source_document_ids`
- `source_transcript_ids`
- `source_asset_ids`
- `prompt_version`
- `generator`
- `model`
- `reviewer`
- `compliance_notes`

## Source Discipline

Generated content must cite source IDs from `export/knowledge`, `export/transcripts`, `export/assets`, or generated `data/entities` files. Do not copy generated drafts back into `export/knowledge`; that directory is reserved for approved source knowledge and runtime indexes.

## File Naming

Use stable, date-prefixed filenames:

- `jobs/YYYY-MM-DD-topic-platform.md`
- `articles/YYYY-MM-DD-topic.md`
- `social-posts/YYYY-MM-DD-topic-platform.md`
- `video-briefs/YYYY-MM-DD-topic.md`

Keep filenames lowercase when possible. Use product slugs from `data/entities/products` for product-specific work.
