"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import {
  bindIdleAwareTicker,
  hasSettled,
  stepSmoothChannels,
} from "@/lib/animationPerf";

import styles from "./FeaturedWork.module.css";

gsap.registerPlugin(useGSAP);

export type MediaPointer = {
  x: number;
  y: number;
  hovered: boolean;
};

type ProjectMediaShaderProps = {
  src: string;
  alt: string;
  pointerRef: RefObject<MediaPointer>;
};

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Hover signature: brief RGB separation + pixel displacement + scanline.
 * Settles quickly (~200–400ms via strength smoothing).
 */
const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    if (uStrength < 0.001) {
      gl_FragColor = texture2D(uTexture, vUv);
      return;
    }

    vec2 toMouse = uMouse - vUv;
    float dist = length(toMouse);
    float falloff = smoothstep(0.72, 0.0, dist) * uStrength;

    // Pixel displacement (blocky offset)
    float pixelSize = mix(120.0, 48.0, uStrength);
    vec2 pixelUv = floor(vUv * pixelSize) / pixelSize;
    float noise = hash(pixelUv + floor(uTime * 12.0));
    vec2 displace = vec2(
      (noise - 0.5) * 0.028,
      (hash(pixelUv.yx) - 0.5) * 0.016
    ) * uStrength;

    vec2 uv = vUv + toMouse * falloff * 0.04 + displace;
    uv = clamp(uv, 0.001, 0.999);

    // RGB separation
    vec2 dir = dist > 0.0008 ? normalize(toMouse) : vec2(0.12, 0.0);
    float aberration = falloff * 0.012 + uStrength * 0.006;
    float r = texture2D(uTexture, clamp(uv + dir * aberration, 0.0, 1.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, clamp(uv - dir * aberration, 0.0, 1.0)).b;

    // Scanlines
    float scan = sin((vUv.y + uTime * 0.35) * 780.0) * 0.045 * uStrength;
    float lift = 1.0 + falloff * 0.03;

    gl_FragColor = vec4(
      (r + scan) * lift,
      (g + scan * 0.6) * lift,
      (b + scan * 0.8) * lift,
      1.0
    );
  }
`;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function ProjectMediaShader({
  src,
  alt,
  pointerRef,
}: ProjectMediaShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || prefersReducedMotion() || isCoarsePointer()) return;

      let disposed = false;
      let restingFrameDrawn = false;
      const smooth = {
        mouseX: { current: 0.5, target: 0.5 },
        mouseY: { current: 0.5, target: 0.5 },
        // Faster settle (~250–350ms feel) for signature burst
        strength: { current: 0, target: 0, epsilon: 0.008 },
      };

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = styles.mediaCanvas;
      renderer.domElement.setAttribute("aria-hidden", "true");

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
      camera.position.z = 1;

      const uniforms = {
        uTexture: { value: null as THREE.Texture | null },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0 },
        uTime: { value: 0 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      scene.add(mesh);
      container.appendChild(renderer.domElement);

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width < 1 || height < 1) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(width, height, false);
      };

      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const renderFrame = () => {
        uniforms.uMouse.value.set(
          smooth.mouseX.current,
          1 - smooth.mouseY.current,
        );
        uniforms.uStrength.value = smooth.strength.current;
        uniforms.uTime.value = performance.now() * 0.001;
        renderer.render(scene, camera);
      };

      const loader = new THREE.TextureLoader();
      loader.load(
        src,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          uniforms.uTexture.value = texture;
          material.needsUpdate = true;
          renderFrame();
          restingFrameDrawn = true;
          if (fallbackRef.current) {
            fallbackRef.current.hidden = true;
          }
        },
        undefined,
        () => {
          // Keep the fallback image if the texture fails.
        },
      );

      const tick = () => {
        const pointer = pointerRef.current;
        smooth.mouseX.target = pointer?.x ?? 0.5;
        smooth.mouseY.target = pointer?.y ?? 0.5;
        smooth.strength.target = pointer?.hovered ? 1 : 0;

        const moving = stepSmoothChannels(
          [smooth.mouseX, smooth.mouseY, smooth.strength],
          0.22,
        );

        const interacting =
          smooth.strength.current > 0.01 || smooth.strength.target > 0.01;
        const pointerMoving =
          !hasSettled(smooth.mouseX.current, 0.5) ||
          !hasSettled(smooth.mouseY.current, 0.5);

        if (!moving && !interacting && !pointerMoving) {
          if (restingFrameDrawn) return;
          renderFrame();
          restingFrameDrawn = true;
          return;
        }

        restingFrameDrawn = false;
        renderFrame();
      };

      const stopTicker = bindIdleAwareTicker(container, tick);

      return () => {
        disposed = true;
        stopTicker();
        resizeObserver.disconnect();
        uniforms.uTexture.value?.dispose();
        material.dispose();
        mesh.geometry.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    },
    { scope: containerRef, dependencies: [src, pointerRef] },
  );

  return (
    <div ref={containerRef} className={styles.mediaShader}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={fallbackRef}
        src={src}
        alt={alt}
        className={styles.mediaImage}
        draggable={false}
      />
    </div>
  );
}
