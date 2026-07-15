import { Ticket, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";
import { redeemCredits } from "@/lib/storage/local-session";
import { useSessionUser } from "@/lib/storage/session-hooks";

const planDefinitions = [
  { key: "light", price: "¥19", credits: 100 },
  { key: "creator", price: "¥99", credits: 800 },
  { key: "studio", price: "¥299", credits: 3000 },
] as const;

export function BillingPage() {
  const { t } = useLanguage();
  const { user } = useSessionUser();
  const [credits, setCredits] = useState(() => user?.credits || 0);
  const [redeemCode, setRedeemCode] = useState("");

  useEffect(() => setCredits(user?.credits || 0), [user]);
  const balanceText = user?.unlimitedCredits ? t("billing.balanceUnlimited") : user ? t("billing.balance", { count: credits }) : t("billing.loginHelp");
  const plans = planDefinitions.map((plan) => ({ ...plan, name: t(`billing.plan.${plan.key}.name`), desc: t(`billing.plan.${plan.key}.desc`) }));

  async function redeem() {
    const code = redeemCode.trim();
    if (!code) {
      toast.error(t("billing.enterCode"));
      return;
    }
    try {
      const next = await redeemCredits(code);
      setCredits(next.credits);
      setRedeemCode("");
      toast.success(t("billing.success"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("billing.failed"));
    }
  }
  return (
    <div className="space-y-5">
      <section className="rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#2d6f82]">{t("billing.kicker")}</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-[-0.055em] text-[#142536]">{t("billing.title")}</h1>
        <p className="mt-3 text-[#294258]/62">{balanceText}</p>
        {user && !user.unlimitedCredits ? (
          <div className="mt-5 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-full border border-[#1d3346]/10 bg-white px-5 py-3 outline-none focus:border-[#2d6f82]/35"
              placeholder={t("billing.codePlaceholder")}
              value={redeemCode}
              onChange={(event) => setRedeemCode(event.target.value)}
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#142536] px-6 py-3 text-white" onClick={redeem} type="button"><Ticket size={18} /> {t("billing.redeem")}</button>
          </div>
        ) : user?.unlimitedCredits ? (
          <div className="mt-5 inline-flex rounded-full bg-[#2d6f82]/10 px-5 py-3 font-semibold text-[#2d6f82]">{t("billing.noCharge")}</div>
        ) : (
          <Link to="/login" className="mt-5 inline-flex rounded-full bg-[#142536] px-6 py-3 text-white">{t("billing.loginFirst")}</Link>
        )}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-[30px] border border-[#1d3346]/10 bg-white/74 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#425d72]/10">
            <Wallet className="text-[#2d6f82]" />
            <p className="mt-5 text-[#294258]/54">{plan.name}</p>
            <h2 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-[#142536]">{plan.price}</h2>
            <p className="mt-2 font-semibold text-[#2d6f82]">{plan.credits} {t("common.credits")}</p>
            <p className="mt-3 text-sm text-[#294258]/58">{plan.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
