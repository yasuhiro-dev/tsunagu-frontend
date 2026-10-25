"use client";

type Child = {
  name: string;
  classroom: string[];
};

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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Alert from "@mui/material/Alert";
import DialogActions from "@mui/material/DialogActions";
import GuideHelp from "@/app/components/GuideHelp";
import DemoGuide from "@/app/components/DemoGuide";
import NextStepButton from "@/app/components/NextStepButton";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
export default function FamilyUnavailability() {
  const router = useRouter();
  const [slots, setSlots] = useState<MeetingSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [deadLine, setDeadLine] = useState<null | string>(null);
  const [blockedSlotStartAt, setBlockedSlotStartAt] = useState<string[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSubmittedDialog, setShowSubmittedDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  // １日分を全て「参加できる」にする関数（保護者）
  const handleSelectAll = async (dateSlots: MeetingSlot[]) => {
    const newIds = dateSlots
      .filter((slot) => !availableSlots.includes(slot.id))
      .filter((slot) => !blockedSlotStartAt.includes(slot.start_at))
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
    console.log("blocked_slots raw:", data);
    setBlockedSlotStartAt(data.map((slot: MeetingSlot) => slot.start_at));
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
      setDialogOpen(false);
      setSubmitted(true);
      setShowSubmittedDialog(true);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage(data.error);
      setDialogOpen(false);
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

    // 保護者が提出しているか(utilsファイル)
    const familyId = decodeToken(token).family_id;
    fetchFamilySubmitted(familyId).then((data) => {
      console.log("family data:", data);
      setSubmitted(data.submitted);
      setChildren(data.children);
    });
    // 他のfetchと依存関係がなく独立して実行できるため、Promise.all で並列に実行する
    const loadDeadline = async () => {
      //scheduleと締切日を取得する
      const scheduleId = await fetchCurrentSchedule();
      const deadline = await fetchDeadline(scheduleId); // 締切日を受け取る
      setDeadLine(deadline); //締切日を再描写する
    };
    const loadingSchedule = async () => {
      //loadDeadline（締切日）とfetchBlockedSlots（教師不可日）を同時に取得
      await Promise.all([fetchBlockedSlots(), loadDeadline()]);
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
  const RECOMMEND_SLOTS = 6;
  const selectedCount = availableSlots.length;
  const isEnough = selectedCount >= RECOMMEND_SLOTS;
  const nonSiblingDouble = selectedCount < 2;
  const getSubmitted = () => {
    if (isPastDeadline) return "提出期限が過ぎました";
    if (submitted) return "提出が完了しました";
    if (availableSlots.length === 0) return "日時を選んでください";
    return "上記の内容で提出する";
  };

  let headingText = "面談に参加できる日時のボタンを押してください";
  if (submitted === true) {
    headingText = "提出済みのため変更できません";
  } else if (isPastDeadline) {
    headingText = "回答期間は終了しました";
  }
  //保護者の児童の情報
  const childrenText = children
    .map((c) => `${c.name}（${c.classroom.join("・")}）`)
    .join("・");

  return (
    <Container sx={{ p: 3 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      {/* 提出完了時の今後の流れのダイアログ */}

      <DemoGuide
        open={showSubmittedDialog}
        onClose={() => setShowSubmittedDialog(false)}
        page="family_submitted"
      />
      {/* 提出ボタンを押した時の確認ダイアログ */}
      <Dialog open={dialogOpen}>
        <Box sx={{ p: 3 }}>
          <DialogTitle>この内容で提出しますか？</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <DialogContentText>
              提出すると、あとから内容を変更できません。
            </DialogContentText>
            <Alert
              severity={
                nonSiblingDouble ? "warning" : isEnough ? "success" : "info"
              }
              sx={{ gap: 1 }}
            >
              今は「参加できる」を
              <Box
                component="span"
                sx={{
                  color: nonSiblingDouble
                    ? "warning.dark"
                    : isEnough
                      ? "success.main"
                      : "primary.main",
                  fontWeight: "bold",
                }}
              >
                {" "}
                {selectedCount} 枠{" "}
              </Box>
              選んでいます。
              <br />
              {nonSiblingDouble ? (
                "きょうだい2人を続けて組むには、同じ日に続けて2枠必要です"
              ) : isEnough ? (
                "自動で面談日時が決まりやすい状態です。"
              ) : (
                <>
                  <Box
                    component="span"
                    sx={{ color: "primary.main", fontWeight: "bold" }}
                  >
                    {RECOMMEND_SLOTS}枠
                  </Box>
                  以上選ぶと、自動で面談日時が決まりやすくなります。
                </>
              )}
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button variant="outlined" onClick={() => setDialogOpen(false)}>
              戻って修正する
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              提出する
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Box>
        <Box
          sx={{
            display: "flex",
            mb: 2,
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6">{headingText}</Typography>
            <GuideHelp page="family_availability" />
          </Box>
          {submitted ? (
            <NextStepButton page={"family_submitted"} />
          ) : (
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {/* 締め切り日がnullでないの場合表示され、nullの場合空文字(初期値がnullのため) */}
              回答締切：{deadLine !== null ? formatDate(deadLine) : null}
            </Typography>
          )}
        </Box>
        <Alert
          severity="info"
          sx={{ "& .MuiAlert-icon": { pt: "14px", fontSize: 20 } }}
        >
          <Stack spacing={1.5}>
            {slots.length > 0 && children.length >= 2 ? (
              <>
                <Typography
                  sx={{ fontSize: { xs: 15, md: 18 }, lineHeight: 1.8 }}
                >
                  締切後、学校で
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    {childrenText}
                  </Box>
                  の面談日時を決め、メールでお知らせします。
                </Typography>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    <Chip
                      label="必須"
                      size="small"
                      color="primary"
                      sx={{ fontSize: 10, flexShrink: 0, mt: 0.5 }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: 15, lineHeight: 1.8 }}>
                        きょうだいの面談を続けて組むため、
                        <Box component="span" sx={{ fontWeight: "bold" }}>
                          同じ日に続けて2つ以上
                        </Box>
                        選んでください。
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        例：{formatDate(slots[0].start_at)}の 15:00〜15:15 と
                        15:15〜15:30
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      fontSize: 15,
                    }}
                  >
                    <Chip
                      label="目安"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: 10 }}
                    />
                    <Typography>
                      <Box component="span">
                        <Box component="span" sx={{ fontWeight: "bold" }}>
                          {RECOMMEND_SLOTS}枠以上{" "}
                        </Box>
                        選んでおくと、面談日時が決まりやすくなります。
                      </Box>
                    </Typography>
                  </Box>
                </Stack>
              </>
            ) : (
              <Box component="span">
                参加できる日時を選んでください。
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  多く選ぶほど
                </Box>
                、面談日時が決まりやすくなります。
              </Box>
            )}
          </Stack>
        </Alert>

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
                submitted ||
                isPastDeadline ||
                blockedSlotStartAt.includes(slot.start_at)
              }
              onClickSlot={handleClick}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              showBlockedNote={true}
              isBlocked={(slot) => blockedSlotStartAt.includes(slot.start_at)}
              availableLabel="参加できる"
              unavailableLabel="参加できない"
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
            onClick={() => setDialogOpen(true)}
          >
            {getSubmitted()}
          </Button>
        </Box>
        {!submitted && !isPastDeadline && availableSlots.length === 0 && (
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            ※選んだ日時が足りません。ページ上部の案内をご確認ください
          </Typography>
        )}
      </Box>
    </Container>
  );
}
