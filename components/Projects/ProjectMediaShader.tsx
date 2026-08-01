"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

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

/** Lens magnification + soft RGB fringe — suited to UI/product screenshots. */
const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    vec2 toMouse = uMouse - vUv;
    float dist = length(toMouse);
    float falloff = smoothstep(0.62, 0.0, dist) * uStrength;

    // Magnify slightly toward the cursor (optical lens).
    vec2 uv = vUv + toMouse * falloff * 0.085;
    uv = clamp(uv, 0.001, 0.999);

    vec2 dir = dist > 0.0008 ? normalize(toMouse) : vec2(0.08, 0.0);
    float aberration = falloff * 0.014;

    float r = texture2D(uTexture, clamp(uv + dir * aberration, 0.0, 1.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, clamp(uv - dir * aberration, 0.0, 1.0)).b;

    // Gentle lift near the hot spot so the lens reads clearly.
    float lift = 1.0 + falloff * 0.06;
    gl_FragColor = vec4(r * lift, g * lift, b * lift, 1.0);
  }
`;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      if (!container || prefersReducedMotion()) return;

      let disposed = false;
      const smooth = {
        mouseX: 0.5,
        mouseY: 0.5,
        strength: 0,
      };

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
      };

      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

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
        const targetX = pointer?.x ?? 0.5;
        const targetY = pointer?.y ?? 0.5;
        const targetStrength = pointer?.hovered ? 1 : 0;

        smooth.mouseX += (targetX - smooth.mouseX) * 0.16;
        smooth.mouseY += (targetY - smooth.mouseY) * 0.16;
        smooth.strength += (targetStrength - smooth.strength) * 0.12;

        uniforms.uMouse.value.set(smooth.mouseX, 1 - smooth.mouseY);
        uniforms.uStrength.value = smooth.strength;
        renderer.render(scene, camera);
      };

      gsap.ticker.add(tick);

      return () => {
        disposed = true;
        gsap.ticker.remove(tick);
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
