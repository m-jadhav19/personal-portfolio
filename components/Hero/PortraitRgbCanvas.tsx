"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import {
  bindIdleAwareTicker,
  getRenderPixelRatio,
  hasSettled,
  stepSmoothChannels,
} from "@/lib/animationPerf";

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
  lowPower?: boolean;
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

export function PortraitRgbCanvas({
  src,
  pointerRef,
  lowPower = false,
}: PortraitRgbCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || prefersReducedMotion()) return;

      let disposed = false;
      let restingFrameDrawn = false;
      const smooth = {
        mouseX: { current: 0.5, target: 0.5 },
        mouseY: { current: 0.5, target: 0.5 },
        strength: { current: 0, target: 0, epsilon: 0.01 },
      };

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
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
        renderer.setPixelRatio(
          getRenderPixelRatio(lowPower ? 1 : 1.5, lowPower ? 0.85 : 1),
        );
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
          // Keep the fallback <img> visible if the texture fails.
        },
      );

      const tick = () => {
        const pointer = pointerRef.current;
        smooth.mouseX.target = pointer?.x ?? 0.5;
        smooth.mouseY.target = pointer?.y ?? 0.5;
        smooth.strength.target = pointer?.hovered ? 1 : 0;

        const moving = stepSmoothChannels(
          [smooth.mouseX, smooth.mouseY, smooth.strength],
          0.14,
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
    { scope: containerRef, dependencies: [src, pointerRef, lowPower] },
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
