"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";

function PasswordReset() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const router = useRouter();

  const handleSubmit = async () => {
    if (!password) {
      setPasswordError("パスワードを入力してください");
      return;
    } else if (password.length < 8) {
      setPasswordError("8文字以上にしてください");
      return;
    } else {
      setPasswordError("");
    }
    if (!passwordConfirm) {
      setPasswordConfirmError("確認用パスワードを入力してください");
      return;
    } else if (password !== passwordConfirm) {
      setPasswordConfirmError("パスワードが一致しません");
      return;
    } else {
      setPasswordConfirmError("");
    }
    setIsLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/password_resets/${token}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: { password: password } }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage(data.message);
      router.push("/login");
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage(data.message);
    }

    setIsLoading(false);
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
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={alertOpen}
        autoHideDuration={5000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert severity={alertSeverity}>{alertMessage}</Alert>
      </Snackbar>
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
            新しいパスワードを設定してください
          </Typography>

          <TextField
            type="password"
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            label="パスワード（確認用）"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={!!passwordConfirmError}
            helperText={passwordConfirmError}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            disabled={isLoading}
            sx={{ mb: 1 }}
          >
            {isLoading ? "送信中..." : "送信"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
export default function PasswordResetConfirm() {
  return (
    <Suspense fallback={<Box>読み込み中...</Box>}>
      <PasswordReset />
    </Suspense>
  );
}
