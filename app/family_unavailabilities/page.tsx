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
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import {
  fetchCurrentSchedule,
  fetchDeadline,
  fetchFamilySubmitted,
  decodeToken,
} from "@/utils/dateUtils";

export default function FamilyUnavailability() {
  const router = useRouter();
  const [slots, setSlots] = useState<MeetingSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [deadLine, setDeadLine] = useState<null | string>(null);
  const [blockedSlotIds, setBlockedSlotIds] = useState<number[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  // １日分を全て「参加できる」にする関数（保護者）
  const handleSelectAll = async (dateSlots: MeetingSlot[]) => {
    const newIds = dateSlots
      .filter((slot) => !availableSlots.includes(slot.id))
      .filter((slot) => !blockedSlotIds.includes(slot.id))
      .map((slot) => slot.id);
    for (const slotId of newIds) {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_availabilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ meeting_slot_id: slotId }),
        },
      );
    }
    setAvailableSlots((prev) => [...prev, ...newIds]);
  };

  // １日分を全て「参加できない」にする関数（保護者）
  const handleClearAll = async (dateSlots: MeetingSlot[]) => {
    const removeIds = dateSlots
      .filter((slot) => availableSlots.includes(slot.id))
      .map((slot) => slot.id);
    for (const slotId of removeIds) {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_availabilities/${slotId}`,
        {
          method: "DELETE",
        },
      );
    }
    setAvailableSlots((prev) => prev.filter((id) => !removeIds.includes(id)));
  };

  //１コマ分選択/選択解除の関数

  const handleClick = async (slotId: number) => {
    if (availableSlots.includes(slotId)) {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_availabilities/${slotId}`,
        {
          method: "DELETE",
        },
      );
      setAvailableSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_availabilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ meeting_slot_id: slotId }),
        },
      );
      setAvailableSlots((prev) => [...prev, slotId]);
    }
  };

  // 教師の面談不可の日程を取得
  const fetchBlockedSlots = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots/blocked_slots`,
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setBlockedSlotIds(data.map((slot: MeetingSlot) => slot.id));
  };

  // 保護者の参加できる日時の提出
  const handleSubmit = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_availabilities`,
      {
        method: "PATCH",
      },
    );
    const data = await res.json();
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("提出しました");

      setSubmitted(true);
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
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/all_meeting_slots`)
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

    fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_availabilities`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })
      .then((data) => {
        setAvailableSlots(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    const familyId = decodeToken(token).family_id;
    fetchFamilySubmitted(familyId).then((submitted) => {
      setSubmitted(submitted);
    });
    // 他のfetchと依存関係がなく独立して実行できるため、直下に配置
    const loadingSchedule = async () => {
      const scheduleId = await fetchCurrentSchedule();
      const deadline = await fetchDeadline(scheduleId); // 締切日を受け取る
      setDeadLine(deadline); //締切日を再描写する
      await fetchBlockedSlots();
    };
    loadingSchedule();
  }, [router]);

  if (error)
    return (
      <p>データの読み込みに失敗しました。時間をおいて再度お試しください。</p>
    );
  if (loading) return <p>読み込み中...</p>;

  const now = new Date();
  const deadLineDate = deadLine !== null ? new Date(deadLine) : null;

  const isPastDeadline = deadLineDate !== null && now > deadLineDate;

  let headingText = "面談に参加できる日時のボタンを押してください";
  if (submitted === true) {
    headingText = "提出済みのため変更できません";
  } else if (isPastDeadline) {
    headingText = "回答期間は終了しました";
  }

  return (
    <Container sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            {headingText}
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
              isAvailable={(slot) => availableSlots.includes(slot.id)}
              isDisabled={(slot) =>
                submitted || isPastDeadline || blockedSlotIds.includes(slot.id)
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
              submitted || isPastDeadline || availableSlots.length === 0
            }
            onClick={handleSubmit}
          >
            {submitted ? "提出が完了しました" : "上記の内容で提出する"}
          </Button>
        </Box>
        {!submitted && !isPastDeadline && availableSlots.length === 0 && (
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            参加できる日時を1つ以上選ぶと提出できます
          </Typography>
        )}
      </Box>
    </Container>
  );
}
