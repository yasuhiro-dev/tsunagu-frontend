"use client";

import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function PasswordReset() {
  const [emailAddress, setEmailAddress] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setApiError("");
    if (!emailAddress) {
      setEmailError("メールアドレスを入力してください");
      return;
    } else if (!emailAddress.includes("@")) {
      setEmailError("正しいメールアドレスの形式で入力してください");
      return;
    } else {
      setEmailError("");
    }
    setIsLoading(true);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/password_resets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password_reset: { email: emailAddress } }),
    });
    setMessage("送信完了しました");
  };

  if (message) {
    return (
      <Box>
        <Card>
          <CardContent>
            <Alert severity="success">送信完了しました</Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#1a3a5c" }}
            >
              Tsunagu
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{ textAlign: "center", mb: 2, color: "#1a3a5c" }}
          >
            登録されているメールアドレスをご記入ください
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
