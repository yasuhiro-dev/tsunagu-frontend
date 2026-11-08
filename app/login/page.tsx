"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import {
  demoLogin,
  resetDemo,
  RedirectMap,
  DEMO_ACCOUNTS,
  prepareGuestDemo,
} from "@/utils/demoLogin";

type LoginResponse = {
  token: string;
  role: keyof RedirectMap;
};

//ゲストログインボタン（役割ごと）
const guestLoginButtons = [
  {
    roleKey: "teacher" as const,
    role: "担任の先生",
    color: "primary.main",
    bgColor: "#e1edf8ff",
    circleColor: "primary.main",
    path: "/meeting_slots",
    button_label: "担任の先生でログイン",
    reset: true,
    image: "/images/teacher.webp",
    items: [
      "未割り当て児童の配置",
      "面談枠の移動・入れ替え",
      "面談できない日時の登録",
      "面談表のPDF出力",
    ],
  },
  {
    roleKey: "parent" as const,
    role: "保護者",
    color: "#d18a94",
    bgColor: "#fbebec",
    circleColor: "#d18a94",
    path: "/family_unavailabilities",
    image: "/images/parent.webp",
    button_label: "保護者でログイン",
    reset: true,
    items: [
      "来校できる日時の提出",
      "決まった面談日時の確認",
      "カレンダーへの追加",
      "スマホでも操作できる",
    ],
  },
  {
    roleKey: "admin" as const,
    role: "教頭先生",
    color: "success.main",
    bgColor: "#e8f5ee",
    circleColor: "success.main",
    image: "/images/admin.webp",
    path: "/admin?tab=1",
    button_label: "教頭先生でログイン",
    reset: true,
    items: [
      "面談日程の自動割り当て",
      "割り当て結果の確認",
      "保護者へメール一括送信",
      "担任・保護者の管理",
    ],
  },
];

export default function LoginPage() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const [apiError, setApiError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleGuestSubmit = async (
    loginEmail: string, // 1つ目に渡された値を、この名前で使う（文字列）
    loginPassword: string, // ２つ目に渡された値を、この名前で使う（文字列）
    redirectOverride: string, // 3つ目に渡された値は渡さなくてもいい（guest.path）
    reset: boolean, // 4つ目がtrueのときは、デモ環境を初期状態に戻してから遷移する
    mode: "guided" | "free", //5つ目がguideかfreeで案内を出すかを判定
    roleLoading: string,
  ) => {
    try {
      setIsLoading(roleLoading);
      //demoLogin(utils)に引数を渡し、メールとパスワードから判断してroleが返ってくる
      const role = await demoLogin(loginEmail, loginPassword);
      //apiの返り値、４つ目の引数：担任だったら割り当て実行それ以外は、リセットする
      if (mode === "free" && role === "teacher") {
        await prepareGuestDemo();
      } else if (reset) {
        await resetDemo();
      }
      //３つ目の引数：redirectOverride（my_scheduleへの遷移）がなければroleを見て指定されたURLへ遷移
      setRedirectTo(redirectOverride);
      //４つ目の引数：モードを遷移先でも把握するためsessionに保存
      sessionStorage.setItem("demoMode", mode);
    } catch {
      //api失敗したら表示する
      setIsLoading(null);
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("デモログインに失敗しました");
    }
  };
  useEffect(() => {
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  }, [redirectTo]);
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
    setIsLoading(loginEmail);
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
      setIsLoading(null);
    }
  };

  return (
    <Box sx={{ position: "relative", height: "100vh" }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/tsunagu.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.25,
        }}
      ></Box>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
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
            ></Box>
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
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: "right", mt: 1 }}>
                <Link href="/password_reset">
                  パスワードをお忘れの方はこちら
                </Link>
              </Box>
              <Button
                variant="contained"
                onClick={() => handleSubmit()}
                fullWidth
                disabled={isLoading !== null}
                sx={{ mb: 3 }}
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {guestLoginButtons.map((guest, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      borderRadius: 5,
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Button
                      sx={{ backgroundColor: guest.bgColor }}
                      variant="outlined"
                      disabled={isLoading !== null}
                      onClick={() =>
                        handleGuestSubmit(
                          DEMO_ACCOUNTS[guest.roleKey].email,
                          DEMO_ACCOUNTS[guest.roleKey].password,
                          guest.path,
                          guest.reset,
                          "free",
                          guest.roleKey,
                        )
                      }
                    >
                      {isLoading === guest.roleKey ? (
                        <>
                          <CircularProgress size={20} /> 準備しています…
                        </>
                      ) : (
                        guest.button_label
                      )}
                    </Button>
                  </Box>
                ))}
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ color: "#555", mt: 3 }}>
                  アカウントをお持ちでない方は{" "}
                </Typography>
                <Typography
                  component="span"
                  variant="body2"
                  onClick={() => router.push("/register")}
                  sx={{ color: "#1a3a5c", cursor: "pointer" }}
                >
                  ユーザー登録はこちら
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
