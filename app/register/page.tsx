"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

export default function RegisterPage() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/v1/users", {
      method: "post",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        user: { email_address: emailAddress, password: password, role: role },
      }),
    });

    const data = await res.json();
    console.log(data);
    if (res.ok) {
      setMessage("登録が完了した");
      router.push("/meeting_slots");
    } else {
      setMessage(data.errors.join(","));
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
      <h1>ユーザー登録</h1>
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
      <FormControl fullWidth>
        <InputLabel>役割選択</InputLabel>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <MenuItem value="">未選択</MenuItem>
          <MenuItem value="teacher">先生</MenuItem>
          <MenuItem value="parent">保護者</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleSubmit}>
          登録
        </Button>
        {message && <p>{message}</p>}
      </FormControl>
    </Box>
  );
}
