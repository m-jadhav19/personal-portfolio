export function getNextOpenService(
  currentId: string | null,
  selectedId: string,
): string | null {
  return currentId === selectedId ? null : selectedId;
}
