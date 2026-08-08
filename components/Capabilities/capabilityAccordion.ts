export function getNextOpenCapability(
  currentId: string | null,
  clickedId: string,
) {
  return currentId === clickedId ? null : clickedId;
}
