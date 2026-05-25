"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

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
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getRole());
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    alert("ログアウトしました");
    router.push("/login");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1a3a6b" }}>
      <Toolbar>
        <Typography sx={{ mr: 3, flexGrow: 1 }} variant="h6">
          保護者面談管理アプリ
        </Typography>
        <div style={{ display: "flex", gap: "24px" }}>
          {role === null && (
            <>
              <Link href="/login">ログイン</Link>
              <Link href="/register">ユーザー登録</Link>
            </>
          )}
          {role === "teacher" && <Link href="/meeting_slots">面談表</Link>}
          {role === "parent" && (
            <>
              <Link href="/my_schedule">面談の決定日</Link>
              <Link href="/family_unavailabilities">時間不可の</Link>
            </>
          )}
        </div>
        {role !== null && (
          <Button color="inherit" onClick={handleLogout}>
            ログアウト
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
