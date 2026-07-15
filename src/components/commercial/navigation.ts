import {
  GalleryHorizontalEnd,
  Image,
  Sparkles,
  UserCircle,
  Wallet,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export type CommercialNavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const commercialNavigation: CommercialNavigationItem[] = [
  { to: "/", label: "首页", icon: Sparkles },
  { to: "/studio", label: "创作", icon: Image },
  { to: "/gallery", label: "作品", icon: GalleryHorizontalEnd },
  { to: "/soul-gallery", label: "灵魂画廊", icon: WandSparkles },
  { to: "/billing", label: "积分", icon: Wallet },
  { to: "/account", label: "我的", icon: UserCircle },
];
