"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MeetingSlot, groupByDate } from "@/utils/dateUtils";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import UnavailabilityCard from "@/app/components/UnavailabilityCard";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import DemoGuide from "@/app/components/DemoGuide";
import LinearProgress from "@mui/material/LinearProgress";
export default function MeetingSlotPage() {
  const [slots, setslots] = useState<MeetingSlot[]>([]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [childrenLength, setChildrenLength] = useState<number>(0);
  const [showSubmittedDialog, setShowSubmittedDialog] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  // 面談不可(blocked)以外の枠を、面談できる枠として扱う
  const toAvailableIds = (data: MeetingSlot[]) =>
    data.filter((slot) => slot.status !== "blocked").map((slot) => slot.id);

  // １日分を全て「面談できる」にする関数
  const teacherHandleSelectAll = (dateSlots: MeetingSlot[]) => {
    // （）の引数は全て可能ボタンを押した時に渡される
    // 今回選択したものをnewIdsとする
    const newIds = dateSlots
      .filter((slot) => !availableSlots.includes(slot.id)) //面談できるをまだ選んでいないslotに絞る
      .map((slot) => slot.id);
    // すでに選択しているもの(prev)を維持したまま、まだ選ばれていなかったものを新しく追加する処理
    setAvailableSlots((prev) => [...new Set([...prev, ...newIds])]);
  };

  // １日分を全て「面談できない」にする関数
  const teacherHandleClearAll = (dateSlots: MeetingSlot[]) => {
    // 今回解除したいものをremoveIdsとする（予約済みの枠は面談不可にできないので残す）
    const removeIds = dateSlots
      .filter((slot) => availableSlots.includes(slot.id))
      .filter((slot) => slot.status !== "reserved")
      .map((slot) => slot.id);
    // すでに選択しているもの(prev)の中から、今回解除したいもの(removeIds)を取り除く
    setAvailableSlots((prev) => prev.filter((id) => !removeIds.includes(id)));
  };

  // １コマ分選択/選択解除の関数
  const teacherHandleClick = (slotId: number) => {
    //教師が１コマ選んだ引数が(slotId: number)に入る
    if (availableSlots.includes(slotId)) {
      // すでに選択されている場合、解除する（＝すでに選択・今選択したものが一致している場合、外す）
      setAvailableSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      // 選択されていない場合、追加する
      setAvailableSlots((prev) => [...prev, slotId]);
    }
  };

  // 面談できる日時の提出の関数（教師）
  const teacherHandleSubmit = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots/bulk_update`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        // 教師が選んだ面談できる日時をbodyにつける（それ以外の枠は面談不可になる）
        body: JSON.stringify({ meeting_slot_ids: availableSlots }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("提出しました");

      setAvailableSlots(toAvailableIds(data));
      setShowSubmittedDialog(true);
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
    //児童数を取得する（割り当てする枠が足りるかチェックするため）
    const fetchChildren = async () => {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/teachers/capacity`,
      );
      const data = await res.json();
      setChildrenLength(data.children_count);
    };
    fetchChildren();

    // 面談表を取得するfetch
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {})
      // エラーが発生したら、catchへ

      .then((res) => {
        if (!res.ok) throw new Error("データ取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        setslots(data);
        setAvailableSlots(toAvailableIds(data));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  // 現在、面談できる枠の総数（引き算前の生の値）
  const availableCount = availableSlots.length;
  // 必要な枠数（児童数）
  const requiredSlots = childrenLength;
  // 余裕度（プラスなら余裕あり、マイナスなら不足）
  const remainSlots = availableCount - requiredSlots;
  // 枠の空きが余裕がないかの判定
  const isShortage = availableCount < requiredSlots;
  // 枠の空き具合
  const fulfillmentRate =
    requiredSlots === 0
      ? 100
      : Math.min((availableCount / requiredSlots) * 100, 100); //渡された複数の値のうち、一番小さいものを返す（ゲージが100を超えないように）

  return (
    <Container sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      {showSubmittedDialog && <DemoGuide page="teacher_submitted" />}
      <DemoGuide page="teacher_unavailability" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          面談に対応できない日時のボタンを押してください
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          ※保護者の面談が決まっている枠は、面談不可にできません
        </Typography>

        <Paper sx={{ display: "flex" }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body1">このクラスの児童数</Typography>
            <Typography variant="h5">{requiredSlots}件</Typography>
            <Typography variant="body2">面談が必要な人数です</Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body1">現在の空き枠</Typography>
            <Typography variant="h5">{availableCount}件</Typography>

            <Typography variant="body2">まだ割り当て可能な枠です</Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body1">枠の空き具合</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={fulfillmentRate}
                color={isShortage ? "error" : "success"}
                sx={{ flex: 1 }}
              />
              <Typography variant="h6">
                {Math.floor(fulfillmentRate)}%
              </Typography>
            </Box>

            <Typography variant="body2">
              {remainSlots >= 0
                ? `必要${requiredSlots}枠に対して、あと${remainSlots}枠の余裕があります`
                : `必要${requiredSlots}枠に対して、${Math.abs(remainSlots)}枠不足しています`}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                backgroundColor: remainSlots > 0 ? "#e8f5ee" : "#fbebec",
                p: 2,
              }}
            >
              {remainSlots > 0 ? (
                <Typography
                  variant="h6"
                  sx={{ color: "success.main", fontSize: 12 }}
                >
                  ✓ 必要な枠数は足りています
                </Typography>
              ) : (
                <Typography variant="h6" sx={{ color: "error", fontSize: 12 }}>
                  ⚠ このまま提出すると、枠が {Math.abs(remainSlots)}{" "}
                  枠不足する可能性があります
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

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
              isDisabled={(slot) => submitted || slot.status === "reserved"}
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
