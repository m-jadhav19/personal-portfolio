import { subscribeLenisScroll } from "@/hooks/useLenis";

export function bindMarqueeParallax(rows: HTMLElement[]) {
  const apply = (scrollY: number) => {
    rows.forEach((row, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      row.style.transform = `translateY(${direction * scrollY * 0.08}px)`;
    });
  };

  return subscribeLenisScroll(apply);
}
