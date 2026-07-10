import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  fetchRegistrationPolicy,
  isEmailAllowedByPolicy,
  registerLocalUser,
  type RegistrationPolicy,
} from "@/lib/storage/local-session";

export function RegisterPage() {
  const navigate = useNavigate();
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
        setPolicyError(error instanceof Error ? error.message : "注册规则加载失败");
      })
      .finally(() => {
        if (active) setPolicyLoading(false);
      });
    return () => {
      active = false;
    };
  }, [policyReloadKey]);

  const allowedDomainText = policy?.allowedEmailDomains.map((domain) => `@${domain}`).join("、") || "";
  const registrationUnavailable = policyLoading || Boolean(policyError) || !policy?.enabled;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!policy) {
      toast.error(policyError || "注册规则尚未加载完成");
      return;
    }
    if (!policy.enabled) {
      toast.error("当前暂未开放注册");
      return;
    }
    if (!isEmailAllowedByPolicy(email, policy)) {
      toast.error(`邮箱仅支持 ${allowedDomainText}`);
      return;
    }
    if (policy.phoneRequired && !phone.trim()) {
      toast.error("请输入手机号");
      return;
    }
    if (policy.smsRequired && !smsCode.trim()) {
      toast.error("请输入短信验证码");
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
      toast.success("注册成功，积分已发放");
      navigate("/studio");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "注册失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_440px]">
      <section className="hidden rounded-[36px] bg-[linear-gradient(135deg,#123044,#2d6f82)] p-8 text-white shadow-2xl shadow-[#425d72]/16 lg:grid">
        <div className="self-end">
          <p className="text-sm uppercase tracking-[0.22em] text-white/55">Start creating</p>
          <h2 className="mt-4 text-5xl font-semibold leading-none tracking-[-0.05em]">注册即可领取初始积分。</h2>
          <p className="mt-4 max-w-sm text-white/68">使用兑换码可获得更多积分，适合快速体验文生图、图生图和局部编辑。</p>
        </div>
      </section>
      <form onSubmit={submit} className="rounded-[32px] border border-[#1d3346]/10 bg-white/78 p-8 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#142536]">注册</h1>
        <p className="mt-2 text-sm text-[#294258]/58">创建账号后即可开始创作。</p>
        {policyLoading ? (
          <div className="mt-5 rounded-2xl bg-[#2d6f82]/8 px-4 py-3 text-sm text-[#294258]/65">正在读取注册规则…</div>
        ) : policyError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>注册规则加载失败：{policyError}</p>
            <button className="mt-2 font-semibold underline underline-offset-4" onClick={() => setPolicyReloadKey((value) => value + 1)} type="button">重新加载</button>
          </div>
        ) : !policy?.enabled ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">当前暂未开放注册，请稍后再试。</div>
        ) : allowedDomainText ? (
          <div className="mt-5 rounded-2xl bg-[#2d6f82]/8 px-4 py-3 text-sm text-[#294258]/68">允许注册的邮箱：{allowedDomainText}</div>
        ) : null}
        <input className="mt-6 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder="昵称" required value={name} onChange={(event) => setName(event.target.value)} />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder={allowedDomainText ? `邮箱，仅支持 ${allowedDomainText}` : "邮箱"} required value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} minLength={6} placeholder="密码，至少 6 位" required value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        {policy?.phoneRequired ? (
          <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder="手机号" required value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" />
        ) : null}
        {policy?.smsRequired ? (
          <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" disabled={registrationUnavailable} placeholder="短信验证码" required value={smsCode} onChange={(event) => setSmsCode(event.target.value)} inputMode="numeric" />
        ) : null}
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder="兑换码，可选" value={redeemCode} onChange={(event) => setRedeemCode(event.target.value)} />
        <button className="mt-5 w-full rounded-full bg-[#142536] px-5 py-3 text-white shadow-xl shadow-[#142536]/16 disabled:cursor-not-allowed disabled:bg-[#142536]/35 disabled:shadow-none" disabled={registrationUnavailable || submitting} type="submit">
          {policyLoading ? "正在加载注册规则" : policyError ? "注册规则加载失败" : !policy?.enabled ? "注册已关闭" : submitting ? "正在创建账号" : "创建账号"}
        </button>
        <p className="mt-5 text-center text-sm text-[#294258]/58">已有账号？<Link to="/login" className="font-semibold text-[#2d6f82]">去登录</Link></p>
      </form>
    </div>
  );
}
