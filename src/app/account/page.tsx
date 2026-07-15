import { BadgeCheck, Mail, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "@/components/language-provider";
import { useSessionUser } from "@/lib/storage/session-hooks";

export function AccountPage() {
  const { t } = useLanguage();
  const { user } = useSessionUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 text-center shadow-sm">
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#142536]">{t("account.loginTitle")}</h1>
        <p className="mt-3 text-[#294258]/62">{t("account.loginHelp")}</p>
        <Link to="/login" className="mt-6 inline-flex rounded-full bg-[#142536] px-6 py-3 text-white">{t("studio.goLogin")}</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 shadow-sm">
        <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-[#142536] text-white"><UserCircle size={36} /></div>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.055em] text-[#142536]">{t("account.title")}</h1>
        <p className="mt-3 text-[#294258]/62">{t("account.description")}</p>
      </section>
      <section className="rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 shadow-sm">
        <div className="grid gap-4 text-[#294258]/72">
          <p className="inline-flex items-center gap-3"><BadgeCheck className="text-[#2d6f82]" /> {t("account.username", { value: user.name })}</p>
          <p className="inline-flex items-center gap-3"><Mail className="text-[#2d6f82]" /> {t("account.email", { value: user.email })}</p>
          <p className="text-4xl font-semibold tracking-[-0.05em] text-[#142536]">{user.unlimitedCredits ? t("common.unlimited") : `${user.credits} ${t("common.credits")}`}</p>
          {user.role === "admin" && <p className="inline-flex w-fit rounded-full bg-[#2d6f82]/10 px-3 py-1 text-sm font-semibold text-[#2d6f82]">{t("account.admin")}</p>}
        </div>
      </section>
    </div>
  );
}
