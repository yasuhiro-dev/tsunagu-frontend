"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

const getRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.role;
  } catch {
    return null;
  }
};

export default function Navbar() {
  const router = useRouter();

  const [role] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return getRole();
  });

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
          {role === "teacher" && <Link href="/meeting_slots">面談表</Link>}
          {role === "parent" && (
            <>
              <Link href="/my_schedule">面談の決定日</Link>
              <Link href="/family_unavailabilities">時間不可の</Link>
            </>
          )}
        </div>
        <Button color="inherit" onClick={handleLogout}>
          ログアウト
        </Button>
      </Toolbar>
    </AppBar>
  );
}
