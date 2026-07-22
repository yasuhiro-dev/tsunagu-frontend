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
import EmailIcon from "@mui/icons-material/Email";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type Assignment = {
  id: number;
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
    const data = await res.json();
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
      const data = await res.json();
      alert(data.message);
    } else {
      alert("Googleカレンダー連携が必要です");
      router.push("/settings");
    }
  };

  if (error) return <p>エラー</p>;
  if (loading) return <p>読み込み中...</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
        面談日程決定のお知らせ
      </Typography>
      {assignment.map((a, i) => (
        <Card
          key={i}
          sx={{
            mb: 2,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: "#FFFBF5",
          }}
        >
          <CardContent>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
                label="CONFIRMED"
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip label={a.class_name} size="small" color="default" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
              {a.child_name}（{a.class_name}）
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthIcon color="primary" />
              <Typography>{formatDate(a.start_at)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <AccessTimeIcon color="primary" />
              <Typography>
                {formatTime(a.start_at)}〜{formatTime(a.end_at)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<EmailIcon />}
              >
                リマインドメッセージを送信
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<CalendarMonthIcon />}
                onClick={() => handleClick(a.id)}
              >
                カレンダーに追加
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
