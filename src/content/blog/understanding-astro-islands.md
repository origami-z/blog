---
title: "Understanding Astro Islands"
description: "How partial hydration works in Astro."
pubDate: 2026-06-20
tags: ["astro", "performance", "react"]
draft: false
---

Astro's island architecture is one of the most compelling reasons to use it
for content-heavy sites. Instead of shipping a full JavaScript framework to
the browser, Astro only hydrates the components that need interactivity.

## How It Works

By default, every component in Astro renders to static HTML at build time.
No JavaScript is sent to the client. When you need interactivity, you opt
in with a `client:*` directive:

```astro
<!-- Static — no JS shipped -->
<MyComponent />

<!-- Interactive — hydrated on load -->
<MyComponent client:load />

<!-- Interactive — hydrated when visible -->
<MyComponent client:visible />
```

## Why It Matters

On a typical blog, most of the page is static content. Only a search widget
or theme toggle needs JavaScript. With islands, that's exactly what gets
hydrated — nothing more.

The result: faster page loads, less bandwidth, and better Core Web Vitals.

## Practical Example

On this blog, the `ThemeToggle` and `TagFilter` components use `client:load`
because they need to be interactive immediately. Everything else — headers,
footers, post cards — is pure static HTML.
