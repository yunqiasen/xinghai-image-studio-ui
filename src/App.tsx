import { Navigate, Route, Routes } from "react-router-dom";
import { AccountPage } from "@/app/account/page";
import { LoginPage } from "@/app/auth/login/page";
import { RegisterPage } from "@/app/auth/register/page";
import { BillingPage } from "@/app/billing/page";
import { GalleryPage } from "@/app/gallery/page";
import { LandingPage } from "@/app/landing/page";
import { StudioPage } from "@/app/studio/page";
import { CommercialShell } from "@/components/commercial/app-shell";

export default function App() {
  return (
      <Routes>
        <Route element={<CommercialShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
