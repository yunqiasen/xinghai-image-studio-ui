import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";
import {
  fetchRegistrationPolicy,
  isEmailAllowedByPolicy,
  registerLocalUser,
  type RegistrationPolicy,
} from "@/lib/storage/local-session";

export function RegisterPage() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [policy, setPolicy] = useState<RegistrationPolicy | null>(null);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policyError, setPolicyError] = useState("");
  const [policyReloadKey, setPolicyReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setPolicyLoading(true);
    setPolicyError("");
    fetchRegistrationPolicy()
      .then((nextPolicy) => {
        if (active) setPolicy(nextPolicy);
      })
      .catch((error) => {
        if (!active) return;
        setPolicy(null);
        setPolicyError(error instanceof Error ? error.message : t("auth.register.policyFailed"));
      })
      .finally(() => {
        if (active) setPolicyLoading(false);
      });
    return () => {
      active = false;
    };
  }, [policyReloadKey, t]);

  const allowedDomainText = policy?.allowedEmailDomains.map((domain) => `@${domain}`).join(locale === "en-US" ? ", " : "、") || "";
  const registrationUnavailable = policyLoading || Boolean(policyError) || !policy?.enabled;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!policy) {
      toast.error(policyError || t("auth.register.policyNotReady"));
      return;
    }
    if (!policy.enabled) {
      toast.error(t("auth.register.closedShort"));
      return;
    }
    if (!isEmailAllowedByPolicy(email, policy)) {
      toast.error(t("auth.register.emailOnly", { domains: allowedDomainText }));
      return;
    }
    if (policy.phoneRequired && !phone.trim()) {
      toast.error(t("auth.register.enterPhone"));
      return;
    }
    if (policy.smsRequired && !smsCode.trim()) {
      toast.error(t("auth.register.enterSms"));
      return;
    }
    setSubmitting(true);
    try {
      await registerLocalUser({
        name,
        email,
        password,
        phone: policy.phoneRequired ? phone : undefined,
        smsCode: policy.smsRequired ? smsCode : undefined,
        redeemCode,
      });
      toast.success(t("auth.register.success"));
      navigate("/studio");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.register.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_440px]">
      <section className="hidden rounded-[36px] bg-[linear-gradient(135deg,#123044,#2d6f82)] p-8 text-white shadow-2xl shadow-[#425d72]/16 lg:grid">
        <div className="self-end">
          <p className="text-sm uppercase tracking-[0.22em] text-white/55">Start creating</p>
          <h2 className="mt-4 text-5xl font-semibold leading-none tracking-[-0.05em]">{t("auth.register.hero")}</h2>
          <p className="mt-4 max-w-sm text-white/68">{t("auth.register.heroHelp")}</p>
        </div>
      </section>
      <form onSubmit={submit} className="rounded-[32px] border border-[#1d3346]/10 bg-white/78 p-8 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#142536]">{t("common.register")}</h1>
        <p className="mt-2 text-sm text-[#294258]/58">{t("auth.register.help")}</p>
        {policyLoading ? (
          <div className="mt-5 rounded-2xl bg-[#2d6f82]/8 px-4 py-3 text-sm text-[#294258]/65">{t("auth.register.loadingPolicy")}</div>
        ) : policyError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{t("auth.register.policyFailed")}: {policyError}</p>
            <button className="mt-2 font-semibold underline underline-offset-4" onClick={() => setPolicyReloadKey((value) => value + 1)} type="button">{t("auth.register.reload")}</button>
          </div>
        ) : !policy?.enabled ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("auth.register.closed")}</div>
        ) : allowedDomainText ? (
          <div className="mt-5 rounded-2xl bg-[#2d6f82]/8 px-4 py-3 text-sm text-[#294258]/68">{t("auth.register.allowed", { domains: allowedDomainText })}</div>
        ) : null}
        <input className="mt-6 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder={t("auth.name")} required value={name} onChange={(event) => setName(event.target.value)} />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder={allowedDomainText ? t("auth.emailAllowed", { domains: allowedDomainText }) : t("auth.email")} required value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} minLength={6} placeholder={t("auth.passwordMin")} required value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        {policy?.phoneRequired ? (
          <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder={t("auth.phone")} required value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" />
        ) : null}
        {policy?.smsRequired ? (
          <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder={t("auth.sms")} required value={smsCode} onChange={(event) => setSmsCode(event.target.value)} inputMode="numeric" />
        ) : null}
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder={t("auth.redeemOptional")} value={redeemCode} onChange={(event) => setRedeemCode(event.target.value)} />
        <button className="mt-5 w-full rounded-full bg-[#142536] px-5 py-3 text-white shadow-xl shadow-[#142536]/16 disabled:cursor-not-allowed disabled:bg-[#142536]/35 disabled:shadow-none" disabled={registrationUnavailable || submitting} type="submit">
          {policyLoading ? t("auth.register.loading") : policyError ? t("auth.register.policyFailed") : !policy?.enabled ? t("auth.register.closedShort") : submitting ? t("auth.register.creating") : t("auth.register.create")}
        </button>
        <p className="mt-5 text-center text-sm text-[#294258]/58">{t("auth.register.haveAccount")}<Link to="/login" className="font-semibold text-[#2d6f82]">{t("auth.register.goLogin")}</Link></p>
      </form>
    </div>
  );
}
