"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "blue",
      }}
    >
      <div style={{ display: "flex", gap: "24px" }}>
        <Link href="/login">ログイン</Link>
        <Link href="/register">ユーザー登録</Link>
        <Link href="/meeting_slots">面談表</Link>
        <Link href="/family_unavailabilities">時間不可の</Link>
      </div>
      <button onClick={handleLogout}>ログアウト</button>
    </nav>
  );
}
