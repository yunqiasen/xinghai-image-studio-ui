import { AudioLines, Music2, Radio, Sparkles } from "lucide-react";

import { useLanguage } from "@/components/language-provider";

export function AudioPage() {
  const { t } = useLanguage();
  const capabilities = [
    { icon: Radio, title: t("audio.textToSpeech"), description: t("audio.textToSpeechHelp") },
    { icon: Music2, title: t("audio.textToMusic"), description: t("audio.textToMusicHelp") },
  ];

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-[#1d3346]/10 bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,.16),transparent_34%),radial-gradient(circle_at_92%_12%,rgba(168,85,247,.18),transparent_36%),linear-gradient(145deg,rgba(255,255,255,.9),rgba(244,247,251,.78))] px-6 py-14 shadow-[0_30px_90px_-52px_rgba(23,37,84,.42)] sm:px-10 lg:px-16 lg:py-20">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-violet-300/30" />
      <div className="pointer-events-none absolute -bottom-36 -left-20 h-80 w-80 rounded-full border border-cyan-300/30" />
      <div className="relative mx-auto max-w-5xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-700/12 bg-white/70 px-4 py-2 text-[11px] font-bold tracking-[0.2em] text-cyan-800"><AudioLines size={15} />{t("audio.kicker")}</span>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#142536] sm:text-6xl">{t("audio.title")}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#294258]/68">{t("audio.description")}</p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {capabilities.map((item) => (
            <article key={item.title} className="rounded-[26px] border border-white/70 bg-white/72 p-6 shadow-[0_18px_54px_-34px_rgba(37,51,90,.34)] backdrop-blur-xl">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#cffafe,#ede9fe)] text-[#315f75]"><item.icon size={22} /></span>
              <h2 className="mt-5 text-xl font-semibold text-[#142536]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#294258]/62">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-violet-200/70 bg-violet-50/72 px-4 py-3 text-sm font-semibold text-violet-800"><Sparkles size={16} />{t("audio.comingSoon")}</div>
      </div>
    </div>
  );
}
