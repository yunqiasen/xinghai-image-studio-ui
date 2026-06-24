import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { registerLocalUser } from "@/lib/storage/local-session";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [redeemCode, setRedeemCode] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await registerLocalUser({ name, email, password, phone, smsCode, redeemCode });
      toast.success("注册成功，积分已发放");
      navigate("/studio");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "注册失败");
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
        <input className="mt-6 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder="昵称" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder="邮箱" value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder="密码，至少 6 位" value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder="手机号，可选；后台开启手机注册时必填" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder="短信验证码，可选；后台开启短信校验时必填" value={smsCode} onChange={(event) => setSmsCode(event.target.value)} />
        <input className="mt-3 w-full rounded-2xl border border-[#1d3346]/10 bg-[#f8fbfc] p-3 outline-none focus:border-[#2d6f82]/35" placeholder="兑换码，可选" value={redeemCode} onChange={(event) => setRedeemCode(event.target.value)} />
        <button className="mt-5 w-full rounded-full bg-[#142536] px-5 py-3 text-white shadow-xl shadow-[#142536]/16" type="submit">创建账号</button>
        <p className="mt-5 text-center text-sm text-[#294258]/58">已有账号？<Link to="/login" className="font-semibold text-[#2d6f82]">去登录</Link></p>
      </form>
    </div>
  );
}
