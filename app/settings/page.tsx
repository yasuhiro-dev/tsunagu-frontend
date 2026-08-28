"use client";
import { getRole } from "@/utils/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CustomGoogleIcon from "../components/GoogleIcon";

export default function SettingPage() {
  const [connected, setConnected] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_auth/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })

      .then((data) => {
        // google_access_tokenがtrueで返る
        setConnected(data.connected);
        // トークンからroleを取り出す
        setRole(getRole());
      });
  }, []);

  // google認証をする
  async function handleClick() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_auth/connect`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await res.json();
    // railsで設定した、google認証ページへ遷移する
    window.location.href = data.url;
  }
  const router = useRouter();
  const handleBackToSchedule = () => {
    router.push("/my_schedule");
  };
  const handleBackToMeetingSlot = () => {
    router.push("/meeting_slots");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ p: 3 }}>
        アカウント設定
      </Typography>
      {connected ? (
        <Card
          sx={{
            display: "flex",
            gap: 2,
            p: 3,
            maxHeight: "calc(100vh - 500px)",
            maxWidth: 800,
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "grey.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CustomGoogleIcon size={30} />{" "}
            </Box>
            googleカレンダー連携
          </Typography>

          <Typography sx={{ mt: 2, mb: 3 }}>
            googleカレンダーと連携すると、確定した面談の予定カレンダーに自動で追加できるようになります
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            <Chip
              variant="outlined"
              label="連携されています"
              size="small"
              color="success"
            />
            {role === "teacher" ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleBackToMeetingSlot}
              >
                面談スケジュール画面に戻る
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleBackToSchedule}
              >
                面談決定画面に戻る
              </Button>
            )}

            <Button variant="outlined" color="primary" onClick={handleClick}>
              他のアカウントで連携をする
            </Button>
          </Box>
        </Card>
      ) : (
        <Box>
          <Card
            sx={{
              display: "flex",
              gap: 2,
              p: 3,
              maxHeight: "calc(100vh - 500px)",
              maxWidth: 800,
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" sx={{ display: "flex", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CustomGoogleIcon size={30} />
              </Box>
              googleカレンダー連携
            </Typography>

            <Typography sx={{ mt: 2, mb: 3 }}>
              googleカレンダーと連携すると、確定した面談の予定カレンダーに自動で追加できるようになります
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              <Chip
                variant="outlined"
                label="連携されていません"
                size="small"
                color="error"
              />
              <Button variant="contained" color="primary" onClick={handleClick}>
                google連携をする
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
}
