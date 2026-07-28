import { NextResponse } from "next/server";

import {
  mapItunesResults,
  pickSearchQueries,
  shuffleTracks,
  type MySpaceTrack,
} from "@/lib/easterEggs/myspaceMusic";

type ItunesResponse = {
  results?: Array<{
    trackId: number;
    trackName: string;
    artistName: string;
    previewUrl?: string;
    artworkUrl100?: string;
    releaseDate?: string;
  }>;
};

async function fetchItunesTracks(query: string) {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", query);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "40");

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    return [] as MySpaceTrack[];
  }

  const data = (await response.json()) as ItunesResponse;
  return mapItunesResults(data.results ?? []);
}

export async function GET() {
  try {
    const queries = pickSearchQueries(5);
    const batches = await Promise.all(queries.map((query) => fetchItunesTracks(query)));
    const tracks = shuffleTracks(batches.flat());

    if (tracks.length === 0) {
      return NextResponse.json(
        { tracks: [], error: "No preview tracks found." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { tracks: tracks.slice(0, 24) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { tracks: [], error: "Failed to load music." },
      { status: 500 },
    );
  }
}
