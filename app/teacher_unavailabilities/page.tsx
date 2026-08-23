"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MeetingSlot, formatTime, groupByDate } from "@/utils/dateUtils";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import UnavailabilityCard from "@/app/components/UnavailabilityCard";

export default function MeetingSlotPage() {
  const [slots, setslots] = useState<MeetingSlot[]>([]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  // 面談日程不可設定（教師）

  // １日全選択の関数
  const teacherHandleSelectAll = (dateSlots: MeetingSlot[]) => {
    // （）の引数は全選択ボタンを押した時に渡される
    // 今回選択したものをnewIdsとする
    const newIds = dateSlots
      .filter((slot) => !unavailableSlots.includes(slot.id)) //面談不可を選んでいないslotに絞る
      .map((slot) => slot.id);
    // すでに選択しているもの(prev)を維持したまま、まだ選ばれていなかったものを新しく追加する処理
    setUnavailableSlots((prev) => [...new Set([...prev, ...newIds])]);
  };

  // １日全選択解除の関数
  const teacherHandleClearAll = (dateSlots: MeetingSlot[]) => {
    // 今回選択解除したいものをremoveIdsとする
    const removeIds = dateSlots
      .filter((slot) => unavailableSlots.includes(slot.id)) //面談不可を選んでいるslotに絞る
      .map((slot) => slot.id);
    // すでに選択しているもの(prev)の中から、今回解除したいもの(removeIds)を取り除く
    setUnavailableSlots((prev) => prev.filter((id) => !removeIds.includes(id)));
  };

  // １コマ分選択/選択解除の関数
  const teacherHandleClick = (slotId: number) => {
    //教師が１コマ選んだ引数が(slotId: number)に入る
    if (unavailableSlots.includes(slotId)) {
      // すでに選択されている場合、解除する（＝すでに選択・今選択したものが一致している場合、外す）
      setUnavailableSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      // 選択されていない場合、追加する
      setUnavailableSlots((prev) => [...prev, slotId]);
    }
  };

  // 面談不可日程の提出の関数（教師）
  const teacherHandleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots/bulk_update`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // 教師が選んだ面談不可日程をbodyにつける
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
    // 画面が切り替わった時にトークンを持っていないん場合、ログイン画面へ
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    // 面談表を取得するfetch
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      // エラーが発生したら、catchへ

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
  }, [router]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          面談に参加できない日時のボタンを押してください
        </Typography>

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
              isUnavailable={(slot) =>
                slot.status === "blocked" || unavailableSlots.includes(slot.id)
              }
              isDisabled={() => submitted}
              onClickSlot={teacherHandleClick}
              onSelectAll={teacherHandleSelectAll}
              onClearAll={teacherHandleClearAll}
              showBlockedNote={false}
            />
          ))}
        </Box>
        <Box sx={isMobile ? { display: "flex", justifyContent: "center" } : {}}>
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            disabled={submitted}
            onClick={teacherHandleSubmit}
          >
            {submitted ? "提出が完了しました" : "上記の内容で提出する"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
