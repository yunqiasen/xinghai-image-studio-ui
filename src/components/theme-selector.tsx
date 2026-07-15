import { Moon, Palette, Sun } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { useTheme } from "@/components/theme-provider";
import { themeOptions, type ThemeMode } from "@/components/theme-modes";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const icons = { light: Sun, dark: Moon, colorful: Palette } satisfies Record<ThemeMode, typeof Sun>;
const labelKeys = {
  light: "common.light",
  dark: "common.dark",
  colorful: "common.colorful",
} as const;

export function ThemeSelector({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { themeMode, setThemeMode } = useTheme();
  const { t } = useLanguage();
  const CurrentIcon = icons[themeMode];

  return (
    <Select value={themeMode} onValueChange={(value) => setThemeMode(value as ThemeMode)}>
      <SelectTrigger
        aria-label={t("common.appearance")}
        className={cn("preference-select-trigger theme-select-trigger", compact && "preference-select-compact", className)}
        data-theme-selector="true"
      >
        <span className="preference-select-value">
          <CurrentIcon aria-hidden="true" size={15} />
          <span className="preference-select-label">{t(labelKeys[themeMode])}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="preference-select-content" align="end">
        {themeOptions.map((option) => {
          const Icon = icons[option.value];
          return (
            <SelectItem className="preference-select-item" key={option.value} value={option.value}>
              <span className="inline-flex items-center gap-2"><Icon aria-hidden="true" size={14} />{t(labelKeys[option.value])}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
