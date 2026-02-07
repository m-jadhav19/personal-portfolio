import cheerio from 'cheerio';

const FETCH_TIMEOUT_MS = 5000;
const PLACEHOLDER_IMAGE = '/preview-placeholder.svg';

/** Only allow HTTPS URLs. */
function isAllowedUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Fetch with timeout. */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioPreview/1.0)',
        ...options.headers,
      },
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing URL' });
  }

  if (!isAllowedUrl(url)) {
    return res.status(400).json({ error: 'Only HTTPS URLs are allowed', image: PLACEHOLDER_IMAGE });
  }

  // Cache: 7 days, revalidate in background after 1 day
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=604800, stale-while-revalidate=86400'
  );

  try {
    // 1) Try Open Graph image
    const htmlRes = await fetchWithTimeout(url);
    const html = await htmlRes.text();
    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr('content');

    if (ogImage && ogImage.startsWith('http')) {
      return res.status(200).json({ image: ogImage });
    }

    // 2) Fallback: Screenshot API (Microlink)
    const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false`;
    return res.status(200).json({ image: screenshotUrl });
  } catch {
    // 3) Last resort: placeholder
    return res.status(200).json({ image: PLACEHOLDER_IMAGE });
  }
}
