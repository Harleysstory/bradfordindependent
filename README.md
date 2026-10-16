# Bradford Independent

The website of **Bradford Independent** — the independent consultancy of
Harley Bradford, business analyst & consultant, based in Great Yarmouth, Norfolk.

> Understand → Improve → Build — the systems behind your work.

## About this site

A dependency-free static website: semantic HTML, modern CSS, and a single small
progressive-enhancement script. No frameworks, no runtime build step, no tracking.

The header and footer are shared components maintained in
`src/templates/`. A Python build script (`build.py`) assembles the final
static HTML from page sources in `src/pages/` and the shared templates,
writing the output to the project root for deployment.

## Project structure

```
build.py                       Build script (assembles templates + pages → static HTML)
src/
  templates/
    header.html                Shared header template ({{ROOT}} + {{ACTIVE_*}} placeholders)
    footer.html                Shared footer template ({{ROOT}} placeholders)
  pages/
    index.html                 Home
    services/index.html        Services
    how-i-work/index.html      How I Work
    work/index.html            Case-study index
    work/subtyped-me/          Case study: subtyped.me
    work/liberu-software/      Case study: Liberu Software
    work/great-yarmouth-arts-festival/
                               Case study: Great Yarmouth Arts Festival
    work/the-deprivation-of-business-in-great-yarmouth/
                               Case study: Deprivation of Business
    about/index.html           About Harley Bradford
    contact/index.html         Contact
    privacy-policy/index.html  Privacy Policy
    terms-and-conditions/index.html
                               Terms & Conditions
    404.html                   Not-found page (simplified header, shared footer)
assets/
  css/style.css                Full design system (tokens, components, pages)
  js/main.js                   Progressive enhancements (nav, reveals, form, lightbox, cookies)
  fonts/                       Self-hosted variable fonts (Inter, Space Grotesk)
  img/                         Images (WebP with srcset variants, PNGs, OG image)
robots.txt                     Search-engine directives
sitemap.xml                    URL list for search engines
trailer.html                   Standalone animated trailer (not part of the build)
```

### How the build works

1. Page sources in `src/pages/` contain `<!-- BI_HEADER -->` and
   `<!-- BI_FOOTER -->` markers where the shared components go.
2. Asset paths in page sources use `{{ROOT}}` which the build script replaces
   with the correct relative prefix based on directory depth
   (`""`, `../`, `../../`).
3. The header template uses `{{ACTIVE_HOME}}`, `{{ACTIVE_SERVICES}}`, etc.
   which become `aria-current="page"` on the matching page and are removed
   on all others.
4. The 404 page is a special case: it keeps a simplified inline header
   (no navigation) and uses only `<!-- BI_FOOTER -->` for the shared footer.
5. `trailer.html` is standalone and not part of the build process.

### Running the build

```bash
python build.py
```

This reads from `src/` and writes the final HTML to the project root.
The build is idempotent and uses only the Python standard library — no
dependencies required.

## Adding a new page

1. Create `src/pages/your-page/index.html` with:
   - Full `<head>` metadata (title, description, canonical, OG tags)
   - `{{ROOT}}` for all asset paths (CSS, fonts, images, JS)
   - `<!-- BI_HEADER -->` where the header should appear
   - `<!-- BI_FOOTER -->` where the footer should appear
2. If the page should have an active nav state, add an entry to the
   `NAV_ACTIVE` dictionary in `build.py`.
3. Add the URL to `sitemap.xml`.
4. Run `python build.py` to generate the output.

## Deploying

Run `python build.py`, then deploy the repository contents to the web root
of `bradfordindependent.com`. The folder structure works as-is on Apache/nginx
shared hosting, Netlify, Cloudflare Pages, GitHub Pages, or Vercel — no
configuration required beyond pointing to the repository root.

## Content notes

Some case-study sections contain explicit placeholders
(`[CASE STUDY OUTCOME NEEDED]`) where verified outcome information is not yet
published. These are intentional: nothing is claimed that hasn't been verified.
