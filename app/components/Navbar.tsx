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
    <nav>
      <Link href="/login">ログイン</Link>
      <Link href="/register">ユーザー登録</Link>
      <Link href="/meeting_slots">面談表</Link>
      <Link href="/family_unavailabilities">時間不可の</Link>
      <button onClick={handleLogout}>ログアウト</button>
    </nav>
  );
}
