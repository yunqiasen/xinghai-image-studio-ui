import type { TranslationKey } from "@/components/language-modes";
import type { StudioMode } from "@/lib/billing/pricing";

export type StudioControl =
  | "source"
  | "model"
  | "aspect"
  | "count"
  | "resolution"
  | "prompt"
  | "reference-strength"
  | "composition"
  | "mask"
  | "image-edit-action"
  | "super-resolution-action"
  | "consistency";

export type StudioPromptTemplate = {
  id: string;
  nameKey: TranslationKey;
  prompt: string;
};

type StudioModeDefinition = {
  label: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  controls: StudioControl[];
  templates: StudioPromptTemplate[];
};

const textTemplates: StudioPromptTemplate[] = [
  { id: "photo", nameKey: "studio.template.photo", prompt: "清晨自然光下的真实摄影，主体清晰，背景柔和虚化，色彩干净高级，35mm 镜头，细节丰富" },
  { id: "product", nameKey: "studio.template.product", prompt: "高端电商商业主图，产品居中，干净背景，柔和布光，质感突出，留白合理，适合广告投放" },
  { id: "anime", nameKey: "studio.template.anime", prompt: "精致动漫角色设定图，清晰五官，服饰细节丰富，柔和光影，干净背景，角色一致性强" },
  { id: "storyboard", nameKey: "studio.template.storyboard", prompt: "电影感漫画分镜画面，强叙事构图，动态镜头，人物表情明确，光影层次丰富，画面干净" },
  { id: "render3d", nameKey: "studio.template.render3d", prompt: "高质量 3D 渲染风格，细腻材质，真实灯光，全局光照，干净构图，产品级视觉效果" },
];

const imageTemplates: StudioPromptTemplate[] = [
  { id: "restyle-photo", nameKey: "studio.template.photo", prompt: "保留参考图主体与构图，重绘为真实商业摄影，材质自然，光影细腻，画面干净" },
  { id: "restyle-anime", nameKey: "studio.template.anime", prompt: "保持参考图人物特征和姿态，转换为精致动漫角色插画，线条清晰，光影统一" },
  { id: "restyle-product", nameKey: "studio.template.product", prompt: "保持产品外形和品牌细节，重绘为高端商业主图，柔和棚拍光，背景简洁" },
  { id: "restyle-gray", nameKey: "studio.template.gray", prompt: "保持参考图内容，转换为高级灰电影调色，低饱和、柔和对比与细腻颗粒" },
];

const editTemplates: StudioPromptTemplate[] = [
  { id: "edit-clean", nameKey: "studio.template.editClean", prompt: "只修改遮罩覆盖区域，清理瑕疵并自然补全纹理，遮罩外内容保持不变" },
  { id: "edit-object", nameKey: "studio.template.editObject", prompt: "只在遮罩区域替换目标物体，保持原图构图、透视、光照和主体不变" },
  { id: "edit-clothes", nameKey: "studio.template.editClothes", prompt: "只修改遮罩区域内的服装，保持人物身份、脸部、姿势和背景不变" },
];

const imageEditTemplates: StudioPromptTemplate[] = [
  { id: "remove-background", nameKey: "studio.imageEdit.removeBackground", prompt: "移除图片背景，完整保留主体和细小边缘，输出干净透明背景效果" },
  { id: "replace-background", nameKey: "studio.imageEdit.replaceBackground", prompt: "完整保留主体，替换背景并匹配原图透视、环境光和接触阴影" },
  { id: "change-clothes", nameKey: "studio.imageEdit.changeClothes", prompt: "保持人物身份、脸部、发型和姿势不变，只更换服装" },
  { id: "swap-face", nameKey: "studio.imageEdit.swapFace", prompt: "保持原图姿势、发型、光照和背景，只替换脸部并自然融合" },
  { id: "add-text", nameKey: "studio.imageEdit.addText", prompt: "在画面合适位置添加清晰文字，保持主体可读性和整体版式平衡" },
];

const superTemplates: StudioPromptTemplate[] = [
  { id: "detail", nameKey: "studio.super.detail", prompt: "提升图片清晰度和纹理细节，保持原始内容、构图和色彩，不新增物体" },
  { id: "restore", nameKey: "studio.super.restore", prompt: "修复老照片划痕、噪点、褪色和模糊，保留人物身份与时代质感" },
  { id: "face", nameKey: "studio.super.face", prompt: "增强人脸清晰度和自然细节，保持五官身份、表情和肤质真实" },
  { id: "variation", nameKey: "studio.super.variation", prompt: "基于原图生成细节变化版本，保持主体、视觉风格和核心构图一致" },
];

const batchTemplates: StudioPromptTemplate[] = [
  { id: "character", nameKey: "studio.template.character", prompt: "保持角色发型、五官、年龄、服装和气质一致，在多个场景中生成统一角色" },
  { id: "storyboard", nameKey: "studio.template.storyboard", prompt: "生成连续分镜画面，保持人物身份和画风一致，每张具有不同镜头与叙事动作" },
];

export const imageEditActions = [
  { value: "remove-background", labelKey: "studio.imageEdit.removeBackground" as TranslationKey },
  { value: "replace-background", labelKey: "studio.imageEdit.replaceBackground" as TranslationKey },
  { value: "change-clothes", labelKey: "studio.imageEdit.changeClothes" as TranslationKey },
  { value: "swap-face", labelKey: "studio.imageEdit.swapFace" as TranslationKey },
  { value: "add-text", labelKey: "studio.imageEdit.addText" as TranslationKey },
] as const;

export const superResolutionActions = [
  { value: "2x", labelKey: "studio.super.2x" as TranslationKey },
  { value: "4x", labelKey: "studio.super.4x" as TranslationKey },
  { value: "variation", labelKey: "studio.super.variation" as TranslationKey },
  { value: "restore-photo", labelKey: "studio.super.restore" as TranslationKey },
  { value: "face-enhance", labelKey: "studio.super.face" as TranslationKey },
] as const;

export const studioVisibleModes: StudioMode[] = ["text", "image", "edit", "remove-bg", "upscale", "batch"];

export const studioModeDefinitions: Record<StudioMode, StudioModeDefinition> = {
  text: { label: "文生图", labelKey: "studio.mode.text.short", descriptionKey: "studio.mode.text.description", controls: ["model", "aspect", "count", "resolution", "prompt"], templates: textTemplates },
  image: { label: "图生图", labelKey: "studio.mode.image.short", descriptionKey: "studio.mode.image.description", controls: ["source", "reference-strength", "composition", "model", "aspect", "count", "resolution", "prompt"], templates: imageTemplates },
  edit: { label: "局部编辑", labelKey: "studio.mode.edit.short", descriptionKey: "studio.mode.edit.description", controls: ["source", "mask", "prompt"], templates: editTemplates },
  "remove-bg": { label: "图片编辑", labelKey: "studio.mode.remove-bg.short", descriptionKey: "studio.mode.remove-bg.description", controls: ["source", "image-edit-action", "prompt"], templates: imageEditTemplates },
  upscale: { label: "超分", labelKey: "studio.mode.upscale.short", descriptionKey: "studio.mode.upscale.description", controls: ["source", "super-resolution-action", "prompt"], templates: superTemplates },
  background: { label: "换背景", labelKey: "studio.mode.background.short", descriptionKey: "studio.mode.background.description", controls: ["source", "prompt"], templates: imageEditTemplates.filter((item) => item.id === "replace-background") },
  batch: { label: "批量一致性", labelKey: "studio.mode.batch.short", descriptionKey: "studio.mode.batch.description", controls: ["source", "consistency", "aspect", "count", "resolution", "prompt"], templates: batchTemplates },
};
