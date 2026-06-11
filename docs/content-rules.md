# Content Rules

These rules are used by future article, social, and video generators.

## Storage Contract

Generated content lives under `content/`. Source knowledge stays under `export/`, and generated product/search data stays under `data/`.

Use these templates for Phase 2 foundation work:

- `export/templates/content-job.md`
- `export/templates/generated-article.md`
- `export/templates/generated-social-post.md`

Generated outputs should not be saved into `export/knowledge`.

## Voice

- Calm, expert, caring, clean.
- No aggressive sales pressure.
- Explain benefits through support, routine, and lifestyle language.
- Keep Marine Health spelling consistent.

## Supplement Claims

Allowed style:

- "supports"
- "helps maintain"
- "may contribute to"
- "is used as part of a wellness routine"
- "supports normal function"

Avoid:

- "cures"
- "treats"
- "guarantees"
- "replaces medication"
- disease-specific promises without approved source and legal review.

## Required Source Discipline

Every generated piece should store:

- content ID;
- content type;
- requested topic;
- audience;
- platform;
- format;
- source product IDs;
- source document IDs;
- source transcript IDs;
- source asset IDs;
- brand template version;
- generated date;
- model/provider;
- review status.

If a product benefit, ingredient description, or usage statement cannot be traced to Moldir Base source knowledge, do not present it as a fact.

## Review States

- `draft` means not reviewed.
- `needs-review` means ready for a human editor.
- `approved` means cleared for reuse or publishing.
- `published` means posted outside this repository.

## Human Review Checklist

- The content uses wellness/support language.
- Product names and slugs match `data/entities/products`.
- Source IDs are present.
- Medical diagnosis, cure, treatment, and guarantee language is absent.
- Call to action is clear without pressure.
- Reviewer and review date are recorded before approval.
