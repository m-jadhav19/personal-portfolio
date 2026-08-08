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

/** Artists and tracks featured on GTA Vice City radio stations */
export const VICE_CITY_SEARCH_QUERIES = [
  "Jan Hammer Crockett's Theme",
  "Michael Jackson Billie Jean",
  "Run-DMC Rock Box",
  "Quiet Riot Cum On Feel the Noize",
  "Judas Priest You've Got Another Thing Comin",
  "Wham Wake Me Up Before You Go-Go",
  "Laura Branigan Self Control",
  "Gary Numan Cars",
  "Kate Bush Wow",
  "Roxy Music More Than This",
  "Pointer Sisters Jump",
  "Autograph Turn Up the Radio",
  "Ozzy Osbourne Bark at the Moon",
  "Herbie Hancock Rockit",
  "Electric Light Orchestra Four Little Diamonds",
  "Glenn Frey The Heat Is On",
  "Madonna Borderline",
  "Squeeze Tempted",
  "Cutting Crew Died In Your Arms",
  "Billy Ocean Caribbean Queen",
  "Village People YMCA",
  "Freak Power Freak Power",
  "Lynyrd Skynyrd Free Bird",
  "Iron Maiden 2 Minutes to Midnight",
  "Night Ranger Sister Christian",
  "Rockstar Games Vice City",
] as const;

function getReleaseYear(releaseDate?: string) {
  if (!releaseDate) return 0;
  return new Date(releaseDate).getFullYear();
}

function isViceCityEra(year: number) {
  return year >= 1978 && year <= 1989;
}

export function mapItunesResults(results: ItunesResult[]): MySpaceTrack[] {
  const seen = new Set<number>();

  return results
    .filter((item) => {
      if (!item.previewUrl || !item.trackId) return false;
      if (seen.has(item.trackId)) return false;

      const year = getReleaseYear(item.releaseDate);
      if (year > 0 && !isViceCityEra(year)) return false;

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
  const pool = shuffleTracks([...VICE_CITY_SEARCH_QUERIES]);
  return pool.slice(0, count);
}
