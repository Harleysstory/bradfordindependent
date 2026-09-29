# Bradford Independent

The website of **Bradford Independent** — the independent consultancy of
Harley Bradford, business analyst & consultant, based in Great Yarmouth, Norfolk.

> Understand → Improve → Build — the systems behind your work.

## About this site

A dependency-free static website: semantic HTML, modern CSS, and a single small
progressive-enhancement script. No frameworks, no build step, no tracking.

### Structure

```
index.html                     Home
services/                      Services
how-i-work/                    How I Work
work/                          Case-study index + case studies
about/                         About Harley Bradford
contact/                       Contact
404.html                       Not-found page
robots.txt / sitemap.xml       Search-engine plumbing
assets/                        CSS, JS, self-hosted fonts, images
```

Each page is `folder/index.html`, which produces clean URLs
(`bradfordindependent.com/services/`) on any static host.

## Deploying

Upload/deploy the repository contents to the web root of
`bradfordindependent.com`. The folder structure works as-is on Apache/nginx
shared hosting, Netlify, Cloudflare Pages, GitHub Pages, or Vercel — no
configuration required.

## Content notes

Some case-study sections contain explicit placeholders
(`[CASE STUDY OUTCOME NEEDED]`) where verified outcome information is not yet
published. These are intentional: nothing is claimed that hasn't been verified.
