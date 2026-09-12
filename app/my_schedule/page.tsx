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
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import {
  fetchDeadline,
  fetchCurrentSchedule,
  fetchFamilySubmitted,
  decodeToken,
} from "@/utils/dateUtils";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

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
  const [deadLine, setDeadLine] = useState<null | string>(null);
  const [submitted, setSubmitted] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`)
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
    const loadingSchedule = async () => {
      const scheduleId = await fetchCurrentSchedule();
      const deadline = await fetchDeadline(scheduleId); // 締切日を受け取る
      setDeadLine(deadline); //締切日を再描写する
      const familyId = decodeToken(token).family_id;
      fetchFamilySubmitted(familyId).then((submitted) => {
        setSubmitted(submitted);
      });
    };
    loadingSchedule();
  }, [router]);

  // googleカレンダー連携のAPI
  const handleClick = async (assignmentId: number) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_auth/status`,
      {
        method: "GET",
      },
    );
    // トークンがあるかないかを確認する
    const data = await res.json();
    // トークンがあるならば、google_calernder_controllerへAPIを送る
    if (data.connected == true) {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_calendar/${assignmentId}`,
        {
          method: "POST",
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
  // ユーザーと学校の状況によって表示を変更
  const getStatusMessage = () => {
    // 締切日を過ぎている
    const isPastDeadline = deadLine !== null && new Date(deadLine) < new Date();
    if (assignment.length > 0 && submitted === true) {
      return "ご提出いただいた内容をもとに、面談の日程が決定しました。";
    }
    if (assignment.length > 0 && submitted === false && isPastDeadline) {
      return (
        <>
          回答期限を過ぎたため、学校側で日程を決定いたしました。
          <br />
          ご都合が悪い場合は、学校までご連絡ください。
        </>
      );
    }
    if (assignment.length > 0 && submitted === false && !isPastDeadline) {
      return (
        <>
          学校の都合により、面談の日程が決定しました。
          <br />
          ご都合が悪い場合は、学校までご連絡ください。
        </>
      );
    }
    if (assignment.length === 0 && submitted === true) {
      return "提出ありがとうございます。日程調整中です";
    }
    if (assignment.length === 0 && submitted === false) {
      return (
        "回答締め切り" +
        (deadLine !== null ? formatDate(deadLine) : "") +
        "です"
      );
    }
  };
  // steperで使う関数
  const getCurrentStep = () => {
    // 提出かつ割り当て完了の場合
    if (assignment.length > 0) {
      return 2;
    }
    // 日程調節中（提出後）
    if (submitted === true) {
      return 1;
    }
    // 提出待ち　（提出前）
    if (submitted === false) {
      return 0;
    }
  };
  const steps = ["提出待ち", "日程調節", "決定"];

  if (error)
    return (
      <p>データの読み込みに失敗しました。時間をおいて再度お試しください。</p>
    );
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
      {/* 面談決定までの過程を表示 */}
      <Stepper activeStep={getCurrentStep()}>
        {steps.map((label, index) => {
          return (
            <Step key={index}>
              <StepLabel
                error={
                  index === 0 && assignment.length > 0 && submitted === false
                }
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Typography sx={{ p: 2 }}>{getStatusMessage()}</Typography>
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
