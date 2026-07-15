import {
  GalleryHorizontalEnd,
  Image,
  Sparkles,
  UserCircle,
  Wallet,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import { createTranslator, type LanguageMode, type TranslationKey } from "@/components/language-modes";

export type CommercialNavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const navigationDefinitions: Array<Omit<CommercialNavigationItem, "label"> & { labelKey: TranslationKey }> = [
  { to: "/", labelKey: "nav.home", icon: Sparkles },
  { to: "/studio", labelKey: "nav.create", icon: Image },
  { to: "/gallery", labelKey: "nav.works", icon: GalleryHorizontalEnd },
  { to: "/soul-gallery", labelKey: "nav.soulGallery", icon: WandSparkles },
  { to: "/billing", labelKey: "nav.credits", icon: Wallet },
  { to: "/account", labelKey: "nav.account", icon: UserCircle },
];

export function getCommercialNavigation(locale: LanguageMode): CommercialNavigationItem[] {
  const t = createTranslator(locale);
  return navigationDefinitions.map(({ labelKey, ...item }) => ({ ...item, label: t(labelKey) }));
}
