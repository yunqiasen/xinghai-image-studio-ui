import { Moon, Palette, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { themeOptions, type ThemeMode } from "@/components/theme-modes";
import { cn } from "@/lib/utils";

const icons = { light: Sun, dark: Moon, colorful: Palette } satisfies Record<ThemeMode, typeof Sun>;

export function ThemeSelector({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { themeMode, setThemeMode } = useTheme();
  return (
    <div
      aria-label="界面主题"
      className={cn("theme-selector", compact && "theme-selector-compact", className)}
      role="radiogroup"
    >
      {themeOptions.map((option) => {
        const Icon = icons[option.value];
        const selected = option.value === themeMode;
        return (
          <button
            aria-checked={selected}
            aria-label={`${option.label}主题`}
            className="theme-selector-option"
            data-selected={selected || undefined}
            key={option.value}
            onClick={() => setThemeMode(option.value)}
            role="radio"
            title={`${option.label}主题`}
            type="button"
          >
            <Icon size={compact ? 13 : 14} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
