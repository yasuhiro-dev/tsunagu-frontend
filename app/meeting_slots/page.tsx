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
import { MeetingSlot, formatDate, formatTime } from "@/utils/dateUtils";
import Drawer from "@mui/material/Drawer";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Alert from "@mui/material/Alert";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import IconButton from "@mui/material/IconButton";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DemoGuide from "@/app/components/DemoGuide";

// slotsの配列を、時間×日付の表形式に並び替え
const buildMatrix = (slots: MeetingSlot[]) => {
  return slots.reduce(
    (acc, slot) => {
      const time = formatTime(slot.start_at);
      const date = formatDate(slot.start_at);
      // 時間の棚がなければ作る
      if (!acc[time]) acc[time] = {};
      // 時間と日付を組み合わせた位置に、対応するslotを保存
      acc[time][date] = slot; //slot（MeetingSlot）を[time][date]の位置に格納
      return acc;
    },
    {} as Record<string, Record<string, MeetingSlot>>, //accの初期値。型は {時間: {日付: slot}}
  );
};
// 特支・通常級担任の面談表の型
type MeetingSchedule = {
  teacher_name: string;
  class_room_name: string;
  slots: MeetingSlot[];
};

export default function MeetingSlotPage() {
  const [slots, setslots] = useState<MeetingSlot[]>([]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDownload, setIsDownload] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [highlightedSlotIds, setHighlightedSlotIds] = useState<number[]>([]);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const [unassignedChildren, setUnassignedChildren] = useState<
    {
      id: number;
      child_name: string;
      family_name: string;
      child_name_kana: string;
    }[]
  >([]);
  // サイドバー開閉
  const [isOpen, setIsOpen] = useState(false);
  // 移動元のslot
  const [fromAssignmentId, setFromAssignmentId] = useState<number | null>(null);
  // 移動先のslot
  const [toSlotId, setToSlotId] = useState<null | number>(null);
  // slot移動時の警告
  const [editAlertOpen, setEditAlertOpen] = useState(false);
  // 面談不可日・兄弟の面談表・特別支援の面談表
  const [validSlotsData, setValidSlotsData] = useState<{
    unavailable_start_at: string[];
    siblings_meeting_schedule: MeetingSchedule[][];
    own_support_meeting_schedule: MeetingSchedule[];
  } | null>(null);

  // 編集リセットボタンの関数
  const handleEditReset = () => {
    setFromAssignmentId(null);
    setToSlotId(null);
  };

  // 変更案内時に「いいえ」を押した時の関数
  const handleCancelFinishAlert = () => {
    handleEditReset();
    setEditAlertOpen(false);
  };

  // １回目の選択と２回目の選択で分岐
  const handleFromToSelect = (cell: MeetingSlot) => {
    if (fromAssignmentId === null) {
      setFromAssignmentId(cell?.assignment_id);
    } else if (fromAssignmentId === cell?.assignment_id) {
      setFromAssignmentId(null);
    } else {
      setToSlotId(cell?.id);
      setEditAlertOpen(true);
    }
  };
  //変更ダイアログに変更した児童名を表示する設定
  const fromSlot =
    slots.find(
      (slot) => slot.assignment_id === fromAssignmentId, //移動元（空枠を選ばないように児童がいるassignment_id）
    ) ?? null;
  const toSlot = slots.find((slot) => slot.id === toSlotId) ?? null; //移動先（空枠も含まれるのでslot.id）

  // 面談slot編集・編集完了
  const handleReassign = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignments: [
            {
              from_assignment_id: fromAssignmentId,
              to_slot_id: toSlotId,
            },
          ],
        }),
      },
    );
    const data = await res.json();
    setslots(data);
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("変更されました");
      // 移動先や移動元のidがない時には飛ばす、もしあるなら新しい値をstateに保存する
      if (fromAssignmentId == null || toSlotId == null) {
        return;
      }

      setHighlightedSlotIds([fromAssignmentId, toSlotId]);
      setTimeout(() => {
        setHighlightedSlotIds([]);
      }, 3000);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("変更できませんでした");
    }
  };
  // 本当に実行していいかを確認
  const handleApplyChange = async () => {
    if (fromAssignmentId === null || toSlotId === null) {
      return; //もし中身がnullならここで終了する
    }
    await handleReassign();

    setEditAlertOpen(false);
    handleEditReset();
  };

  // 関連する面談情報を取得
  const AssignmentHandleClick = async (id: number) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${id}/valid_slots`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();
    setValidSlotsData(data);
    setIsOpen(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    // indexメソッドを呼ぶ
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error("データ取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        // 空で返ってくる場合は、createメソッドへリクエスト
        if (data.length === 0) {
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`,
            {
              method: "POST",
            },
          )
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              setslots(data);
              setLoading(false);
            });
          // 中身があった場合は、そのままdataを使う
        } else {
          setslots(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    // 未割り当て児童を取得する（children_controller）
    fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`,
      {
        method: "GET",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setUnassignedChildren(data);
      });
  }, [router]);

  // モバイルの時（widthが600px以下の場合trueを返す）
  const isMobile = useMediaQuery("(max-width:600px)");

  // PDFをダウンロードする
  const handleDownLoadPDF = async () => {
    setIsDownload(true);
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/teacher_exports`,
      {
        method: "GET",
      },
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
    setIsDownload(false);
  };

  // 全slotの面談表（メイン）
  // 時刻一覧（"15:00"のような文字列同士の比較でも順序が崩れないためそのままsort）
  const allTimes = [
    ...new Set(slots.map((s) => formatTime(s.start_at))),
  ].sort();
  const dateMap = new Map();
  slots.forEach((s) => {
    // 表示用の文字列（⚪︎月⚪︎日）
    const key = formatDate(s.start_at);
    // 表示用の文字列(key)が未登録の場合のみ、比較用のDateオブジェクトを保存する
    if (!dateMap.has(key)) dateMap.set(key, new Date(s.start_at));
  });
  // 日付部分(09-30と10-01)の大小関係を比較して並び替える
  const allDates = [...dateMap.keys()].sort(
    (a, b) => dateMap.get(a) - dateMap.get(b),
  );

  if (error)
    return (
      <p>データの読み込みに失敗しました。時間をおいて再度お試しください。</p>
    );
  if (loading) return <p>読み込み中...</p>;
  const matrix = buildMatrix(slots);

  let unassignedSection;
  if (unassignedChildren.length === 0) {
    unassignedSection = (
      <Typography>🎉 すべての児童の割り当てが完了しています。</Typography>
    );
  } else {
    unassignedSection = (
      <Typography>
        ⚠️ 未割り当ての児童がいます
        <br />
        児童を割り当てるから手動で配置してください。
      </Typography>
    );
  }
  const isEditing = fromAssignmentId !== null;

  return (
    <Container sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          maxHeight: 800,
        }}
      >
        <Box sx={{ p: 1 }}>
          <DemoGuide role="teacher" />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              面談スケジュール
            </Typography>

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              ※「希望日時未提出」の児童も、都合の悪い日時が申告されていないため通常通り割り当てられます
              <br />※
              枠をクリックして、移動先の枠をクリックすると入れ替えられます
            </Typography>

            <Box
              className="no-print"
              sx={{ alignItems: "center", display: "flex", gap: 1 }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleDownLoadPDF}
                  disabled={isDownload}
                >
                  {isDownload ? "ダウンロード中" : "PDFをダウンロード"}
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ minHeight: "64px" }}>
            {isEditing && (
              <Alert severity="info" sx={{ my: 2 }}>
                移動先の枠を選んでください（もう一度同じ枠を押すと取消）
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "column", md: "row" },
            }}
          >
            <Box sx={{ width: "200px", flexShrink: 0 }}>
              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Typography component="span">未割り当て児童</Typography>
                <Chip
                  label={unassignedChildren.length}
                  color="error"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
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
              <Box>
                {unassignedChildren.length === 0 && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {unassignedSection}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={
                isMobile
                  ? {
                      flex: 1,
                      overflowX: "auto",
                      maxHeight: "400px",
                    }
                  : { flex: 1 }
              }
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ width: "60px", flexShrink: 0 }}></Box>
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
                    {allDates.map((date) => {
                      const cell = matrix[time][date];
                      const assignmentId = cell.assignment_id;
                      return (
                        <Box
                          key={date}
                          onClick={() => {
                            handleFromToSelect(cell);
                          }}
                          sx={{
                            flex: 1,
                            minWidth: "120px",
                            cursor: "pointer", // マウスを乗せたとき、指マークになる
                            "&:hover": {
                              backgroundColor: "action.hover", //  ホバー時に、薄く色がつく
                            },

                            minHeight: "80px",
                            borderRadius: 1,
                            backgroundColor: highlightedSlotIds.includes(
                              cell.id,
                            )
                              ? "warning.light" // ハイライトの色
                              : "transparent", // 通常時は透明
                            // 選択中の枠線
                            border:
                              assignmentId === fromAssignmentId ||
                              cell?.id === toSlotId
                                ? "solid 2px "
                                : "solid 1px ",
                            borderColor:
                              assignmentId === fromAssignmentId
                                ? "primary.main"
                                : cell?.id === toSlotId
                                  ? "error.main"
                                  : "divider",
                          }}
                        >
                          {assignmentId && (
                            <Box>
                              <IconButton
                                size="small"
                                sx={{ fontSize: "14px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  AssignmentHandleClick(assignmentId);
                                }}
                              >
                                <DescriptionIcon
                                  sx={{ color: "primary.main" }}
                                  fontSize="small"
                                />
                                <ChevronRightIcon
                                  sx={{ color: "primary.main" }}
                                  fontSize="small"
                                />
                              </IconButton>
                            </Box>
                          )}
                          {cell?.child_name ? (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                flexDirection: "column",
                              }}
                            >
                              <Typography variant="body1">
                                {cell.child_name}
                              </Typography>
                              {
                                <Chip
                                  variant="outlined"
                                  label="希望日時未提出"
                                  color="warning"
                                  size="small"
                                  sx={{
                                    maxHeight: "15px",
                                    fontSize: "caption",
                                    visibility:
                                      cell.submitted === false
                                        ? "visible"
                                        : "hidden",
                                  }}
                                />
                              }
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                textAlign: "center",
                                minHeight: "30px",
                              }}
                            >
                              {/* 空きに児童を追加する */}
                              <SlotAddPopover
                                isEditing={isEditing}
                                slotId={cell.id}
                                onAdded={() => {
                                  // １つ目：meeting_slotを再取得
                                  fetchWithAuth(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`,
                                  )
                                    .then((res) => res.json())
                                    .then((data) => setslots(data));
                                  // 2つ目：children/unassignedを再取得
                                  fetchWithAuth(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`,
                                  )
                                    .then((res) => res.json())
                                    .then((data) =>
                                      setUnassignedChildren(data),
                                    );
                                }}
                              ></SlotAddPopover>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
              {/* 面談児童入れ替え時の案内表示 */}
              <Box>
                <Dialog open={editAlertOpen} onClose={handleCancelFinishAlert}>
                  <DialogTitle>
                    <Typography>{`${fromSlot?.child_name}さん（${formatDate(fromSlot?.start_at ?? "")} ${formatTime(fromSlot?.start_at ?? "")}）を`}</Typography>
                    <br />{" "}
                    {toSlot && (
                      <Typography>
                        {toSlot.child_name
                          ? `${toSlot.child_name}さん(${formatDate(toSlot.start_at)} ${formatTime(toSlot.start_at)})へ`
                          : `空き枠(${formatDate(toSlot.start_at)} ${formatTime(toSlot.start_at)})へ`}
                      </Typography>
                    )}
                    <br /> <Typography>{`移動します。`}</Typography>
                  </DialogTitle>
                  <DialogActions>
                    <Button
                      // 編集用の面談表を再描写
                      onClick={handleApplyChange}
                      autoFocus
                    >
                      はい
                    </Button>
                    <Button onClick={handleCancelFinishAlert}>いいえ</Button>
                  </DialogActions>
                </Dialog>
              </Box>

              {/* サイドバーの表示 */}
              <Box>
                <Drawer
                  anchor="right"
                  open={isOpen}
                  onClose={() => setIsOpen(false)}
                >
                  <Box
                    sx={
                      isMobile
                        ? { width: 300, p: 2, minWidth: 0, overflowX: "auto" }
                        : { width: 700, p: 2 }
                    }
                  >
                    {/* validSlotsDataがnullじゃないなら実行する */}
                    {validSlotsData && (
                      <Box sx={{ width: 668 }}>
                        {/* 特別支援の面談表があれば表示する */}
                        {validSlotsData.own_support_meeting_schedule.map(
                          (schedule, index) => {
                            // バラバラなslotをまとめる
                            const scheduleMatrix = buildMatrix(schedule.slots);
                            // 時間を並べて見出しの役割
                            const scheduleTimes = [
                              ...new Set(
                                schedule.slots.map((s) =>
                                  formatTime(s.start_at),
                                ),
                              ),
                            ].sort();
                            // 日付を並べて見出しの役割
                            const scheduleDateMap = new Map();
                            schedule.slots.forEach((s) => {
                              // 表示用の文字列（⚪︎月⚪︎日）
                              const key = formatDate(s.start_at);
                              // 表示用の文字列(key)が未登録の場合のみ、比較用のDateオブジェクトを保存する
                              if (!scheduleDateMap.has(key))
                                scheduleDateMap.set(key, new Date(s.start_at));
                            });
                            // 表示は文字列のまま、並び替えはDateオブジェクトの大小で行う
                            const scheduleDates = [
                              ...scheduleDateMap.keys(),
                            ].sort(
                              (a, b) =>
                                scheduleDateMap.get(a) - scheduleDateMap.get(b),
                            );
                            return (
                              <Box key={index} sx={{ p: 2 }}>
                                <Box sx={{ p: 2 }}>
                                  <Typography>
                                    {schedule.teacher_name}先生（
                                    {schedule.class_room_name}）
                                  </Typography>
                                </Box>
                                {/* 日付の見出しを表示 */}
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Box sx={{ width: "50px" }}></Box>
                                  {scheduleDates.map((date) => (
                                    <Box
                                      key={date}
                                      sx={{
                                        flex: 1,
                                        textAlign: "center",
                                        fontSize: "12px",
                                        backgroundColor: "primary.dark",
                                        color: "white",
                                        borderRadius: 1,
                                      }}
                                    >
                                      {/* 「6/1」「6/2」という、文字を表示 */}
                                      {date}
                                    </Box>
                                  ))}
                                </Box>
                                {/* 時間の行の中で、日付ごとのマスを表示 */}
                                {scheduleTimes.map((time) => (
                                  <Box
                                    key={time}
                                    sx={{ display: "flex", gap: 1, mt: 0.5 }}
                                  >
                                    {/* 15:00・・・と表示 */}
                                    <Box
                                      sx={{ width: "50px", fontSize: "12px" }}
                                    >
                                      {time}
                                    </Box>
                                    {/* time と組み合わせて、1マスずつ作る */}
                                    {scheduleDates.map((date) => {
                                      // 面談表の１のセルを定義
                                      const cell = scheduleMatrix[time][date];

                                      return (
                                        <Box
                                          key={date}
                                          sx={{
                                            minHeight: "38.52px",
                                            flex: 1,
                                            textAlign: "center",
                                            fontSize: "11px",
                                            border: "1px solid",
                                            borderColor: "divider",
                                            backgroundColor:
                                              validSlotsData.unavailable_start_at.includes(
                                                cell?.start_at,
                                              )
                                                ? "error.light"
                                                : cell?.status === "reserved"
                                                  ? "grey.300"
                                                  : cell?.status === "blocked"
                                                    ? "warning.light"
                                                    : "success.light",
                                          }}
                                        >
                                          {validSlotsData.unavailable_start_at.includes(
                                            cell?.start_at,
                                          )
                                            ? "不可日"
                                            : cell?.status === "reserved"
                                              ? "予約済"
                                              : cell?.status === "blocked"
                                                ? "教師の都合で不可"
                                                : "空き"}
                                          <Typography variant="body2">
                                            {cell.child_name}
                                          </Typography>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                ))}
                              </Box>
                            );
                          },
                        )}
                        {/* 兄弟の面談表を表示する */}
                        {/* 外側の配列 */}
                        {validSlotsData.siblings_meeting_schedule.map(
                          (siblingSchedules, siblingIndex) => {
                            // 外側の配列のreturn
                            return (
                              <Box key={siblingIndex}>
                                {/* 内側の配列 */}
                                {siblingSchedules.map((schedule, index) => {
                                  // バラバラなslotをまとめる
                                  const siblingsScheduleMatrix = buildMatrix(
                                    schedule.slots,
                                  );
                                  // 時間を並べて見出しの役割
                                  const siblingsScheduleTimes = [
                                    ...new Set(
                                      schedule.slots.map((s) =>
                                        formatTime(s.start_at),
                                      ),
                                    ),
                                  ].sort();
                                  // 日付を並べて見出しの役割
                                  const siblingsScheduleDateMap = new Map();
                                  schedule.slots.forEach((s) => {
                                    const key = formatDate(s.start_at);
                                    if (!siblingsScheduleDateMap.has(key))
                                      siblingsScheduleDateMap.set(
                                        key,
                                        new Date(s.start_at),
                                      );
                                  });
                                  const siblingsScheduleDates = [
                                    ...siblingsScheduleDateMap.keys(),
                                  ].sort(
                                    (a, b) =>
                                      siblingsScheduleDateMap.get(a) -
                                      siblingsScheduleDateMap.get(b),
                                  );
                                  // 内側の配列のreturn
                                  return (
                                    <Box key={index} sx={{ p: 2 }}>
                                      <Box sx={{ p: 2 }}>
                                        <Typography>
                                          {schedule.teacher_name}先生（
                                          {schedule.class_room_name}）
                                        </Typography>
                                      </Box>

                                      {/* 日付の見出しを表示 */}
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <Box sx={{ width: "50px" }}></Box>
                                        {siblingsScheduleDates.map((date) => (
                                          <Box
                                            key={date}
                                            sx={{
                                              flex: 1,
                                              textAlign: "center",
                                              fontSize: "12px",
                                              backgroundColor: "primary.dark",
                                              color: "white",
                                              borderRadius: 1,
                                            }}
                                          >
                                            {date}
                                          </Box>
                                        ))}
                                      </Box>
                                      {/* 時間の行の中で、日付ごとのマスを表示 */}
                                      {siblingsScheduleTimes.map((time) => (
                                        <Box
                                          key={time}
                                          sx={{
                                            display: "flex",
                                            gap: 1,
                                            mt: 0.5,
                                          }}
                                        >
                                          {/* 15:00・・・と表示 */}
                                          <Box
                                            sx={{
                                              width: "50px",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {time}
                                          </Box>
                                          {/* time と組み合わせて、1マスずつ作る */}
                                          {siblingsScheduleDates.map((date) => {
                                            // 面談表の１のセルを定義
                                            const cell =
                                              siblingsScheduleMatrix[time][
                                                date
                                              ];

                                            return (
                                              <Box
                                                key={date}
                                                sx={{
                                                  minHeight: "38.52px",
                                                  flex: 1,
                                                  textAlign: "center",
                                                  fontSize: "11px",
                                                  border: "1px solid",
                                                  borderColor: "divider",
                                                  backgroundColor:
                                                    validSlotsData.unavailable_start_at.includes(
                                                      cell?.start_at,
                                                    )
                                                      ? "error.light"
                                                      : cell?.status ===
                                                          "reserved"
                                                        ? "grey.300"
                                                        : cell?.status ===
                                                            "blocked"
                                                          ? "warning.light"
                                                          : "success.light",
                                                }}
                                              >
                                                {validSlotsData.unavailable_start_at.includes(
                                                  cell?.start_at,
                                                )
                                                  ? "不可日"
                                                  : cell?.status === "reserved"
                                                    ? "予約済"
                                                    : cell?.status === "blocked"
                                                      ? "教師の都合で不可"
                                                      : "空き"}
                                                <Typography variant="body2">
                                                  {cell.child_name}
                                                </Typography>
                                              </Box>
                                            );
                                          })}
                                        </Box>
                                      ))}
                                    </Box>
                                  );
                                })}
                              </Box>
                            );
                          },
                        )}
                      </Box>
                    )}
                  </Box>
                </Drawer>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
