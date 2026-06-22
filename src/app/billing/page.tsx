import { Ticket, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { addCredits } from "@/lib/storage/local-session";
import { useSessionUser } from "@/lib/storage/session-hooks";

const plans = [
  { name: "轻量包", price: "¥19", credits: 100, desc: "适合少量试用和头像创作" },
  { name: "创作者包", price: "¥99", credits: 800, desc: "适合日常商品图和海报创作" },
  { name: "工作室包", price: "¥299", credits: 3000, desc: "适合批量素材和团队创作" },
];

export function BillingPage() {
  const { user } = useSessionUser();
  const [credits, setCredits] = useState(() => user?.credits || 0);

  useEffect(() => setCredits(user?.credits || 0), [user]);

  async function redeem() {
    try {
      const next = await addCredits(100);
      setCredits(next.credits);
      toast.success("兑换成功，积分已到账");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "兑换失败");
    }
  }
  return (
    <div className="space-y-5">
      <section className="rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#2d6f82]">积分中心</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-[-0.055em] text-[#142536]">充值和兑换</h1>
        <p className="mt-3 text-[#294258]/62">{user ? `当前余额：${credits} 积分。` : "登录后可查看余额、使用兑换码和购买积分包。"}</p>
        {user ? (
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#142536] px-6 py-3 text-white" onClick={redeem} type="button"><Ticket size={18} /> 兑换码兑换</button>
        ) : (
          <Link to="/login" className="mt-5 inline-flex rounded-full bg-[#142536] px-6 py-3 text-white">先登录</Link>
        )}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-[30px] border border-[#1d3346]/10 bg-white/74 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#425d72]/10">
            <Wallet className="text-[#2d6f82]" />
            <p className="mt-5 text-[#294258]/54">{plan.name}</p>
            <h2 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-[#142536]">{plan.price}</h2>
            <p className="mt-2 font-semibold text-[#2d6f82]">{plan.credits} 积分</p>
            <p className="mt-3 text-sm text-[#294258]/58">{plan.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
