import { GalleryHorizontalEnd, Image, LogOut, Sparkles, UserCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { GenerationProvider } from "@/components/commercial/generation-provider";
import { ThemeSelector } from "@/components/theme-selector";
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
    <div className="commercial-shell min-h-screen selection:bg-[#28465f]/12">
      <div className="commercial-ambient pointer-events-none fixed inset-0 -z-10" />
      <header className="commercial-header sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className={`mx-auto flex h-18 items-center justify-between gap-3 px-4 ${studioRoute ? "max-w-[1240px]" : "max-w-[1500px]"}`}>
          <NavLink to="/" className="commercial-brand flex shrink-0 items-center gap-3 font-semibold tracking-tight">
            <span className="commercial-logo grid h-11 w-11 place-items-center overflow-hidden rounded-[18px] text-lg shadow-[0_18px_40px_rgba(20,37,54,.22)]">
              {siteInfo.logoUrl ? <img alt="" className="h-full w-full object-cover" src={siteInfo.logoUrl} /> : "星"}
            </span>
            <span className="hidden text-lg sm:inline">{siteInfo.name}</span>
          </NavLink>
          <nav className="commercial-nav hidden items-center gap-1 rounded-full border p-1 shadow-sm md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `commercial-nav-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${isActive ? "is-active shadow-lg" : ""}`}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSelector />
            {user ? (
              <div className="commercial-user-pill flex items-center gap-2 rounded-full border px-2 py-2 text-sm shadow-sm sm:px-4">
                <span className="hidden font-semibold sm:inline">{user.unlimitedCredits ? "无限配额" : `${user.credits} 积分`}</span>
                {!user.unlimitedCredits && <NavLink to="/billing" className="commercial-credit-button rounded-full px-3 py-1.5 font-semibold">充值</NavLink>}
                <button className="commercial-icon-button rounded-full p-1.5" onClick={logout} type="button" title="退出登录">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm sm:gap-2">
                <NavLink to="/login" className="commercial-login-link rounded-full px-3 py-2 sm:px-4">登录</NavLink>
                <NavLink to="/register" className="commercial-register-link rounded-full px-3 py-2 font-semibold shadow-lg sm:px-4">注册</NavLink>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className={`commercial-main ${studioRoute ? "w-full" : "mx-auto max-w-[1500px] px-4 py-6"}`}>
        <GenerationProvider userId={user?.id}>
          <Outlet />
        </GenerationProvider>
      </main>
      {!studioRoute && (siteInfo.footer || siteInfo.contactEmail || siteInfo.docsUrl) ? (
        <footer className="commercial-footer mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 pb-7 text-xs">
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
