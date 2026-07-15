import { ArrowRight, Brush, GalleryHorizontalEnd, Images, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "@/components/language-provider";

const featureDefinitions = [
  { icon: WandSparkles, title: "landing.feature.text.title", text: "landing.feature.text.body" },
  { icon: Images, title: "landing.feature.image.title", text: "landing.feature.image.body" },
  { icon: Brush, title: "landing.feature.edit.title", text: "landing.feature.edit.body" },
  { icon: GalleryHorizontalEnd, title: "landing.feature.gallery.title", text: "landing.feature.gallery.body" },
] as const;

export function LandingPage() {
  const { t } = useLanguage();
  const features = featureDefinitions.map((item) => ({ ...item, title: t(item.title), text: t(item.text) }));
  return (
    <div className="space-y-8">
      <section className="grid min-h-[calc(100vh-150px)] items-center gap-10 lg:grid-cols-[1fr_560px]">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-[#1d3346]/10 bg-white/76 px-4 py-2 text-sm font-semibold tracking-[0.18em] text-[#2d6f82] shadow-sm">
            AI IMAGE WORKSPACE
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-[#142536] md:text-7xl">
            {t("landing.title")}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#294258]/68">
            {t("landing.description")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/studio" className="inline-flex items-center gap-2 rounded-full bg-[#142536] px-6 py-3 text-white shadow-xl shadow-[#142536]/18">
              {t("landing.start")} <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="rounded-full border border-[#1d3346]/10 bg-white/78 px-6 py-3 shadow-sm">{t("landing.registerBonus")}</Link>
          </div>
        </div>
        <div className="relative rounded-[40px] border border-[#1d3346]/10 bg-white/70 p-4 shadow-2xl shadow-[#425d72]/12">
          <div className="absolute -left-8 top-14 hidden rounded-3xl bg-[#142536] px-5 py-4 text-white shadow-2xl lg:block">
            <p className="text-xs text-white/55">Balance</p>
            <p className="text-2xl font-semibold">120</p>
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_20%_18%,#b7d7e6,transparent_30%),radial-gradient(circle_at_76%_22%,#f1f6f8,transparent_34%),linear-gradient(135deg,#152638,#496678)] p-8 text-white">
            <div className="grid h-full content-between">
              <p className="text-sm uppercase tracking-[0.22em] text-white/58">Creative Suite</p>
              <div>
                <h2 className="text-5xl font-semibold leading-none tracking-[-0.05em]">Image Studio</h2>
                <p className="mt-4 max-w-xs text-white/72">{t("landing.suiteDescription")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {features.map((item) => (
          <article key={item.title} className="rounded-[28px] border border-[#1d3346]/10 bg-white/72 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#425d72]/10">
            <item.icon className="text-[#2d6f82]" />
            <h3 className="mt-5 text-xl font-semibold text-[#142536]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#294258]/62">{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
