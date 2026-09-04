"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AlertSnackbar from "@/app/components/AlertSnackbar";

type Assignment = {
  id: number;
  child_id: number;
  room_type: string;
  child_name: string;
  class_name: string;
  start_at: string;
  end_at: string;
};

const formatDate = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MySchedulePage() {
  const [assignment, setAssignment] = useState<Assignment[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })
      .then((data) => {
        setAssignment(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [router]);

  // googleカレンダー連携のAPI
  const handleClick = async (assignmentId: number) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_auth/status`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    // トークンがあるかないかを確認する
    const data = await res.json();
    // トークンがあるならば、google_calernder_controllerへAPIを送る
    if (data.connected == true) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_calendar/${assignmentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      // 登録されたかされていないかメッセージが返る
      const data = await res.json();
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage(data.message);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("Googleカレンダー連携が必要です");
      setTimeout(() => {
        router.push("/settings");
      }, 2000);
    }
  };

  if (error) return <p>エラー</p>;
  if (loading) return <p>読み込み中...</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        面談日程決定のお知らせ
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {assignment.map((a, i) => (
          <Card
            key={i}
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              backgroundColor: "parper",
            }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
                  sx={{ mt: 2, mb: 2 }}
                  label="確定しました"
                  size="medium"
                  color="success"
                  variant="outlined"
                />
              </Box>
              {a.room_type === "support" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 2 }}
                >
                  ※特別支援学級に在籍するお子さまは、通常学級と支援学級で2回の面談枠があります
                </Typography>
              )}
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {a.child_name}（{a.class_name}）
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonthIcon color="primary" />
                <Typography variant="body1">
                  {formatDate(a.start_at)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  mb: 3,
                }}
              >
                <AccessTimeIcon color="primary" />
                <Typography variant="body1">
                  {formatTime(a.start_at)}〜{formatTime(a.end_at)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => handleClick(a.id)}
                >
                  カレンダーに追加
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
