"use client";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useRouter } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {
  MeetingSlot,
  formatDate,
  formatTime,
  groupByDate,
} from "@/utils/dateUtils";

export default function FamilyUnavailability() {
  const router = useRouter();
  const [slots, setSlots] = useState<MeetingSlot[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [deadLine, setDeadLine] = useState<null | string>(null);
  const [blockedSlotIds, setBlockedSlotIds] = useState<number[]>([]);
  const decodeToken = (token: string) => {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  };

  // １日全選択の関数（保護者）
  const handleSelectAll = async (dateSlots: MeetingSlot[]) => {
    const token = localStorage.getItem("token");
    const newIds = dateSlots
      .filter((slot) => !unavailableSlots.includes(slot.id))
      .filter((slot) => !blockedSlotIds.includes(slot.id))
      .map((slot) => slot.id);
    for (const slotId of newIds) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ meeting_slot_id: slotId }),
        },
      );
    }
    setUnavailableSlots((prev) => [...prev, ...newIds]);
  };

  // １日全削除の関数（保護者）
  const handleClerAll = async (dateSlots: MeetingSlot[]) => {
    const token = localStorage.getItem("token");
    const removeIds = dateSlots
      .filter((slot) => unavailableSlots.includes(slot.id))
      .map((slot) => slot.id);
    for (const slotId of removeIds) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities/${slotId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    }
    setUnavailableSlots((prev) => prev.filter((id) => !removeIds.includes(id)));
  };

  //１コマ分選択/選択解除の関数

  const handleClick = async (slotId: number) => {
    const token = localStorage.getItem("token");
    if (unavailableSlots.includes(slotId)) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities/${slotId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnavailableSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      console.log("POST送信", slotId);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ meeting_slot_id: slotId }),
        },
      );
      setUnavailableSlots((prev) => [...prev, slotId]);
    }
  };

  // 保護者の面談不可日程締め切り日の表示
  const fetchDeadline = async () => {
    const token = localStorage.getItem("token");
    const scheduleId = 1;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${scheduleId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    console.log("締切日", data);
    setDeadLine(data.deadline_at);
  };

  // 教師の面談不可の日程を取得
  const fetchBlockedSlots = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots/blocked_slots`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    setBlockedSlotIds(data.map((slot: MeetingSlot) => slot.id));
  };

  // 保護者の面談不可日程の提出
  const hundleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (res.ok) {
      setSubmitted(true);
      alert("提出しました");
    } else {
      alert("エラーが発生しました");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/all_meeting_slots`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        // falseの場合エラーメッセージがthrow→catchへ
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })
      // バックエンドからslotsが届く
      .then((data) => {
        setSlots(data);
        setLoading(false);
      })
      // 受け取ったメッセージをsetErrorに渡して更新する
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })
      .then((data) => {
        setUnavailableSlots(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    const familyId = decodeToken(token).family_id;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/families/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitted(data.submitted);
      });
    // 他のfetchと依存関係がなく独立して実行できるため、直下に配置
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlockedSlots();
    fetchDeadline();
  }, [router]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  const now = new Date();
  const deadLineDate = deadLine !== null ? new Date(deadLine) : null;

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          面談に参加できない日時のボタンを押してください
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {/* 締め切り日がnullでないの場合表示され、nullの場合空文字(初期値がnullのため) */}
          回答締切：{deadLine !== null ? formatDate(deadLine) : null}
        </Typography>

        <Box
          sx={
            isMobile
              ? { display: "flex", flexDirection: "column", gap: 2 }
              : { display: "flex", gap: 2 }
          }
        >
          {Object.entries(groupByDate(slots)).map(([date, dateSlots]) => (
            <Box key={date} sx={{ flex: 1, textAlign: "center" }}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "primary.dark",
                      borderBottom: 2,
                      borderColor: "primary.main",
                      pb: 2,
                    }}
                  >
                    {date}
                  </Typography>
                  {dateSlots.map((slot) => {
                    const isBlocked = blockedSlotIds.includes(slot.id);
                    const isReadOnly =
                      submitted ||
                      (deadLineDate !== null && now > deadLineDate);
                    return (
                      <Box key={slot.id} sx={{ mb: 1 }}>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            mb: 1,
                            textAlign: "center",
                          }}
                        >
                          {formatTime(slot.start_at)}~{formatTime(slot.end_at)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            mb: 1,
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            color={
                              unavailableSlots.includes(slot.id)
                                ? "error"
                                : "primary"
                            }
                            onClick={() => handleClick(slot.id)}
                            disabled={isReadOnly || isBlocked}
                            sx={{
                              "&.Mui-disabled": {
                                backgroundColor: unavailableSlots.includes(
                                  slot.id,
                                )
                                  ? "error" // 赤（面談不可）
                                  : "primary", // 青（面談可）
                                color: "white",
                              },
                            }}
                          >
                            {unavailableSlots.includes(slot.id)
                              ? "面談不可"
                              : "面談可"}
                          </Button>

                          <Typography
                            variant="caption"
                            sx={{
                              visibility: isBlocked ? "visible" : "hidden",
                            }}
                          >
                            教師の都合により対応不可
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 1,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  disabled={
                    submitted || (deadLineDate !== null && now > deadLineDate)
                  }
                  onClick={() => handleSelectAll(dateSlots)}
                >
                  全選択
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={
                    submitted || (deadLineDate !== null && now > deadLineDate)
                  }
                  onClick={() => handleClerAll(dateSlots)}
                >
                  全解除
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={isMobile ? { display: "flex", justifyContent: "center" } : {}}>
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            disabled={
              submitted || (deadLineDate !== null && now > deadLineDate)
            }
            onClick={hundleSubmit}
          >
            {submitted ? "提出が完了しました" : "上記の内容で提出する"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
