#!/usr/bin/env python3
"""
sentencefmt.py — Reformat Markdown prose to one sentence per line.

Usage:
    python sentencefmt.py file.md [file2.md ...]   # fix files in place
    python sentencefmt.py --check file.md           # exit 1 if changes needed (CI)
    cat file.md | python sentencefmt.py -           # stdin → stdout

Handles:
    - Fenced code blocks (``` and ~~~) — left untouched
    - Indented code blocks — left untouched
    - YAML front matter (--- ... ---) — left untouched
    - Headings, blockquotes, lists — left untouched
    - HTML blocks — left untouched
    - Common abbreviations (e.g., i.e., Dr., vs., etc.) — not split
    - Inline code, bold, italics — preserved exactly
"""

import os
import re
import sys
import textwrap
from pathlib import Path

# ---------------------------------------------------------------------------
# Abbreviations that end with a period but are NOT sentence endings.
# Add your own domain-specific ones here.
# ---------------------------------------------------------------------------
ABBREVIATIONS = {
    # Latin
    "e.g",
    "i.e",
    "etc",
    "et al",
    "vs",
    "cf",
    "ibid",
    # Titles
    "Dr",
    "Mr",
    "Mrs",
    "Ms",
    "Prof",
    "Sr",
    "Jr",
    "Rev",
    "Lt",
    "Col",
    "Gen",
    # Common technical
    "Fig",
    "Eq",
    "Sec",
    "Ch",
    "Vol",
    "No",
    "pp",
    "ed",
    "eds",
    # Months
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
}

# Build a regex that matches any abbreviation followed by a period.
# We'll use this as a negative lookbehind seed.
_ABBREV_PATTERN = re.compile(
    r"\b("
    + "|".join(re.escape(a) for a in sorted(ABBREVIATIONS, key=len, reverse=True))
    + r")\."
)


def _is_sentence_boundary(text: str, pos: int) -> bool:
    """
    Return True if the period/!/? at `pos` is a sentence boundary.
    pos points to the punctuation character.
    """
    char = text[pos]
    if char not in ".!?":
        return False

    # Must be followed by whitespace (or end of string)
    after = pos + 1
    # Skip closing quotes/parens/brackets that may follow punctuation
    while after < len(text) and text[after] in "\"')]}":
        after += 1
    if after < len(text) and text[after] not in (" ", "\t"):
        return False

    # Check for abbreviations ending at this period
    if char == ".":
        # Walk back to find the word before the period
        start = pos - 1
        while start >= 0 and text[start].isalpha():
            start -= 1
        word = text[start + 1 : pos]
        if word in ABBREVIATIONS:
            return False
        # Single uppercase letter (initials like "J. K. Rowling")
        if len(word) == 1 and word.isupper():
            return False
        # Ellipsis (...)
        if pos >= 2 and text[pos - 1] == "." and text[pos - 2] == ".":
            return False

    return True


def split_into_sentences(paragraph: str) -> list[str]:
    """
    Split a prose paragraph into individual sentences.
    Preserves inline Markdown (bold, italic, code, links).
    """
    # Protect inline code from being split (replace with placeholders)
    placeholders = {}
    counter = [0]

    def protect(pattern, text):
        def replacer(m):
            key = f"\x00PROTECT{counter[0]}\x00"
            placeholders[key] = m.group(0)
            counter[0] += 1
            return key

        return re.sub(pattern, replacer, text)

    text = paragraph
    # Protect inline code `...`
    text = protect(r"`[^`]+`", text)
    # Protect Markdown links [text](url)
    text = protect(r"\[([^\]]+)\]\([^)]+\)", text)
    # Protect Markdown images ![alt](url)
    text = protect(r"!\[([^\]]*)\]\([^)]+\)", text)

    # Now find sentence boundaries
    sentences = []
    current_start = 0

    i = 0
    while i < len(text):
        if _is_sentence_boundary(text, i):
            # Find end of sentence (include trailing quotes/parens)
            end = i + 1
            while end < len(text) and text[end] in "\"')]}":
                end += 1
            sentence = text[current_start:end].strip()
            if sentence:
                sentences.append(sentence)
            current_start = end
            # Skip leading whitespace for next sentence
            while current_start < len(text) and text[current_start] in " \t":
                current_start += 1
            i = current_start
        else:
            i += 1

    # Remainder (no terminal punctuation — common in notes/fragments)
    remainder = text[current_start:].strip()
    if remainder:
        sentences.append(remainder)

    # Restore placeholders
    def restore(s):
        for key, val in placeholders.items():
            s = s.replace(key, val)
        return s

    return [restore(s) for s in sentences if s]


# ---------------------------------------------------------------------------
# Markdown block classification
# ---------------------------------------------------------------------------


def _is_fence_start(line: str) -> tuple[bool, str]:
    """Return (is_fence, fence_char) for lines starting ``` or ~~~."""
    stripped = line.lstrip()
    if stripped.startswith("```"):
        return True, "```"
    if stripped.startswith("~~~"):
        return True, "~~~"
    return False, ""


def _is_indented_code(line: str) -> bool:
    return line.startswith("    ") or line.startswith("\t")


def _is_structural(line: str) -> bool:
    """Lines that should never be touched: headings, HR, list items, blockquotes, HTML, blank."""
    s = line.strip()
    if not s:
        return True  # blank line
    if s.startswith("#"):
        return True  # heading
    if re.match(r"^[-*_]{3,}\s*$", s):
        return True  # horizontal rule
    if re.match(r"^(\s*[-*+]|\s*\d+[.)]) ", line):
        return True  # list item
    if s.startswith(">"):
        return True  # blockquote
    if s.startswith("<") and re.match(r"^<[a-zA-Z/!]", s):
        return True  # HTML
    if re.match(r"^\|", s):
        return True  # table row
    if re.match(r"^[=-]+\s*$", s):
        return True  # setext heading underline
    return False


# ---------------------------------------------------------------------------
# Core formatter
# ---------------------------------------------------------------------------


def format_markdown(source: str) -> str:
    lines = source.splitlines()
    output = []
    i = 0
    in_fence = False
    fence_char = ""
    in_frontmatter = False
    frontmatter_done = False

    # Handle YAML front matter
    if lines and lines[0].strip() == "---":
        in_frontmatter = True

    while i < len(lines):
        line = lines[i]

        # --- Front matter ---
        if in_frontmatter:
            output.append(line)
            if i > 0 and line.strip() in ("---", "..."):
                in_frontmatter = False
                frontmatter_done = True
            i += 1
            continue

        # --- Fenced code blocks ---
        is_fence, fc = _is_fence_start(line)
        if is_fence and not in_fence:
            in_fence = True
            fence_char = fc
            output.append(line)
            i += 1
            continue
        if in_fence:
            output.append(line)
            if line.strip().startswith(fence_char) and i > 0:
                in_fence = False
                fence_char = ""
            i += 1
            continue

        # --- Indented code block ---
        if _is_indented_code(line):
            output.append(line)
            i += 1
            continue

        # --- Structural lines (headings, lists, blank, etc.) ---
        if _is_structural(line):
            output.append(line)
            i += 1
            continue

        # --- Prose paragraph: collect all lines until blank/structural ---
        para_lines = []
        while i < len(lines):
            l = lines[i]
            is_f, _ = _is_fence_start(l)
            if is_f or _is_structural(l) or _is_indented_code(l):
                break
            para_lines.append(l)
            i += 1

        paragraph = " ".join(para_lines).strip()
        if paragraph:
            sentences = split_into_sentences(paragraph)
            output.extend(sentences)
        continue

    result = "\n".join(output)
    # Ensure single trailing newline
    return result.rstrip("\n") + "\n"


# ---------------------------------------------------------------------------
# File I/O helpers
# ---------------------------------------------------------------------------


def process_file(path: Path, check_only: bool = False) -> bool:
    """
    Format a file. Returns True if the file was (or would be) changed.
    If check_only=True, never writes — just reports.
    """
    original = path.read_text(encoding="utf-8")
    formatted = format_markdown(original)

    if original == formatted:
        return False

    if not check_only:
        path.write_text(formatted, encoding="utf-8")
        print(f"  reformatted: {path}")
    else:
        print(f"  needs formatting: {path}")

    return True


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main():
    args = sys.argv[1:]

    check_only = "--check" in args
    args = [a for a in args if a != "--check"]

    if not args:
        print(__doc__)
        sys.exit(0)

    # stdin mode
    if args == ["-"]:
        source = sys.stdin.read()
        sys.stdout.write(format_markdown(source))
        sys.exit(0)

    changed_any = False
    for arg in args:
        path = Path(arg)
        if not path.exists():
            print(f"error: {path} not found", file=sys.stderr)
            sys.exit(1)
        if path.is_dir():
            # Recurse into directory
            for md in sorted(path.rglob("*.md")):
                if process_file(md, check_only):
                    changed_any = True
        else:
            if process_file(path, check_only):
                changed_any = True

    if check_only and changed_any:
        print("\nRun `python sentencefmt.py <files>` to fix.")
        sys.exit(1)


if __name__ == "__main__":
    main()
