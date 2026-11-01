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
import Alert from "@mui/material/Alert";
import UnavailabilityCard from "@/app/components/UnavailabilityCard";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import LinearProgress from "@mui/material/LinearProgress";
import DemoGuide from "@/app/components/DemoGuide";
import GuideHelp from "@/app/components/GuideHelp";
import NextStepButton from "@/app/components/NextStepButton";
import { useDemoMode } from "@/utils/useDemoMode";
import { prepareGuestDemo } from "@/utils/demoLogin";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Chip from "@mui/material/Chip";
import { fetchTeacherReassign } from "@/utils/demoLogin";

export default function MeetingSlotPage() {
  const [slots, setslots] = useState<MeetingSlot[]>([]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [childrenLength, setChildrenLength] = useState<number>(0);
  const [showSubmittedDialog, setShowSubmittedDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  //提出を押したら、割り当てボタンを実行するようにする
  const demoMode = useDemoMode();

  const classRoom = slots[0]?.class_room;

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
    setIsSubmitted(true);
    try {
      // ゲストログイン（free）のとき：割り当てをやり直して、ここで抜ける
      if (demoMode === "free") {
        try {
          await fetchTeacherReassign(availableSlots);
          await fetchSlots(); // 割り当て後の面談表を取り直す
        } catch {
          setAlertOpen(true);
          setAlertSeverity("error");
          setAlertMessage("提出に失敗しました。もう一度お試しください");
          return;
        } finally {
          setDialogOpen(false);
        }
        setSubmitted(true);
        setAlertOpen(true);
        setAlertSeverity("success");
        setAlertMessage(
          "提出しました。提出内容で面談の割り当てをやり直しました",
        );
        return;
      }

      // それ以外：bulk_update で提出する
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

      // bulk_update の結果を表示する
      if (res.ok) {
        setAlertOpen(true);
        setAlertSeverity("success");
        setAlertMessage("提出しました");
        setSubmitted(true);
        setDialogOpen(false);
        setAvailableSlots(toAvailableIds(data));
        if (demoMode === "guided") setShowSubmittedDialog(true);
      } else {
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertMessage(data.error);
        setDialogOpen(false);
      }
    } finally {
      setIsSubmitted(false); // どの道を通っても、最後に「提出中」を戻す
    }
  };

  //提出後面談表を取得するメソッド（ゲストログイン時）
  const fetchSlots = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`,
      { method: "GET" },
    );
    if (!res.ok) throw new Error("データ取得に失敗しました");
    const data = await res.json();
    setslots(data);
    setAvailableSlots(toAvailableIds(data));
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

  return (
    <Container sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <DemoGuide
        page="teacher_submitted"
        open={showSubmittedDialog}
        onClose={() => setShowSubmittedDialog(false)}
      />

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h5"
              sx={{ fontSize: { xs: "20px", sm: "20px", md: "24px" } }}
            >
              面談できない日時 ({classRoom})
            </Typography>
            <GuideHelp page="teacher_unavailability" />
          </Box>
          {submitted && demoMode === "guided" && (
            <NextStepButton page={"teacher_submitted"} />
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 3 }}>
          <Typography>
            出張などで対応できない時間の『× 対応できない』を押してください
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ※保護者の面談が決まっている枠は、『対応できない』にできません
          </Typography>
        </Box>

        <Paper
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderStyle: "solid",
              borderWidth: 0,
              borderRightWidth: { xs: 0, md: 1 },
              borderBottomWidth: { xs: 1, md: 0 },
              borderColor: "divider",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              このクラスの児童数
            </Typography>
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              {requiredSlots}人
            </Typography>
            <Typography variant="body2">面談が必要な人数です</Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderStyle: "solid",
              borderWidth: 0,
              borderRightWidth: { xs: 0, md: 1 },
              borderBottomWidth: { xs: 1, md: 0 },
              borderColor: "divider",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              現在の空き枠
            </Typography>
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              {availableCount}枠
            </Typography>

            <Typography variant="body2">まだ割り当て可能な枠です</Typography>
          </Box>
          <Box sx={{ display: "flex", flex: 3 }}>
            <Box
              sx={{
                flex: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                枠の過不足
              </Typography>

              <Typography variant="body2">
                {remainSlots >= 0 ? (
                  <>
                    必要{" "}
                    <Box
                      component="span"
                      sx={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                    >
                      {" "}
                      {requiredSlots}枠{" "}
                    </Box>
                    に対して、
                    <br /> あと
                    <Box
                      component="span"
                      sx={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                    >
                      {" "}
                      {remainSlots}枠{" "}
                    </Box>
                    の余裕があります
                  </>
                ) : (
                  <>
                    必要
                    <Box
                      component="span"
                      sx={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                    >
                      {" "}
                      {requiredSlots}枠{" "}
                    </Box>
                    に対して、
                    <br />
                    <Box
                      component="span"
                      sx={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                    >
                      {" "}
                      {Math.abs(remainSlots)}枠{" "}
                    </Box>
                    不足しています
                  </>
                )}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  backgroundColor:
                    remainSlots > 0
                      ? "#e8f5ee"
                      : remainSlots === 0
                        ? "#fff4e5"
                        : "#fbebec",
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
                ) : remainSlots === 0 ? (
                  <Typography
                    variant="h6"
                    sx={{ color: "warning.dark", fontSize: 12 }}
                  >
                    ⚠ 足りていますが、枠に余裕がありません
                  </Typography>
                ) : (
                  <Typography
                    variant="h6"
                    sx={{
                      color: "error.main",
                      fontSize: 12,
                    }}
                  >
                    ⚠ あと
                    <Box
                      component="span"
                      sx={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "error.main",
                      }}
                    >
                      {" "}
                      {Math.abs(remainSlots)} 枠{" "}
                    </Box>
                    増やしてください
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
        {/* 提出ボタンを押した時の確認ダイアログ */}
        <Dialog open={dialogOpen}>
          <Box sx={{ p: 3 }}>
            <DialogTitle>この内容で提出しますか？</DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <DialogContentText>
                提出後も、面談が入っていない枠は変更できます。
              </DialogContentText>
              <Alert severity={"success"} sx={{ gap: 1 }}>
                今は「対応できる」を
                <Box
                  component="span"
                  sx={{
                    color: "success.main",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  {availableCount} 枠{" "}
                </Box>
                選んでいます。
              </Alert>
              {demoMode === "free" && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Chip
                    label="ゲスト体験"
                    size="small"
                    sx={{ flexShrink: 0 }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    提出と同時に面談の割り当てを実行します。
                    <br />
                    実際の運用では、教頭先生が実行します。
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button variant="outlined" onClick={() => setDialogOpen(false)}>
                戻って修正する
              </Button>
              <Button
                disabled={isSubmitted}
                variant="contained"
                onClick={teacherHandleSubmit}
              >
                {isSubmitted ? "提出中..." : "提出する"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

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
                demoMode !== "free" && slot.status === "reserved"
              }
              onClickSlot={teacherHandleClick}
              onSelectAll={teacherHandleSelectAll}
              onClearAll={teacherHandleClearAll}
              showBlockedNote={false}
              availableLabel="対応できる"
              unavailableLabel="対応できない"
            />
          ))}
        </Box>
        <Box sx={isMobile ? { display: "flex", justifyContent: "center" } : {}}>
          <Button
            sx={{ mt: 3, width: 180 }}
            variant="contained"
            disabled={
              remainSlots < 0 ||
              (demoMode !== "free" && submitted) ||
              isSubmitted
            }
            onClick={() => setDialogOpen(true)}
          >
            {remainSlots < 0
              ? "枠不足のため提出できません"
              : isSubmitted
                ? "提出中..."
                : demoMode !== "free" && submitted
                  ? "提出が完了しました"
                  : "上記の内容で提出する"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
