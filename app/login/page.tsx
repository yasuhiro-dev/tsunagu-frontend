"use client";

import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

type RedirectMap = {
  teacher: string;
  parent: string;
  admin: string;
};

type LoginResponse = {
  token: string;
  role: keyof RedirectMap;
};

export default function LoginPage() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: emailAddress, password }),
    });

    if (res.ok) {
      const data: LoginResponse = await res.json();
      localStorage.setItem("token", data.token);
      const redirectMap: RedirectMap = {
        teacher: "/meeting_slots",
        parent: "/family_unavailabilities",
        admin: "/admin",
      };
      window.location.href = redirectMap[data.role] ?? "/";
    } else {
      alert("メールアドレスまたはパスワードが違います");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <h1>ログイン</h1>
      <TextField
        type="email"
        label="メールアドレス"
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
      />
      <TextField
        type="password"
        label="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" onClick={handleSubmit} fullWidth>
        ログイン
      </Button>
    </Box>
  );
}
