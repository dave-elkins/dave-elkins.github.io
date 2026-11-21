---
description: Draft a short LinkedIn post promoting one of my articles
---

Draft a LinkedIn post promoting the article described by: $ARGUMENTS

## Workflow

1. **Locate the article.** Search this workspace for a matching filename, slug, or title. Start with `src/content/articles/` and `../blog/series/`. If $ARGUMENTS is empty or ambiguous, list the most recent articles and ask which one to use.
2. **Read it.** Read the frontmatter and body. Identify:
    - the central claim,
    - 2–3 concrete supporting ideas (prefer specifics over generic summary),
    - one honest caveat, limitation, or open question,
    - the `entry.data.tags` list in the frontmatter.
3. **Resolve the canonical URL.** Read `astro.config.mjs` for the `site` value and append `/writing/<slug>/`, where `<slug>` is the article's filename. If the article lives elsewhere, use the closest known published URL and flag it for me to confirm before posting.
4. **Write the post** using these preferences:
    - Professional and insightful tone — thought leadership, not hype.
    - 3–5 sentences plus the link and hashtags. Put the link on its own line.
    - The first sentence must be a standalone hook that works above LinkedIn's "…see more" fold. Lead with the question or tension, never the article title.
    - Include one specific idea from the article and one honest caveat or open question.
    - End with a short "Read it here:" CTA and 2–4 hashtags derived from `entry.data.tags` (see Hashtags below).
    - Draft only. Never claim to have published anything and never attempt to post.
5. **Output** the post in a blockquote so it is easy to copy-paste, followed by 2 alternate first lines.
6. Do not write any files unless I ask.

## Hashtags

Derive hashtags from the article's `tags` frontmatter, in order:

- Convert each tag from kebab-case to a hashtag, uppercasing the acronyms `wysiwid`, `ai`, and `dci` — e.g. `concept-design` → `#ConceptDesign`, `wysiwid` → `#WYSIWID`, `ai` → `#AI`, `software-history` → `#SoftwareHistory`.
- Use the first 2–4 tags. Skip any that are too generic for the specific post, but do not invent tags that aren't in the frontmatter.
- If `tags` is empty, choose 2–4 topic-appropriate hashtags from the article body and tell me you did so.
