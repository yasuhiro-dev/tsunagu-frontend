import type { Metadata } from "next";
import LandingPage from "./components/LandingPage";

export const metadata: Metadata = {
  title: "Tsunagu | 保護者が学校へ行く日を、1日にまとめます",
  description:
    "兄弟も支援学級も保護者の都合も。条件を満たす面談表を、先生の代わりに自動で組む、学校向け面談日程調整システムです。",
  openGraph: {
    title: "Tsunagu | 保護者が学校へ行く日を、1日にまとめます",
    description:
      "兄弟も支援学級も保護者の都合も。条件を満たす面談表を、先生の代わりに自動で組む、学校向け面談日程調整システムです。",
    url: "https://tsunagu-app.com",
    siteName: "Tsunagu",
    images: [
      { url: "https://tsunagu-app.com/ogp.png", width: 1200, height: 630 },
    ],
    locale: "ja_JP",
    type: "website",
  },
  // x(旧twittter用)
  twitter: {
    card: "summary_large_image",
    title: "Tsunagu | 保護者が学校へ行く日を、1日にまとめます",
    description:
      "兄弟も支援学級も保護者の都合も。条件を満たす面談表を、先生の代わりに自動で組む、学校向け面談日程調整システムです。",
    images: ["https://tsunagu-app.com/ogp.png"],
  },
};

export default function Page() {
  return <LandingPage />;
}
