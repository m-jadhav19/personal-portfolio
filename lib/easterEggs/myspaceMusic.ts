export type MySpaceTrack = {
  id: number;
  title: string;
  artist: string;
  previewUrl: string;
  artworkUrl: string;
  releaseYear: number;
};

type ItunesResult = {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl?: string;
  artworkUrl100?: string;
  releaseDate?: string;
};

export const MYSPACE_SEARCH_QUERIES = [
  "Linkin Park",
  "Blink-182",
  "Avril Lavigne",
  "Britney Spears",
  "Green Day",
  "Eminem",
  "Outkast",
  "Usher",
  "Beyonce",
  "The Killers",
  "Fall Out Boy",
  "My Chemical Romance",
  "Simple Plan",
  "Sum 41",
  "Good Charlotte",
  "Evanescence",
  "Nickelback",
  "Nelly",
  "50 Cent",
  "Destiny's Child",
  "NSYNC",
  "Backstreet Boys",
  "System of a Down",
  "Papa Roach",
  "Hoobastank",
  "Yellowcard",
  "Taking Back Sunday",
  "Brand New",
  "Dashboard Confessional",
  "Jimmy Eat World",
] as const;

function getReleaseYear(releaseDate?: string) {
  if (!releaseDate) return 0;
  return new Date(releaseDate).getFullYear();
}

function isEarly2000s(year: number) {
  return year >= 2000 && year <= 2009;
}

export function mapItunesResults(results: ItunesResult[]): MySpaceTrack[] {
  const seen = new Set<number>();

  return results
    .filter((item) => {
      if (!item.previewUrl || !item.trackId) return false;
      if (seen.has(item.trackId)) return false;

      const year = getReleaseYear(item.releaseDate);
      if (!isEarly2000s(year)) return false;

      seen.add(item.trackId);
      return true;
    })
    .map((item) => ({
      id: item.trackId,
      title: item.trackName,
      artist: item.artistName,
      previewUrl: item.previewUrl!,
      artworkUrl: item.artworkUrl100?.replace("100x100", "200x200") ?? "",
      releaseYear: getReleaseYear(item.releaseDate),
    }));
}

export function shuffleTracks<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function pickSearchQueries(count = 4) {
  const pool = shuffleTracks([...MYSPACE_SEARCH_QUERIES]);
  return pool.slice(0, count);
}
