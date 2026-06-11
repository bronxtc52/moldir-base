# Content Pipeline

Future phases should generate content from `export/knowledge` and store outputs under `content/`.

## Phase 2: Articles And Social Posts

Input:

- topic;
- audience;
- product slugs;
- format;
- platform;
- call to action.

Output:

- article draft;
- caption;
- carousel outline;
- short video script;
- source IDs;
- review status.

## Phase 3: Video

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
- generation metadata.

## Review States

- `draft`
- `needs-review`
- `approved`
- `published`

Every generated item must include source document IDs and review status.
