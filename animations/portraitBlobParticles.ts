import { gsap } from "gsap";

import { MERCURY_CORE, getBlobSpawnPoint } from "@/animations/portraitBlob";
import { prefersReducedShapeMotion } from "@/animations/shapeOverlay";

const PARTICLE_COUNT = 14;

type ParticleElements = {
  root: SVGGElement;
  circles: SVGCircleElement[];
};

export function createMercuryParticleSystem(
  svg: SVGSVGElement,
  group: SVGGElement,
) {
  const particles: ParticleElements[] = [];
  let isActive = true;

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const root = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    core.setAttribute("r", "0.55");
    core.setAttribute("fill", MERCURY_CORE);
    glow.setAttribute("r", "1.1");
    glow.setAttribute("fill", MERCURY_CORE);
    glow.setAttribute("opacity", "0.35");

    root.append(glow, core);
    root.setAttribute("opacity", "0");
    group.append(root);
    particles.push({ root, circles: [glow, core] });
  }

  const spawnParticle = (element: ParticleElements, delay: number) => {
    if (!isActive || prefersReducedShapeMotion()) return;

    const angle = Math.random() * 360;
    const spawn = getBlobSpawnPoint(angle, 39 + Math.random() * 4);
    const distance = 4 + Math.random() * 9;
    const rad = (angle * Math.PI) / 180;
    const targetX = spawn.x + Math.cos(rad - Math.PI / 2) * distance;
    const targetY = spawn.y + Math.sin(rad - Math.PI / 2) * distance;
    const size = 0.35 + Math.random() * 0.45;

    element.circles[0].setAttribute("r", `${size * 1.8}`);
    element.circles[1].setAttribute("r", `${size}`);

    gsap.set(element.root, {
      attr: { transform: `translate(${spawn.x} ${spawn.y})` },
      opacity: 0,
    });

    gsap
      .timeline({ delay, repeat: -1, repeatDelay: 1.2 + Math.random() * 2.8 })
      .to(element.root, {
        opacity: 0.85,
        duration: 0.35,
        ease: "power1.out",
      })
      .to(
        element.root,
        {
          attr: { transform: `translate(${targetX} ${targetY})` },
          opacity: 0,
          duration: 1.6 + Math.random() * 1.2,
          ease: "power1.in",
        },
        0.1,
      );
  };

  particles.forEach((particle, index) => {
    spawnParticle(particle, index * 0.35);
  });

  return () => {
    isActive = false;
    gsap.killTweensOf(particles.map((particle) => particle.root));
    group.replaceChildren();
  };
}
