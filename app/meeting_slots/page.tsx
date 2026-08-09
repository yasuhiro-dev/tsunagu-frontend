"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SlotAddPopover from "../components/meeting_slots/SlotAddPopover";
import Container from "@mui/material/Container";

type MeetingSlot = {
  id: number;
  start_at: string;
  end_at: string;
  status: string;
  child_name: string | null;
  schedule_id: number;
};

const formatDate = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};
const formatTime = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildMatrix = (slots: MeetingSlot[]) => {
  return slots.reduce(
    (acc, slot) => {
      const time = formatTime(slot.start_at);
      const date = formatDate(slot.start_at);
      if (!acc[time]) acc[time] = {};
      acc[time][date] = slot;
      return acc;
    },
    {} as Record<string, Record<string, MeetingSlot>>,
  );
};

export default function MeetingSlotPage() {
  const [slots, setslots] = useState<MeetingSlot[]>([]);
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [unassignedChildren, setUnassignedChildren] = useState<
    {
      id: number;
      child_name: string;
      family_name: string;
      child_name_kana: string;
    }[]
  >([]);
  // 割り当てボタンを押した時、schedulesにAPIを送る
  const handleClick = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setMessage("割り当て完了");

    // 面談表を取得する
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setslots(data));
    // 保護者の不可日時を取得する
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setUnassignedChildren(data);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("データ取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        setslots(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUnassignedChildren(data);
      });
  }, [router]);

  const handleDownLoadPDF = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/teacher_exports`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const matrix = buildMatrix(slots);
  const allTimes = [
    ...new Set(slots.map((s) => formatTime(s.start_at))),
  ].sort();
  const allDates = [
    ...new Set(slots.map((s) => formatDate(s.start_at))),
  ].sort();

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2, maxHeight: 680 }}>
        <Box sx={{ p: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItem: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              面談スケジュール
            </Typography>
            <Box
              className="no-print"
              sx={{ alignItems: "center", display: "flex", gap: 1 }}
            >
              <p>{message}</p>
              <Button variant="contained" color="primary" onClick={handleClick}>
                割り当てを実行する
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownLoadPDF}
              >
                PDFをダウンロード
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ width: "200px", flexShrink: 0 }}>
              <Typography sx={{ mb: 2 }}>
                未割り当て児童
                <Chip
                  label={unassignedChildren.length}
                  color="error"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Box sx={{ overflow: "auto", maxHeight: "520px" }}>
                {unassignedChildren.map((child) => (
                  <Box
                    key={child.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "error.light",
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">{child.child_name}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      保護者：{child.family_name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ width: "60px" }}></Box>
                {allDates.map((date) => (
                  <Box
                    key={date}
                    sx={{
                      flex: 1,
                      minWidth: "120px",
                      border: "1px solid ",
                      borderColor: "divider",
                      p: 1,
                      backgroundColor: "primary.dark",
                      color: "white",
                      textAlign: "center",
                      borderRadius: 1,
                    }}
                  >
                    <CalendarMonthIcon sx={{ fontSize: "14px" }} />
                    {date}
                  </Box>
                ))}
              </Box>

              <Box>
                {allTimes.map((time) => (
                  <Box key={time} sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <Box
                      sx={{
                        width: "60px",
                        border: "1px solid",
                        borderColor: "divider",
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      <>
                        <Typography variant="body2">{time}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          [15分]
                        </Typography>
                      </>
                    </Box>
                    {allDates.map((date) => (
                      <Box
                        key={date}
                        sx={{
                          flex: 1,
                          minWidth: "120px",
                          border: "1px solid",
                          borderColor: "divider",
                          p: 1,
                          minHeight: "80px",
                          borderRadius: 1,
                        }}
                      >
                        {matrix[time][date]?.child_name ? (
                          <>
                            <Typography variant="body1">
                              {matrix[time][date].child_name}
                            </Typography>
                            <Chip
                              label="確定"
                              color="primary"
                              sx={{ borderRadius: "4px" }}
                            />
                          </>
                        ) : (
                          <Box
                            sx={{
                              textAlign: "center",
                              minHeight: "30px",
                            }}
                          >
                            <SlotAddPopover
                              slotId={matrix[time][date].id}
                              dateLabel={date}
                              timeLabel={time}
                              onAdded={() => {
                                const token = localStorage.getItem("token");
                                fetch(
                                  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                )
                                  .then((res) => res.json())
                                  .then((data) => setslots(data));
                              }}
                            ></SlotAddPopover>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
