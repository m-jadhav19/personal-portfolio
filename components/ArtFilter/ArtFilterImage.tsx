"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

import { useTypoArtStyle } from "@/hooks/useTypoArtStyle";
import {
  renderAsciiImage,
  renderDitheredImage,
} from "@/lib/artFilter/renderToCanvas";

import styles from "./ArtFilterImage.module.css";

type ArtFilterImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  cellSize?: number;
};

export function ArtFilterImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  fill = true,
  cellSize = 7,
}: ArtFilterImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const artStyle = useTypoArtStyle();

  useEffect(() => {
    const image = new window.Image();
    image.src = src;
    image.decoding = "async";
    image.onload = () => {
      imageRef.current = image;
      setIsReady(true);
    };
  }, [src]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!root || !canvas || !image || !isReady || artStyle === "photo") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const rect = root.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const renderWidth = Math.round(width * dpr);
      const renderHeight = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (artStyle === "dither") {
        renderDitheredImage(ctx, image, renderWidth, renderHeight);
      } else {
        renderAsciiImage(
          ctx,
          image,
          renderWidth,
          renderHeight,
          Math.max(5, Math.round(cellSize * dpr)),
        );
      }
    };

    render();

    const observer = new ResizeObserver(render);
    observer.observe(root);

    return () => observer.disconnect();
  }, [artStyle, cellSize, isReady]);

  const showCanvas = artStyle !== "photo" && isReady;

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`}>
      {fill ? (
        <NextImage
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.fallback}
          style={{ opacity: showCanvas ? 0 : 1 }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={styles.fallback}
          style={{ opacity: showCanvas ? 0 : 1 }}
        />
      )}
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${showCanvas ? styles.canvasVisible : ""}`}
        aria-hidden={showCanvas}
      />
    </div>
  );
}
