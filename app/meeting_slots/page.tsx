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
// 面談入れ替え予定一覧の型
type ChangeSlot = {
  from_assignment_id: number;
  to_slot_id: number;
};

export default function MeetingSlotPage() {
  const [slots, setslots] = useState<MeetingSlot[]>([]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDownload, setIsDownload] = useState(false);
  const [submittedChildren, setSubmittedChildren] = useState<MeetingSlot[]>([]);
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
  // 編集先での面談入れ替え（面談表全体を表示）
  const [editingSlots, setEditingSlots] = useState<MeetingSlot[]>([]);
  // 編集先での面談入れ替え予定一覧（API送信用に変化したslotのみ保管）
  const [changeSlotsList, setChangeSlotsList] = useState<ChangeSlot[]>([]);
  // slot移動時の警告
  const [alertOpen, setAlertOpen] = useState(false);
  // キャンセル時の警告
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false);
  // 編集モードか
  const [isEditMode, setIsEditMode] = useState(false);
  // 面談不可日・兄弟の面談表・特別支援の面談表
  const [validSlotsData, setValidSlotsData] = useState<{
    unavailable_start_at: string[];
    siblings_meeting_schedule: MeetingSchedule[][];
    own_support_meeting_schedule: MeetingSchedule[];
  } | null>(null);

  // 編集開始の関数
  const handleStartEdit = () => {
    setIsEditMode(true);
    setEditingSlots(slots); //面談表の中身をコピー
    setChangeSlotsList([]);
  };

  // 編集完了の関数
  const handleFinishEdit = async () => {
    await handleReassign();
    setIsEditMode(false);
  };

  // キャンセルダイアログを呼ぶ
  const handleCancelDialog = () => {
    setCancelAlertOpen(true);
  };
  // キャンセル選択時で「はい」
  const handleCancel = () => {
    setIsEditMode(false);
    setEditingSlots([]);
    setChangeSlotsList([]);
    setFromAssignmentId(null);
    setToSlotId(null);
    setCancelAlertOpen(false);
  };

  // キャンセル選択時で「いいえ」
  const handleDismissCancel = () => {
    setCancelAlertOpen(false);
  };

  // 編集リセットボタンの関数
  const handleEditReset = () => {
    setFromAssignmentId(null);
    setToSlotId(null);
  };

  // 変更案内時に「いいえ」を押した時の関数
  const handleCancelFinishAlert = () => {
    handleEditReset();
    setAlertOpen(false);
  };

  // 案内表示で「はい」を押した時の関数
  const handleApplyChange = () => {
    if (fromAssignmentId === null || toSlotId === null) {
      return; //もし中身がnullならここで終了する
    }
    // fromAssignmentIdとtoSlotIdに情報を持たせる（現時点では、番号のみしか持っていない）
    const fromSlot = editingSlots.find(
      (slot) => slot.assignment_id === fromAssignmentId,
    );
    const toSlot = editingSlots.find((slot) => slot.id === toSlotId);
    // 画面上で再描写する時の関数
    const newEditingSlots = editingSlots.map((slot) => {
      if (slot.assignment_id === fromAssignmentId) {
        return {
          ...slot,
          child_name: toSlot?.child_name ?? "",
          assignment_id: toSlot?.assignment_id ?? null,
        };
      } else if (slot.id === toSlotId) {
        return {
          ...slot,
          child_name: fromSlot?.child_name ?? "",
          assignment_id: fromSlot?.assignment_id ?? null,
        };
      } else {
        return slot;
      }
    });

    // 編集した面談のデータ（再描写）
    setEditingSlots(newEditingSlots);
    // APIでRailsに送る面談のデータ（送る用）
    setChangeSlotsList([
      ...changeSlotsList,
      {
        from_assignment_id: fromAssignmentId,
        to_slot_id: toSlotId,
      },
    ]);
    setAlertOpen(false);
    handleEditReset();
  };

  // １回目の選択と２回目の選択で分岐
  const handleFromToSelect = (cell: MeetingSlot) => {
    if (fromAssignmentId === null) {
      setFromAssignmentId(cell?.assignment_id);
    } else if (fromAssignmentId === cell?.assignment_id) {
      setFromAssignmentId(null);
    } else {
      setToSlotId(cell?.id);
      setAlertOpen(true);
    }
  };

  // 面談slot編集・編集完了
  const handleReassign = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ assignments: changeSlotsList }),
      },
    );
    const data = await res.json();
    setslots(data);
  };

  // １つのassignment_slotを選んだ時の情報を取得
  const AssignmentHandleClick = async (id: number) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${id}/valid_slots`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await res.json();
    setValidSlotsData(data);
    if (
      data.siblings_meeting_schedule.length > 0 ||
      data.own_support_meeting_schedule.length > 0
    ) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    // indexメソッドを呼ぶ
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("データ取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        // 空で返ってくる場合は、createメソッドへリクエスト
        if (data.length === 0) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUnassignedChildren(data);
      });
  }, [router]);

  // PDFをダウンロードする
  const handleDownLoadPDF = async () => {
    setIsDownload(true);
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
    setIsDownload(false);
  };

  // 編集中であればeditingSlotsを使う
  const matrix = buildMatrix(isEditMode ? editingSlots : slots);

  // 全slotの面談表（メイン）
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
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          maxHeight: 680,
          // 編集モードの枠線
          border: isEditMode ? "1px solid" : "none",
          borderColor: isEditMode ? "primary.main" : "none",
        }}
      >
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
              {isEditMode ? (
                <Box sx={{ display: "flex", gap: 5 }}>
                  <Box>
                    <Button onClick={handleFinishEdit}>編集完了</Button>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={handleEditReset}>選択解除</Button>
                    <Button
                      sx={{ color: "grey.600" }}
                      onClick={handleCancelDialog}
                    >
                      キャンセル
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button onClick={handleStartEdit}>面談編集</Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleDownLoadPDF}
                    disabled={isDownload}
                  >
                    {isDownload ? "ダウンロード中" : "PDFをダウンロード"}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
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
                        onClick={() => {
                          const id = matrix[time][date].assignment_id;
                          if (isEditMode) {
                            // 編集モードだと入れ替えが可能
                            handleFromToSelect(matrix[time][date]);
                          } else if (id === null) {
                            // 空きマスは、何もしない（SlotAddPopoverが、独立して、動く）
                          } else {
                            // 通常モードだと、児童詳細の取得
                            AssignmentHandleClick(id);
                          }
                        }}
                        sx={{
                          flex: 1,
                          minWidth: "120px",
                          cursor: "pointer", // マウスを乗せたとき、指マークになる
                          "&:hover": {
                            backgroundColor: "action.hover", //  ホバー時に、薄く色がつく
                          },
                          p: 1,
                          minHeight: "80px",
                          borderRadius: 1,
                          // 選択中の枠線(編集中)
                          border:
                            matrix[time][date]?.assignment_id ===
                              fromAssignmentId ||
                            matrix[time][date]?.id === toSlotId
                              ? "solid 2px "
                              : "solid 1px ",
                          borderColor:
                            matrix[time][date]?.assignment_id ===
                            fromAssignmentId
                              ? "primary.main"
                              : matrix[time][date]?.id === toSlotId
                                ? "error.main"
                                : "divider",
                        }}
                      >
                        {matrix[time][date]?.child_name ? (
                          <>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Typography variant="body1">
                                {matrix[time][date].child_name}
                              </Typography>
                              {matrix[time][date].submitted === false && (
                                <Chip
                                  variant="outlined"
                                  label="未提出"
                                  color="warning"
                                  size="small"
                                />
                              )}
                            </Box>

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
                            {/* 空きに児童を追加する */}
                            <SlotAddPopover
                              slotId={matrix[time][date].id}
                              dateLabel={date}
                              timeLabel={time}
                              onAdded={() => {
                                const token = localStorage.getItem("token");
                                // １つ目：meeting_slotを再取得
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
                                // 2つ目：children/unassignedを再取得
                                fetch(
                                  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                )
                                  .then((res) => res.json())
                                  .then((data) => setUnassignedChildren(data));
                              }}
                            ></SlotAddPopover>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
              {/* 面談児童入れ替え時の案内表示 */}
              <Box>
                <Dialog open={alertOpen} onClose={handleCancelFinishAlert}>
                  <DialogTitle>{"変更してもよろしいですか"}</DialogTitle>
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
              {/* キャンセルを押した時の案内表示 */}
              <Box>
                <Dialog open={cancelAlertOpen} onClose={handleDismissCancel}>
                  <DialogTitle>{"キャンセルしてもよろしいですか"}</DialogTitle>
                  <DialogActions>
                    <Button
                      // 編集用の面談表を再描写
                      onClick={handleCancel}
                    >
                      はい
                    </Button>
                    <Button onClick={handleDismissCancel} autoFocus>
                      いいえ
                    </Button>
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
                  <Box sx={{ width: 700, p: 2 }}>
                    {/* validSlotsDataがnullじゃないなら実行する */}
                    {validSlotsData && (
                      <Box>
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
                            const scheduleDates = [
                              ...new Set(
                                schedule.slots.map((s) =>
                                  formatDate(s.start_at),
                                ),
                              ),
                            ].sort();
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
                                  const siblingsScheduleDates = [
                                    ...new Set(
                                      schedule.slots.map((s) =>
                                        formatDate(s.start_at),
                                      ),
                                    ),
                                  ].sort();
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
