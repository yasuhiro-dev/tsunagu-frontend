"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function LoginPage() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: emailAddress, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      if (data.role === "teacher") {
        router.push("/meeting_slots");
      } else {
        router.push("/family_unavailabilities");
      }
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
