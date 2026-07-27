import { gsap } from "gsap";

import { buildPathData, prefersReducedShapeMotion } from "@/animations/shapeOverlay";

const NUM_POINTS = 10;
const FRAME_POINT_MIN = 6;
const FRAME_POINT_MAX = 28;
const FRAME_POINT_MAX_HOVER = 38;

function createRandomPoint(getHoverIntensity: () => number) {
  return () => {
    const hoverIntensity = getHoverIntensity();
    const max =
      FRAME_POINT_MAX + hoverIntensity * (FRAME_POINT_MAX_HOVER - FRAME_POINT_MAX);
    return FRAME_POINT_MIN + Math.random() * (max - FRAME_POINT_MIN);
  };
}

export function createPortraitFrameController(paths: SVGPathElement[]) {
  const hoverState = { value: 0 };
  const randomPoint = createRandomPoint(() => hoverState.value);

  const allPoints: number[][] = paths.map(() =>
    Array.from({ length: NUM_POINTS }, () => randomPoint()),
  );
  let timeline: gsap.core.Timeline | null = null;
  let hoverTween: gsap.core.Tween | null = null;

  const render = () => {
    paths.forEach((path, index) => {
      path.setAttribute("d", buildPathData(allPoints[index], index % 2 === 1));
    });
  };

  const start = () => {
    render();

    if (prefersReducedShapeMotion()) {
      return;
    }

    timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: {
        ease: "sine.inOut",
        duration: 3.2,
      },
      onUpdate: render,
    });

    allPoints.forEach((points, pathIndex) => {
      points.forEach((_, pointIndex) => {
        timeline!.to(
          points,
          {
            [pointIndex]: randomPoint(),
            duration: 2.4 + Math.random() * 1.6,
          },
          pathIndex * 0.35 + pointIndex * 0.07,
        );
      });
    });
  };

  const setHover = (hovered: boolean) => {
    hoverTween?.kill();

    hoverTween = gsap.to(hoverState, {
      value: hovered ? 1 : 0,
      duration: 0.45,
      ease: "power2.out",
    });

    if (timeline) {
      gsap.to(timeline, {
        timeScale: hovered ? 2.6 : 1,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });
    }
  };

  const destroy = () => {
    hoverTween?.kill();
    hoverTween = null;
    timeline?.kill();
    timeline = null;
  };

  return { start, setHover, destroy };
}
