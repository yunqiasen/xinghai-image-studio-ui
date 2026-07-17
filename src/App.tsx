import { Navigate, Route, Routes } from "react-router-dom";
import { AccountPage } from "@/app/account/page";
import { AudioPage } from "@/app/audio/page";
import { LoginPage } from "@/app/auth/login/page";
import { RegisterPage } from "@/app/auth/register/page";
import { BillingPage } from "@/app/billing/page";
import { GalleryPage } from "@/app/gallery/page";
import { LandingPage } from "@/app/landing/page";
import { SoulGalleryPage } from "@/app/soul-gallery/page";
import { StudioPage } from "@/app/studio/page";
import { VideoPage } from "@/app/video/page";
import { CommercialShell } from "@/components/commercial/app-shell";

export default function App() {
  return (
      <Routes>
        <Route element={<CommercialShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/audio" element={<AudioPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/soul-gallery" element={<SoulGalleryPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
