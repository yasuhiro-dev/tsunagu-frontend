"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import useMediaQuery from "@mui/material/useMediaQuery";
import "dayjs/locale/ja";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoIcon from "@mui/icons-material/Info";

type Props = {
  scheduleId: number | null;
};

const settingMessages = {
  circleColor: "primary.main",
  title: "設定するとどうなりますか",
  items: [
    "締切日以降は、保護者が希望日の登録・変更ができなくなります。",
    "締切日までに登録された希望日をもとに、面談の自動割り当てを行います。",
    "締切日は、後からいつでも変更できます。",
  ],
};

export default function DeadlineSetting({ scheduleId }: Props) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [editDeadLine, setEditDeadLine] = useState<null | string>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  // 締め切り日の変更を表示する
  const fetchEditDeadLine = async (scheduleId: number) => {
    const schedule = scheduleId;
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${schedule}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();
    setEditDeadLine(data.deadline_at);
  };

  // 提出締切日の変更の関数
  const updateEditDeadLine = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${scheduleId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        // フロントで設定した締切日（editDeadLine）をRailsに送る
        body: JSON.stringify({ deadline_at: editDeadLine }),
      },
    );
    // 更新された締め切り日が返ってくる
    const data = await res.json();
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("変更しました");
      setEditDeadLine(data.deadline_at);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("変更に失敗しました");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (scheduleId === null) return;
    // fetchCurrentScheduleで今年度のscheduleIdを取得してからfetchEditDeadLineを実行
    const loadSchedule = async () => {
      await fetchEditDeadLine(scheduleId);
    };
    loadSchedule();
  }, [scheduleId]);

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        maxWidth: isMobile ? "265px" : "1000px",
        mx: "auto",
      }}
    >
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: "column",
          maxHeight: "calc(100vh - 400px)",
          overflow: "auto",
        }}
      >
        {/* 締め切りカレンダー（保護者の都合の悪い日） */}
        <Typography variant="h6">締切日の設定</Typography>
        <Box>
          <Typography variant="body2">
            保護者が面談希望日を提出する期限を設定します。
          </Typography>
        </Box>
        {/* カレンダーと設定の説明画面を横並び */}
        <Box sx={{ display: "flex", alignItems: "stretch", gap: 5 }}>
          <Box
            sx={{
              backgroundColor: "#e8f5ee",
              p: 2,
              borderRadius: 3,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              締切日
            </Typography>
            {/* DatePickerの動作に必要な設定（dayjsを使うと指定） */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
              {/* 締切日入力用のカレンダー */}
              <DatePicker
                //今どんな値を選んでいるか
                value={editDeadLine !== null ? dayjs(editDeadLine) : null}
                // カレンダーをクリックして変化したら処理される
                onChange={(newValue) =>
                  // nullじゃなければ、選ばれた日付を文字列(.format)に変換してstateを更新する
                  setEditDeadLine(
                    newValue !== null ? newValue.format("YYYY-MM-DD") : null,
                  )
                }
              />
            </LocalizationProvider>

            {/* 保存ボタンを押すと編集更新の関数が呼ばれる */}

            <Typography variant="body2">
              <CalendarMonthIcon
                sx={{ fontSize: 18, color: "text.secondary" }}
              />
              現在の締切日より後の日付を設定してください。
            </Typography>
            <Button
              onClick={updateEditDeadLine}
              variant="contained"
              color="primary"
              sx={{ width: 300 }}
            >
              締切日を更新する
            </Button>
          </Box>
          <Box
            sx={{
              backgroundColor: "#d6e4f0",
              p: 2,
              borderRadius: 3,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6">
              <InfoIcon sx={{ color: "info.main" }} />
              {settingMessages.title}
            </Typography>
            {settingMessages.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <CheckCircleIcon
                  sx={{ color: settingMessages.circleColor, mt: "2px" }}
                />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
