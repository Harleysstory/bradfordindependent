#!/usr/bin/env python3
"""
Bradford Independent — static site build script.

Reads page sources from src/pages/ and shared templates from src/templates/,
then writes the final static HTML to the project root for deployment.

Usage:
    python build.py          # build all pages
    python build.py --watch   # rebuild on file change (requires watchdog)

The build is idempotent: running it twice produces the same output.
No external dependencies required (pure Python standard library).
"""

import os
import re
import sys

# ---------- Configuration ----------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_PAGES = os.path.join(SCRIPT_DIR, "src", "pages")
SRC_TEMPLATES = os.path.join(SCRIPT_DIR, "src", "templates")
OUTPUT_DIR = SCRIPT_DIR  # root directory

# Nav active-state mapping: relative page path -> placeholder name
NAV_ACTIVE = {
    "index.html": "ACTIVE_HOME",
    "services/index.html": "ACTIVE_SERVICES",
    "how-i-work/index.html": "ACTIVE_HOW",
    "work/index.html": "ACTIVE_WORK",
    "about/index.html": "ACTIVE_ABOUT",
    "contact/index.html": "ACTIVE_CONTACT",
}

# All active-state placeholders (replaced with empty string when not active)
ALL_ACTIVE_KEYS = [
    "ACTIVE_HOME", "ACTIVE_SERVICES", "ACTIVE_HOW",
    "ACTIVE_WORK", "ACTIVE_ABOUT", "ACTIVE_CONTACT",
]


def get_depth(rel_path):
    """Count directory depth from src/pages/ root.
    index.html -> 0, about/index.html -> 1, work/subtyped-me/index.html -> 2
    """
    parts = rel_path.replace("\\", "/").split("/")
    return len(parts) - 1


def get_root_prefix(depth):
    """Return the relative path prefix for the given depth.
    depth 0 -> "", depth 1 -> "../", depth 2 -> "../../"
    """
    if depth == 0:
        return ""
    return "../" * depth


def process_template(template, root_prefix, active_key=None):
    """Replace {{ROOT}} and {{ACTIVE_*}} placeholders in a template.

    When a nav item is active, its placeholder becomes aria-current="page".
    When inactive, the placeholder and its leading space are removed entirely
    to avoid stray whitespace in the output HTML.
    """
    result = template.replace("{{ROOT}}", root_prefix)
    for key in ALL_ACTIVE_KEYS:
        if key == active_key:
            result = result.replace("{{" + key + "}}", 'aria-current="page"')
        else:
            result = result.replace(" {{" + key + "}}", "")
            result = result.replace("{{" + key + "}}", "")
    return result


def build_page(src_path, rel_path):
    """Build a single page: read source, inject templates, write output."""
    with open(src_path, "r", encoding="utf-8") as f:
        content = f.read()

    depth = get_depth(rel_path)
    root_prefix = get_root_prefix(depth)

    # Determine active nav key
    active_key = NAV_ACTIVE.get(rel_path.replace("\\", "/"))

    # Process header and footer templates
    header = process_template(HEADER_TEMPLATE, root_prefix, active_key)
    footer = process_template(FOOTER_TEMPLATE, root_prefix, None)

    # Replace markers in page content
    content = content.replace("<!-- BI_HEADER -->", header)
    content = content.replace("<!-- BI_FOOTER -->", footer)

    # Replace {{ROOT}} in the page itself (for head links, script tags, etc.)
    content = content.replace("{{ROOT}}", root_prefix)

    # Write output
    out_path = os.path.join(OUTPUT_DIR, rel_path)
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)

    return out_path


def main():
    global HEADER_TEMPLATE, FOOTER_TEMPLATE

    # Read templates
    header_path = os.path.join(SRC_TEMPLATES, "header.html")
    footer_path = os.path.join(SRC_TEMPLATES, "footer.html")

    if not os.path.exists(header_path):
        print(f"Error: header template not found at {header_path}")
        sys.exit(1)
    if not os.path.exists(footer_path):
        print(f"Error: footer template not found at {footer_path}")
        sys.exit(1)

    with open(header_path, "r", encoding="utf-8") as f:
        HEADER_TEMPLATE = f.read()
    with open(footer_path, "r", encoding="utf-8") as f:
        FOOTER_TEMPLATE = f.read()

    # Walk through all page sources
    built = 0
    for root, dirs, files in os.walk(SRC_PAGES):
        dirs.sort()
        for fname in sorted(files):
            if fname.endswith(".html"):
                full_path = os.path.join(root, fname)
                rel_path = os.path.relpath(full_path, SRC_PAGES)
                out_path = build_page(full_path, rel_path)
                print(f"  Built: {rel_path}")
                built += 1

    print(f"\nBuild complete: {built} page(s) written to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
