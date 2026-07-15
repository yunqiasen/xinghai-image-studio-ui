import { Languages } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { languageOptions, type LanguageMode } from "@/components/language-modes";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage();
  const selected = languageOptions.find((option) => option.value === locale) ?? languageOptions[0];

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as LanguageMode)}>
      <SelectTrigger
        aria-label={t("common.language")}
        className={cn("preference-select-trigger language-select-trigger", compact && "preference-select-compact", className)}
        data-language-selector="true"
      >
        <span className="preference-select-value">
          <Languages aria-hidden="true" size={15} />
          <span className="preference-select-label">{selected.label}</span>
          <span className="preference-select-short">{selected.shortLabel}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="preference-select-content" align="end">
        {languageOptions.map((option) => (
          <SelectItem className="preference-select-item" key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
