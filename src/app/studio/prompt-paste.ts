export function clipboardImageFiles(data: Pick<DataTransfer, "items">): File[] {
  return Array.from(data.items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

export function mergePastedImageAssets<T extends { role: "image" | "mask" }>(previous: T[], pasted: T[], limit = 4): T[] {
  return [...previous.filter((item) => item.role === "image"), ...pasted].slice(0, limit);
}
