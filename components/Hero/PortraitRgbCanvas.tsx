"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP);

export type PortraitPointer = {
  x: number;
  y: number;
  hovered: boolean;
};

type PortraitRgbCanvasProps = {
  src: string;
  pointerRef: RefObject<PortraitPointer>;
};

const MAX_SHIFT = 0.045;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5);
    vec2 fromCenter = uMouse - center;
    float dist = length(fromCenter);
    vec2 dir = dist > 0.001 ? normalize(fromCenter) : vec2(0.12, 0.0);

    // Mouse position drives RGB channel offset in the fragment shader.
    float amount = uStrength * (0.006 + dist * ${MAX_SHIFT.toFixed(3)});
    vec2 offset = dir * amount;

    vec4 sampleR = texture2D(uTexture, vUv + offset);
    vec4 sampleG = texture2D(uTexture, vUv);
    vec4 sampleB = texture2D(uTexture, vUv - offset);

    float alpha = max(max(sampleR.a, sampleG.a), sampleB.a);
    gl_FragColor = vec4(sampleR.r, sampleG.g, sampleB.b, alpha);
  }
`;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PortraitRgbCanvas({ src, pointerRef }: PortraitRgbCanvasProps) {
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
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = styles.portraitCanvas;
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
          // Keep the fallback <img> visible if the texture fails.
        },
      );

      const tick = () => {
        const pointer = pointerRef.current;
        const targetX = pointer?.x ?? 0.5;
        const targetY = pointer?.y ?? 0.5;
        const targetStrength = pointer?.hovered ? 1 : 0;

        smooth.mouseX += (targetX - smooth.mouseX) * 0.14;
        smooth.mouseY += (targetY - smooth.mouseY) * 0.14;
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
    <div ref={containerRef} className={styles.portrait}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={fallbackRef}
        src={src}
        alt=""
        className={styles.portraitCutout}
        draggable={false}
      />
    </div>
  );
}
