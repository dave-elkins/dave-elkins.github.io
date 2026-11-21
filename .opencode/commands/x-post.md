---
description: Draft a short X (Twitter) post promoting one of my articles
---

Draft an X post promoting the article described by: $ARGUMENTS

## Workflow

1. **Locate the article.** Search this workspace for a matching filename, slug, or title. Start with `src/content/articles/` and `../blog/series/`. If $ARGUMENTS is empty or ambiguous, list the most recent articles and ask which one to use.
2. **Read it.** Read the frontmatter and body. Identify the central claim, 1–2 concrete supporting ideas, and one honest caveat or open question.
3. **Resolve the canonical URL.** Read `astro.config.mjs` for the `site` value and append `/writing/<slug>/`, where `<slug>` is the article's filename. Flag any uncertainty for me to confirm before posting.
4. **Write the post** using these preferences:
   - Professional and insightful, but tighter than LinkedIn — no filler, no hype, no "I just published…" lead-in.
   - A single post of **280 characters or fewer**, including the link and hashtags. Count characters using X's rule that any URL counts as 23 characters, and report the count.
   - First line is a standalone hook that makes sense on its own in a timeline.
   - Include one specific idea from the article. Include the caveat only if it fits naturally.
   - Include the link and 0–2 hashtags at the end. No emojis unless I ask.
   - Draft only. Never claim to have published anything and never attempt to post.
5. **Output** the post in a blockquote, the exact character count, and 2 alternate hooks. Then offer a 3-post thread as a secondary option (each post ≤280 characters, numbered 1/3, 2/3, 3/3). Keep the single post as the primary answer.
6. Do not write any files unless I ask.
