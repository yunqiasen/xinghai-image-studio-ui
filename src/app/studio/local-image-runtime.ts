import type { StudioAsset } from "./mode-settings";


export async function assetToDataUrl(asset: StudioAsset) {
  if (asset.dataUrl) return asset.dataUrl;
  const source = asset.url;
  if (!source) throw new Error("图片源为空");
  const response = await fetch(source, { credentials: "include" });
  if (!response.ok) throw new Error(`读取图片失败 HTTP ${response.status}`);
  return blobToDataUrl(await response.blob());
}

export async function prepareImageTaskAssets(assets: StudioAsset[]) {
  return Promise.all(assets.map(async (asset) => {
    if (asset.dataUrl) return asset;
    return { ...asset, dataUrl: await assetToDataUrl(asset) };
  }));
}

export async function assetToFile(asset: StudioAsset, fallbackName = "source.png") {
  const source = asset.dataUrl || asset.url;
  if (!source) throw new Error("图片源为空");
  const response = await fetch(source, { credentials: "include" });
  if (!response.ok) throw new Error(`读取图片失败 HTTP ${response.status}`);
  const blob = await response.blob();
  const type = blob.type || "image/png";
  return new File([blob], asset.name || fallbackName, { type });
}

export async function blobToDataUrl(blob: Blob) {
  if (typeof FileReader !== "undefined") {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("读取处理结果失败"));
      reader.readAsDataURL(blob);
    });
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return `data:${blob.type || "image/png"};base64,${btoa(binary)}`;
}
