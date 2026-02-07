import { useEffect, useState } from 'react';

/**
 * Fetches a preview thumbnail for a website URL from the backend.
 * @param {string} url - Website URL (e.g. https://example.com)
 * @returns {{ image: string | null, loading: boolean, error: boolean }}
 */
export function useWebsitePreview(url) {
  const [state, setState] = useState({
    image: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    if (!url) {
      setState({ image: null, loading: false, error: false });
      return;
    }

    let cancelled = false;

    async function fetchPreview() {
      try {
        setState({ image: null, loading: true, error: false });

        const res = await fetch(
          `/api/website-preview?url=${encodeURIComponent(url)}`
        );

        if (!res.ok) throw new Error('Preview failed');

        const data = await res.json();

        if (!cancelled) {
          setState({
            image: data.image ?? null,
            loading: false,
            error: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            image: null,
            loading: false,
            error: true,
          });
        }
      }
    }

    fetchPreview();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
