import { GalleryHorizontalEnd, Image, LogOut, Sparkles, UserCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { DEFAULT_SITE_INFO, fetchSiteInfo } from "@/lib/site-info";
import { logoutLocalUser } from "@/lib/storage/local-session";
import { useSessionUser } from "@/lib/storage/session-hooks";

const nav = [
  { to: "/", label: "首页", icon: Sparkles },
  { to: "/studio", label: "创作", icon: Image },
  { to: "/gallery", label: "作品", icon: GalleryHorizontalEnd },
  { to: "/billing", label: "积分", icon: Wallet },
  { to: "/account", label: "我的", icon: UserCircle },
];

export function CommercialShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSessionUser();
  const studioRoute = location.pathname === "/studio";
  const [siteInfo, setSiteInfo] = useState(DEFAULT_SITE_INFO);

  useEffect(() => {
    let active = true;
    fetchSiteInfo().then((value) => {
      if (active) {
        setSiteInfo(value);
        document.title = value.name;
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function logout() {
    try {
      await logoutLocalUser();
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "退出失败");
    }
  }

  return (
    <div className="min-h-screen bg-[#eef3f7] text-[#17202a] selection:bg-[#28465f]/12">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(126,171,196,.32),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(220,231,236,.9),transparent_28%),linear-gradient(180deg,#f8fbfc,#e8eef3)]" />
      <header className="sticky top-0 z-40 border-b border-[#1d3346]/10 bg-[#f8fbfc]/86 backdrop-blur-xl">
        <div className={`mx-auto flex h-18 items-center justify-between px-4 ${studioRoute ? "max-w-[1240px]" : "max-w-[1500px]"}`}>
          <NavLink to="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-[18px] bg-[#142536] text-lg text-white shadow-[0_18px_40px_rgba(20,37,54,.22)]">
              {siteInfo.logoUrl ? <img alt="" className="h-full w-full object-cover" src={siteInfo.logoUrl} /> : "星"}
            </span>
            <span className="hidden text-lg sm:inline">{siteInfo.name}</span>
          </NavLink>
          <nav className="hidden items-center gap-1 rounded-full border border-[#1d3346]/10 bg-white/72 p-1 shadow-sm md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${isActive ? "bg-[#142536] text-white shadow-lg" : "text-[#1d3346]/70 hover:bg-[#1d3346]/6 hover:text-[#142536]"}`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-[#1d3346]/10 bg-white/80 px-2 py-2 text-sm shadow-sm sm:px-4">
              <span className="hidden font-semibold sm:inline">{user.unlimitedCredits ? "无限配额" : `${user.credits} 积分`}</span>
              {!user.unlimitedCredits && <NavLink to="/billing" className="rounded-full bg-[#2d6f82] px-3 py-1.5 font-semibold text-white">充值</NavLink>}
              <button className="rounded-full p-1.5 text-[#1d3346]/58 hover:bg-[#1d3346]/8" onClick={logout} type="button" title="退出登录">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <NavLink to="/login" className="rounded-full px-4 py-2 text-[#1d3346]/72 hover:bg-white/72">登录</NavLink>
              <NavLink to="/register" className="rounded-full bg-[#142536] px-4 py-2 font-semibold text-white shadow-lg">注册</NavLink>
            </div>
          )}
        </div>
      </header>
      <main className={studioRoute ? "w-full" : "mx-auto max-w-[1500px] px-4 py-6"}>
        <Outlet />
      </main>
      {!studioRoute && (siteInfo.footer || siteInfo.contactEmail || siteInfo.docsUrl) ? (
        <footer className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 pb-7 text-xs text-[#294258]/52">
          <span>{siteInfo.footer || siteInfo.description}</span>
          <span className="flex items-center gap-4">
            {siteInfo.contactEmail ? <a href={`mailto:${siteInfo.contactEmail}`}>联系邮箱</a> : null}
            {siteInfo.docsUrl ? <a href={siteInfo.docsUrl} rel="noreferrer" target="_blank">使用文档</a> : null}
          </span>
        </footer>
      ) : null}
    </div>
  );
}
