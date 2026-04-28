"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <div style={{ display: "flex", gap: "24px", flexGrow: 1 }}>
          <Link href="/login">ログイン</Link>
          <Link href="/register">ユーザー登録</Link>
          <Link href="/meeting_slots">面談表</Link>
          <Link href="/family_unavailabilities">時間不可の</Link>
        </div>
        <Button color="inherit" onClick={handleLogout}>
          ログアウト
        </Button>
      </Toolbar>
    </AppBar>
  );
}
