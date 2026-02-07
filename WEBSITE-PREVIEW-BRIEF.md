# Website Preview – Developer Brief

## Objective

Automatically generate website preview thumbnails for portfolio project cards using only a website URL. No manual screenshots; minimal maintenance.

---

## Functional Requirements

| Requirement | Detail |
|------------|--------|
| Input | A single website URL (e.g. from `data/portfolio.json` → `projects[].url`) |
| Output | A single image URL suitable for `<img src="…">` |
| Priority 1 | Use Open Graph `og:image` when present (fast, free) |
| Priority 2 | Fallback to screenshot service (e.g. Microlink) |
| Priority 3 | Return a placeholder image on failure |

---

## Flow

```
Client (WorkCard)
    ↓
useWebsitePreview(project.url)
    ↓
GET /api/website-preview?url=…
    ↓
[ OG image? → Screenshot URL? → Placeholder ]
    ↓
JSON { image: "https://…" } or { image: "/preview-placeholder.svg" }
```

---

## Caching

- **Cache API response** for 7–30 days.
- **Regenerate only when:** the URL changes or the cache expires.

**Recommended response header:**

```http
Cache-Control: public, s-maxage=604800, stale-while-revalidate=86400
```

- `s-maxage=604800` → 7 days in CDN/server cache.
- `stale-while-revalidate=86400` → serve stale for 1 day while revalidating in background.

---

## Security

| Rule | Implementation |
|------|----------------|
| Whitelist protocols | Only allow `https://` URLs; reject `http://` and others. |
| Timeout | Limit fetch to 3–5 seconds to avoid hanging. |
| No client-side headless | All scraping/screenshots run on the server (API route only). |

---

## UI/UX (Portfolio Cards)

- **Loading:** Skeleton shimmer while the preview is loading.
- **Loaded:** Smooth fade-in of the preview image.
- **Hover:** Slight scale (e.g. `transform: scale(1.04)`) on the card image.
- **Overlay:** Dark gradient at the bottom of the image for text readability.
- **Fallback:** Placeholder image must look intentional (e.g. “Preview unavailable” or neutral graphic).

---

## Files Overview

| File | Purpose |
|------|--------|
| `hooks/useWebsitePreview.js` | Client hook: calls `/api/website-preview?url=…`, returns `{ image, loading, error }`. |
| `pages/api/website-preview.js` | API: OG → screenshot URL → placeholder; sets cache headers; HTTPS-only, timeout. |
| `public/preview-placeholder.svg` | Fallback image when preview cannot be generated. |
| `components/WorkCard/index.js` | Uses `useWebsitePreview(project.url)`, shows skeleton and preview or fallback. |

---

## Optional Enhancements (V2)

- Regenerate previews on deploy (e.g. cron or build step).
- Store generated screenshots in Cloudinary/S3 and return that URL.
- Blur-hash or low-res placeholder while full image loads.
- Auto-refresh preview every 30 days (e.g. via cache headers or background job).
- “Live” badge or indicator when the site is reachable.

---

## Summary

- **Fast cards:** OG first, then screenshot URL; aggressive caching.
- **Smart fallbacks:** Placeholder and existing `imageSrc` from portfolio data.
- **Zero manual screenshots:** Fully driven by project URL.
- **Handoff-ready:** This brief plus the listed files are enough for a developer to maintain or extend the feature.
