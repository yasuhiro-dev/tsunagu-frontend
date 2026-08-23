"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { MeetingSlot, formatDate, groupByDate } from "@/utils/dateUtils";
import UnavailabilityCard from "@/app/components/UnavailabilityCard";
import AlertSnackbar from "@/app/components/AlertSnackbar";

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
  const [currentSchedules, setCurrentSchedules] = useState<null | number>();
  const decodeToken = (token: string) => {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  };
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

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
  const handleClearAll = async (dateSlots: MeetingSlot[]) => {
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

  // 今年度のschedule_idを取得する
  const fetchCurrentSchedule = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/current`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    setCurrentSchedules(data.id);
    return data.id;
  };

  // 保護者の面談不可日程締め切り日の表示
  const fetchDeadline = async (scheduleId: number) => {
    const token = localStorage.getItem("token");
    const schedule = scheduleId;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${schedule}`,
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
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // 保護者が選んだ面談不可日程をbodyにつける
        body: JSON.stringify({ meeting_slot_ids: unavailableSlots }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("提出しました");

      setUnavailableSlots(data.map((slot: MeetingSlot) => slot.id));
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage(data.error);
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
    const loadingSchedule = async () => {
      const scheduleId = await fetchCurrentSchedule();
      await fetchDeadline(scheduleId);
      await fetchBlockedSlots();
    };
    loadingSchedule();
  }, [router]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  const now = new Date();
  const deadLineDate = deadLine !== null ? new Date(deadLine) : null;

  return (
    <Container sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            面談に参加できない日時のボタンを押してください
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {/* 締め切り日がnullでないの場合表示され、nullの場合空文字(初期値がnullのため) */}
            回答締切：{deadLine !== null ? formatDate(deadLine) : null}
          </Typography>
        </Box>

        <Box
          sx={
            isMobile
              ? { display: "flex", flexDirection: "column", gap: 2 }
              : { display: "flex", gap: 2 }
          }
        >
          {Object.entries(groupByDate(slots)).map(([date, dateSlots]) => (
            <UnavailabilityCard
              key={date}
              date={date}
              dateSlots={dateSlots}
              isUnavailable={(slot) => unavailableSlots.includes(slot.id)}
              isDisabled={(slot) =>
                submitted ||
                (deadLineDate !== null && now > deadLineDate) ||
                blockedSlotIds.includes(slot.id)
              }
              onClickSlot={handleClick}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              showBlockedNote={true}
              isBlocked={(slot) => blockedSlotIds.includes(slot.id)}
            />
          ))}
        </Box>
        <Box sx={isMobile ? { display: "flex", justifyContent: "center" } : {}}>
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            disabled={
              submitted || (deadLineDate !== null && now > deadLineDate)
            }
            onClick={handleSubmit}
          >
            {submitted ? "提出が完了しました" : "上記の内容で提出する"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
