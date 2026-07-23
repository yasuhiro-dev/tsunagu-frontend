"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "next/link";

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
  const [apiError, setApiError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (
    loginEmail: string = emailAddress,
    loginPassword: string = password,
  ) => {
    setApiError("");
    if (!loginEmail) {
      setEmailError("メールアドレスを入力してください");
      return;
    } else if (!loginEmail.includes("@")) {
      setEmailError("正しいメールアドレスの形式で入力してください");
      return;
    } else {
      setEmailError("");
    }
    if (!loginPassword) {
      setPasswordError("パスワードを入力してください");
      return;
    } else {
      setPasswordError("");
    }
    setIsLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: loginEmail,
        password: loginPassword,
      }),
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
      setApiError("メールアドレスまたはパスワードが違います");
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundImage: "url('/tsunagu.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card sx={{ width: 400, p: 2, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ color: "#1a3a5c" }}>
              Tsunagu
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{ textAlign: "center", mb: 2, color: "#1a3a5c" }}
          >
            Tsunagu にログイン
          </Typography>
          {apiError && <Alert severity="error">{apiError}</Alert>}
          <TextField
            type="email"
            label="メールアドレス"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            type={showPassword ? "text" : "password"}
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            fullWidth
            sx={{ mb: 1 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ textAlign: "right", mb: 1 }}>
            <Link href="/password_reset">パスワードをお忘れの方はこちら</Link>
          </Box>
          <Button
            variant="contained"
            onClick={() => handleSubmit()}
            fullWidth
            disabled={isLoading}
            sx={{ mb: 1 }}
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit("yamada@example.com", "password")}
            fullWidth
            disabled={isLoading}
            sx={{ mb: 1 }}
          >
            {isLoading ? "ログイン中..." : "デモログイン（保護者）"}
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit("saito@example.com", "password")}
            fullWidth
            disabled={isLoading}
            sx={{ mb: 1 }}
          >
            {isLoading ? "ログイン中..." : "デモログイン(教師)"}
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit("admin@example.com", "password")}
            fullWidth
            disabled={isLoading}
            sx={{ mb: 1 }}
          >
            {isLoading ? "ログイン中..." : "デモログイン(管理者)"}
          </Button>

          <Box sx={{ textAlign: "center", mb: 2, px: 2 }}>
            <Typography variant="body2" sx={{ color: "#555" }}>
              アカウントをお持ちでない方?{" "}
              <Typography
                component="span"
                variant="body2"
                onClick={() => router.push("/register")}
                sx={{ color: "#1a3a5c", cursor: "pointer" }}
              >
                ユーザー登録はこちら
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
