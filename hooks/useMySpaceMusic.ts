"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { MySpaceTrack } from "@/lib/easterEggs/myspaceMusic";

type UseMySpaceMusicOptions = {
  enabled: boolean;
};

export function useMySpaceMusic({ enabled }: UseMySpaceMusicOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<MySpaceTrack[]>([]);
  const indexRef = useRef(0);

  const [track, setTrack] = useState<MySpaceTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [error, setError] = useState<string | null>(null);

  const loadTrackAt = useCallback((index: number) => {
    const playlist = playlistRef.current;
    if (playlist.length === 0) return;

    const nextIndex = ((index % playlist.length) + playlist.length) % playlist.length;
    indexRef.current = nextIndex;
    setTrack(playlist[nextIndex]);
  }, []);

  const playCurrent = useCallback(async () => {
    const audio = audioRef.current;
    const current = playlistRef.current[indexRef.current];
    if (!audio || !current) return;

    audio.src = current.previewUrl;
    audio.volume = volume;

    try {
      await audio.play();
      setIsPlaying(true);
      setNeedsInteraction(false);
      setError(null);
    } catch {
      setIsPlaying(false);
      setNeedsInteraction(true);
    }
  }, [volume]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
      return;
    }
    await playCurrent();
  }, [isPlaying, pause, playCurrent]);

  const skip = useCallback(async () => {
    loadTrackAt(indexRef.current + 1);
    await playCurrent();
  }, [loadTrackAt, playCurrent]);

  const shuffle = useCallback(async () => {
    const playlist = playlistRef.current;
    if (playlist.length < 2) return;

    const current = playlist[indexRef.current];
    const rest = playlist.filter((item) => item.id !== current.id);
    const shuffled = [current, ...rest.sort(() => Math.random() - 0.5)];
    playlistRef.current = shuffled;
    indexRef.current = 0;
    setTrack(current);
    await playCurrent();
  }, [playCurrent]);

  useEffect(() => {
    if (!enabled) return;

    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      loadTrackAt(indexRef.current + 1);
      void playCurrent();
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, [enabled, loadTrackAt, playCurrent]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const loadPlaylist = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/myspace-music");
        const data = (await response.json()) as {
          tracks?: MySpaceTrack[];
          error?: string;
        };

        if (cancelled) return;

        if (!response.ok || !data.tracks?.length) {
          setError(data.error ?? "Could not load tracks.");
          setIsLoading(false);
          return;
        }

        playlistRef.current = data.tracks;
        indexRef.current = Math.floor(Math.random() * data.tracks.length);
        setTrack(data.tracks[indexRef.current]);
        setIsLoading(false);

        await playCurrent();
      } catch {
        if (!cancelled) {
          setError("Music API unavailable.");
          setIsLoading(false);
        }
      }
    };

    void loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [enabled, playCurrent]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!enabled) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setTrack(null);
      setNeedsInteraction(false);
      playlistRef.current = [];
    }
  }, [enabled]);

  return {
    track,
    isPlaying,
    isLoading,
    needsInteraction,
    volume,
    error,
    setVolume,
    togglePlay,
    skip,
    shuffle,
    playCurrent,
  };
}
