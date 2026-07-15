import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";
import { loginLocalUser } from "@/lib/storage/local-session";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await loginLocalUser({ email, password });
      toast.success(t("auth.login.success"));
      navigate("/studio");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.login.failed"));
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_440px]">
      <section className="hidden rounded-[36px] bg-[linear-gradient(135deg,#152638,#496678)] p-8 text-white shadow-2xl shadow-[#425d72]/16 lg:grid">
        <div className="self-end">
          <p className="text-sm uppercase tracking-[0.22em] text-white/55">Welcome back</p>
          <h2 className="mt-4 text-5xl font-semibold leading-none tracking-[-0.05em]">{t("auth.login.hero")}</h2>
          <p className="mt-4 max-w-sm text-white/68">{t("auth.login.heroHelp")}</p>
        </div>
      </section>
      <form onSubmit={submit} className="rounded-[32px] border border-[#1d3346]/10 bg-white/78 p-8 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#142536]">{t("common.login")}</h1>
        <p className="mt-2 text-sm text-[#294258]/58">{t("auth.login.help")}</p>
        <input className="mt-6 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder={t("auth.email")} value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder={t("auth.password")} value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        <button className="mt-5 w-full rounded-full bg-[#142536] px-5 py-3 text-white shadow-xl shadow-[#142536]/16" type="submit">{t("common.login")}</button>
        <p className="mt-5 text-center text-sm text-[#294258]/58">{t("auth.login.noAccount")}<Link to="/register" className="font-semibold text-[#2d6f82]">{t("auth.login.registerNow")}</Link></p>
      </form>
    </div>
  );
}
