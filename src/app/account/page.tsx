import { BadgeCheck, Mail, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useSessionUser } from "@/lib/storage/session-hooks";

export function AccountPage() {
  const { user } = useSessionUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 text-center shadow-sm">
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#142536]">登录后查看账户</h1>
        <p className="mt-3 text-[#294258]/62">账户、积分和作品记录会统一保存在你的个人空间里。</p>
        <Link to="/login" className="mt-6 inline-flex rounded-full bg-[#142536] px-6 py-3 text-white">去登录</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 shadow-sm">
        <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-[#142536] text-white"><UserCircle size={36} /></div>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.055em] text-[#142536]">我的账户</h1>
        <p className="mt-3 text-[#294258]/62">管理账户资料、积分余额和创作记录。</p>
      </section>
      <section className="rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 shadow-sm">
        <div className="grid gap-4 text-[#294258]/72">
          <p className="inline-flex items-center gap-3"><BadgeCheck className="text-[#2d6f82]" /> 用户名：{user.name}</p>
          <p className="inline-flex items-center gap-3"><Mail className="text-[#2d6f82]" /> 邮箱：{user.email}</p>
          <p className="text-4xl font-semibold tracking-[-0.05em] text-[#142536]">{user.unlimitedCredits ? "无限配额" : `${user.credits} 积分`}</p>
          {user.role === "admin" && <p className="inline-flex w-fit rounded-full bg-[#2d6f82]/10 px-3 py-1 text-sm font-semibold text-[#2d6f82]">管理员账号</p>}
        </div>
      </section>
    </div>
  );
}
