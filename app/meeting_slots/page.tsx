"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Container from "@mui/material/Container";
import { MeetingSlot, formatDate, formatTime } from "@/utils/dateUtils";
import Drawer from "@mui/material/Drawer";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DemoGuide from "@/app/components/DemoGuide";
import GuideHelp from "@/app/components/GuideHelp";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDemoMode } from "@/utils/useDemoMode";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import { demoLogin, DEMO_ACCOUNTS } from "@/utils/demoLogin";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import { endTour } from "@/utils/startTour";

type Violation = {
  kind: string; //どんな条件か
  detail: string; //具体的な説明
  name: string;
  note?: string;
};

type ValidSlotsData = {
  unavailable_start_at: string[]; //不可日の時間
  siblings_start_at: string[]; //兄弟の時間
  own_support_start_at: string[]; //特別支援の時間
  siblings_meeting_schedule: MeetingSchedule[][]; //兄弟の面談表
  own_support_meeting_schedule: MeetingSchedule[]; //特別支援の面談表
};

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
//未割り当て児童
type UnassignedChildren = {
  id: number;
  child_name: string;
  family_name: string;
  child_name_kana: string;
  submitted: boolean;
  available_start_at: string[]; //保護者が参加できると答えた時刻
};
//兄弟情報を取得
const getSiblingsInfo = (data: ValidSlotsData | null) => {
  //兄弟の開始時刻
  const startAt = data?.siblings_start_at[0];
  //兄弟の面談表
  const slots = data?.siblings_meeting_schedule[0]?.[0]?.slots;
  if (!startAt || !slots) return null;
  //兄弟のクラス名
  const siblingClassRoom =
    data?.siblings_meeting_schedule[0]?.[0]?.class_room_name;
  //兄弟の面談表から、時刻と一致するものを取り出す
  const siblingSlot = slots?.find(
    (slot) => new Date(slot.start_at).getTime() === new Date(startAt).getTime(),
  );
  //兄弟名
  const siblingName = siblingSlot?.child_name;
  return { name: siblingName, classRoom: siblingClassRoom, startAt };
};
//特別支援情報を取得
const getSupportInfo = (
  data: ValidSlotsData | null,
  currentClassRoom: string | null,
) => {
  //特支の開始時刻
  const startAt = data?.own_support_start_at[0];
  //特支の面談表(通常級ではないクラスを取得)
  const supportClassRoom = data?.own_support_meeting_schedule.find(
    (o) => o.class_room_name !== currentClassRoom,
  );
  if (!startAt || !supportClassRoom) return null;
  //支援の面談表から、時刻と一致するものを取り出す
  const supportSlot = supportClassRoom.slots.find(
    (slot) => new Date(slot.start_at).getTime() === new Date(startAt).getTime(),
  );

  //特支の児童名
  const supportName = supportSlot?.child_name;
  //特支の担任名
  const supportTeacher = supportClassRoom.teacher_name;
  return {
    name: supportName,
    classRoom: supportClassRoom.class_room_name,
    teacher: supportTeacher,
    startAt,
  };
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
  const [violations, setViolations] = useState<Violation[]>([]); //違反していた項目
  const [guideOpen, setGuideOpen] = useState(false); //ハイライトガイド
  const [unassignedGuideOpen, setUnassignedGuideOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<UnassignedChildren | null>(
    null,
  );
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const [unassignedChildren, setUnassignedChildren] = useState<
    UnassignedChildren[]
  >([]);

  //ゲストログイン時に、保護者画面への遷移ボタンを消す
  const demoMode = useDemoMode();

  //割り当てされている数（割り当て前にダイアログを表示しない）
  const assignCount = slots.filter((slot) => slot.assignment_id != null).length;
  const classRoom = slots[0]?.class_room;

  //デモログイン(教師→管理者)
  const loginAsAdmin = async (path: string) => {
    try {
      const account = DEMO_ACCOUNTS.admin;
      const email = account.email;
      const password = account.password;
      await demoLogin(email, password);
      window.location.href = path;
    } catch {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("ログインに失敗しました");
    }
  };
  // サイドバー開閉
  const [isOpen, setIsOpen] = useState(false);
  // 移動元のslot
  const [fromAssignmentId, setFromAssignmentId] = useState<number | null>(null);
  // 移動先のslot
  const [toSlotId, setToSlotId] = useState<null | number>(null);
  // slot移動時の警告
  const [editAlertOpen, setEditAlertOpen] = useState(false);
  // 面談不可日・兄弟の面談表・特別支援の面談表（その児童の制約のリスト全部）
  const [validSlotsData, setValidSlotsData] = useState<ValidSlotsData | null>(
    null,
  );
  //ドロワーから面談表を取得する
  const [drawerData, setDrawerData] = useState<ValidSlotsData | null>(null);
  //兄弟の情報をコンポーネントから取得する→これをgetSiblingsInfoで呼ぶ
  const siblingInfo = getSiblingsInfo(validSlotsData);
  //特支の情報をコンポーネントから取得する→これをgetSupportInfoで呼ぶ
  const supportInfo = getSupportInfo(validSlotsData, classRoom);

  // 書類アイコン：面談情報を取得してドロワーを開く
  const DrawerHandleClick = async (id: number) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${id}/valid_slots`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );
    const data: ValidSlotsData = await res.json();
    setDrawerData(data);
    setIsOpen(true);
  };

  // 確認ダイアログでキャンセルを押したとき（移動・割り当て共通）
  const handleCancelDialog = () => {
    setEditAlertOpen(false); // 移動のダイアログを閉じる
    setUnassignedGuideOpen(false); // 割り当てのダイアログを閉じる
    setFromAssignmentId(null); // 移動元
    setSelectedChild(null); // 未割り当て児童
    setToSlotId(null); // 移動先・割り当て先
    setValidSlotsData(null); // 色分け（不可日・兄弟・特支）
    setViolations([]); // 警告
  };

  //割り当て処理(未割り当て児童)
  const handleAssign = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_slot_id: toSlotId,
          child_id: selectedChild?.id,
        }),
      },
    );
    if (!res.ok) {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("割り当てできませんでした");
      return;
    }
    if (toSlotId !== null) {
      setHighlightedSlotIds([toSlotId]);
    }
    setAlertOpen(true);
    setAlertSeverity("success");
    setAlertMessage(`${selectedChild?.child_name}さんを割り当てました`);
    handleCancelDialog();
    fetchChildData(); // 画面を更新
  };

  // １回目の選択と２回目の選択で分岐
  const handleFromToSelect = async (cell: MeetingSlot) => {
    if (selectedChild) {
      if (cell.assignment_id) return; // 未割り当て児童を選択中は、児童が入っているセルは何もしない

      setToSlotId(cell.id);
      // 選んだ児童をこの枠に入れたら、制約に引っかかるか調べる
      const unassignViolations = checkPlacement(
        validSlotsData, // 選んだ児童の制約のリスト
        cell, // 割り当て先の枠
        undefined, // 移動元の時刻（未割り当てなので無い）
        selectedChild.child_name, // 警告に出す名前
      );

      setViolations(unassignViolations); //引っかかったものを保存（ダイアログで警告に使う）
      endTour();
      setUnassignedGuideOpen(true);
      return;
    }
    if (fromAssignmentId === null) {
      //１回目の選択の場合
      if (!cell.assignment_id) return; // 空き枠を１回目に選択しても反応しない
      setFromAssignmentId(cell?.assignment_id);
      const dataA = await fetchValidSlots(cell.assignment_id); //一回目に選択した児童の情報を受け取るdataAに入れる
      setValidSlotsData(dataA); //児童の詳細情報を保存する
      setHighlightedSlotIds([]);
    } else if (fromAssignmentId === cell?.assignment_id) {
      //選択してもう一度同じところを選択(移動元と同じ枠（取消）)
      setFromAssignmentId(null);
      setValidSlotsData(null); //面談詳細をなくす
    } else {
      // ２回目移動さきを選択の場合、
      setToSlotId(cell?.id);
      // 移動先に他の児童が入っている場合
      const dataB = cell.assignment_id
        ? await fetchValidSlots(cell.assignment_id) // 移動先の児童のデータを取得
        : null; //もしいなければ何も返さない（情報がないため）
      endTour();
      setEditAlertOpen(true); //ダイアログが出される
      // １回目に選択した児童（移動元）を２回目に選択した児童の枠（移動先）に置いたらどうなるか
      const violationsA = checkPlacement(
        validSlotsData, //Aの児童の情報
        cell, //Aの移動先の枠
        fromSlot?.start_at, //Aの移動元の時刻
        fromSlot?.child_name,
      );
      // Bを移動先(A)の枠に置いたらどうなるか
      const violationsB =
        dataB && fromSlot
          ? checkPlacement(
              dataB, //Bの児童情報
              fromSlot, //Bの移動先の枠（Aが元いた場所）
              cell.start_at, //Bの移動元の時刻（Aが元いた時刻）
              cell.child_name,
            )
          : [];
      setValidSlotsData(null); //面談詳細をなくす
      setViolations([...violationsA, ...violationsB]); //2つのリストを1つに合体
    }
  };
  //　兄弟/特支が連続（15分）かどうかを判断する関数
  const isNextTo = (a: string, b: string) => {
    const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime()); //２つのslotの日時を計算できる形に変換（差を表す）
    return diff === 15 * 60 * 1000; //差がちょうど15分なら true、それ以外は false を返す
  };

  // 移動しても良いかを判断する関数（引数を受け取る）
  const checkPlacement = (
    data: ValidSlotsData | null,
    slot: MeetingSlot,
    fromStartAt?: string,
    childName?: string,
  ) => {
    const name = childName ? `${childName}さん` : "この児童";
    const violations: Violation[] = []; //中身が空の配列 [] を用意
    //保護者の不可日の時間が含まれている場合
    if (data?.unavailable_start_at?.includes(slot.start_at)) {
      violations.push({
        kind: "parent_unavailable",
        name: name,
        detail: `保護者の都合がつかない時間です`,
        note: "※保護者の了承を得ている場合は、割り当てできます",
      });
    }
    //教師の不可日の時間が含まれている場合
    if (slot?.status === "blocked") {
      violations.push({
        kind: "teacher_unavailable",
        name: name,
        detail: "先生の都合がつかない時間です",
        note: "※予定を調整できる場合は、割り当てできます",
      });
    }
    //兄弟の枠との関係
    if (fromStartAt) {
      const siblings = data?.siblings_start_at ?? []; //兄弟の時刻を持っているなら、その時刻をsiblingsに入れる
      const before = siblings.some((s) => isNextTo(s, fromStartAt)); //移動前に、特支のslotとの差が15分か（連続かどうか）
      const after = siblings.some((s) => isNextTo(s, slot.start_at)); //移動後に、特支のslotとの差が15分か（連続かどうか）
      if (before && !after) {
        violations.push({
          kind: "sibling_not_consecutive",
          detail: "兄弟の面談と連続しなくなります",
          name: name,
        });
      }
    }
    //特別支援の枠との関係
    if (fromStartAt) {
      const own_support = data?.own_support_start_at ?? []; //特支の時刻を持っているなら、その時刻をown_supportに入れる
      const before = own_support.some((o) => isNextTo(o, fromStartAt)); //移動前に、兄弟slotとの差が15分か
      const after = own_support.some((o) => isNextTo(o, slot.start_at)); //移動後に、兄弟slotとの差が15分か
      if (before && !after) {
        violations.push({
          kind: "support_not_consecutive",
          detail: "特別支援学級の面談と連続しなくなります",
          name: name,
        });
      }
    }
    return violations;
  };

  //変更ダイアログに変更した児童名を表示する設定
  const fromSlot =
    slots.find(
      (slot) => slot.assignment_id === fromAssignmentId, //移動元（空枠を選ばないように児童がいるassignment_id/slot.idに合わせるため）
    ) ?? null;
  const toSlot = slots.find((slot) => slot.id === toSlotId) ?? null; //移動先（空枠も含まれるのでslot.id）

  // 選んでいる児童の名前（入れ替え中 or 未割り当て児童の選択中）
  const selectedName = fromSlot?.child_name ?? selectedChild?.child_name;

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
      if (fromSlot == null || toSlotId == null) {
        return;
      }
      setHighlightedSlotIds([fromSlot.id, toSlotId]);
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
    handleCancelDialog();
    setValidSlotsData(null);
  };

  // 面談不可日・兄弟関係を取得（childのid　未割り当て児童）
  const handleSelectChild = async (child: UnassignedChildren) => {
    if (selectedChild?.id === child.id) {
      //1回目に選択した児童と２回目に選択した児童が同じなら
      setSelectedChild(null); //選択中を解除
      setValidSlotsData(null); //制約情報をなくす
      return;
    }
    setSelectedChild(child); //今選択している児童を状態として保存
    setFromAssignmentId(null); //割り当て と 入れ替えが混ざらないようにリセット
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/${child.id}/valid_slots`,
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setValidSlotsData(data);
  };

  // 面談不可日・兄弟関係を取得（assignmentのid）
  const fetchValidSlots = async (id: number) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${id}/valid_slots`, //slotを選んだ１人のidを渡す
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return await res.json();
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
      <Alert severity="success" sx={{ p: 1 }}>
        すべての児童を割り当てました
      </Alert>
    );
  }
  // 未割り当て児童の欄に出す、保護者の希望（残った理由が分かるようにする）
  const availabilityLabel = (child: (typeof unassignedChildren)[number]) => {
    if (!child.submitted) return "希望日時未提出";
    const times = child.available_start_at;
    // 多いと欄からあふれるので、3枠までは日時を、それより多いときは件数を出す
    if (times.length > 3) return `参加できる日時：${times.length}枠`;
    const label = times
      .map((t) => `${formatDate(t)} ${formatTime(t)}`)
      .join("、");
    return `参加できる日時：${label}${times.length === 1 ? " のみ" : ""}`;
  };
  const isEditing = fromAssignmentId !== null;
  const isToSlotExist = Boolean(toSlot?.assignment_id); //選択先がいる場合
  const isViolationExist = violations.length > 0;
  // 未割り当て児童が入れる空き枠があるか
  const hasOpenSlot = (child: (typeof unassignedChildren)[number]) =>
    slots.some(
      (slot) =>
        slot.assignment_id == null && // まだ誰も入っていない
        slot.status !== "blocked" && // 担任の都合がつく
        (!child.submitted || child.available_start_at.includes(slot.start_at)), // 保護者の都合がつく（未提出なら制約なし）
    );

  // グリッドと未割り当てリストを最新にする
  const fetchChildData = () => {
    // １つ目：meeting_slotを再取得
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`)
      .then((res) => res.json())
      .then((data) => setslots(data));
    // 2つ目：children/unassignedを再取得
    fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`,
    )
      .then((res) => res.json())
      .then((data) => setUnassignedChildren(data));
  };

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
        }}
      >
        <Box sx={{ p: 1 }}>
          {guideOpen && (
            <DemoGuide
              open={guideOpen}
              onClose={() => setGuideOpen(false)}
              page="teacher_meeting_slots"
              className={classRoom}
            />
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography variant="h5" gutterBottom>
                  面談表 ({classRoom})
                </Typography>
                <GuideHelp
                  page={
                    assignCount > 0
                      ? "teacher_meeting_slots"
                      : "assignment_before"
                  }
                  className={classRoom}
                />
              </Box>

              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                ※「希望日時未提出」の児童は、日時の制約なしとして割り当てられます
              </Typography>
            </Box>

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
                {assignCount > 0 && demoMode === "guided" ? (
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ p: 1, fontWeight: "bold", fontSize: 14 }}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => loginAsAdmin("/admin?tab=2")}
                  >
                    次へ：保護者へメール送信
                  </Button>
                ) : (
                  demoMode === "guided" && (
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      color="success"
                      onClick={() => loginAsAdmin("/admin?tab=1")}
                    >
                      面談割り当て画面へ戻る
                    </Button>
                  )
                )}
              </Box>
            </Box>
          </Box>
          <Box id="tour-teacher-meeting-slots-info">
            {selectedChild ? (
              <Alert severity="info" sx={{ my: 2, height: 110 }}>
                <Typography variant="h6">
                  {selectedChild.child_name}
                  さんを入れる枠をクリックしてください
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TouchAppIcon
                    sx={{
                      width: 14,
                      height: 14,
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {" "}
                    空いている枠にだけ入れられます。もう一度カードを押すと取消
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    columnGap: 2,
                    rowGap: 0.5,
                    mt: 1,
                    fontSize: "12px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.warning.main, 0.4),
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    担任または保護者の希望外の時間
                  </Box>
                </Box>
              </Alert>
            ) : isEditing ? (
              <Alert severity="info" sx={{ my: 2, height: 110 }}>
                <Typography variant="h6">
                  移動先をクリックしてください
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    同じ児童をもう一度押すと取消
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap", // 画面が狭いときは折り返す
                    alignItems: "center",
                    columnGap: 2,
                    rowGap: 0.5,
                    mt: 1,
                    fontSize: "12px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        minWidth: 14,
                        minHeight: 14,
                        borderRadius: 0.5,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.warning.main, 0.4),
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    担任または保護者の希望外の時間（割り当ては可能）
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <DescriptionIcon
                      sx={{ fontSize: "16px", color: "primary.main" }}
                    />
                    兄弟・特支の面談表を見る
                  </Box>
                  <Divider
                    sx={{ borderColor: "text.secondary" }}
                    orientation="vertical"
                    flexItem
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        backgroundColor: "success.light",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    <Typography variant="caption">
                      選んだ児童の兄弟・特支の面談（連続した時間帯が基本）
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            ) : (
              <Alert
                severity="info"
                sx={{
                  my: 2,
                  height: 110,
                  "& .MuiAlert-message": { flex: 1 },
                }} // メッセージ部分を横いっぱいに広げる
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      児童をクリックすると、面談日時を変更できます
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <TouchAppIcon
                        sx={{
                          width: 14,
                          height: 14,
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        選んだ児童の、移動できない時間と、兄弟・特支の重なりが表示されます
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        columnGap: 2,
                        rowGap: 0.5,
                        mt: 1,
                        fontSize: "12px",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            backgroundColor: (theme) =>
                              alpha(theme.palette.warning.main, 0.4),
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                        担任の先生の面談できない時間
                      </Box>
                    </Box>
                  </Box>

                  {/* 管理者画面へ遷移するボタン */}
                </Box>
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
            <Box
              id="tour-teacher-meeting-slos-unassignedChildren"
              sx={{ width: "200px", flexShrink: 0 }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="span">未割り当て児童</Typography>
                  <Chip
                    label={unassignedChildren.length}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                {assignCount === 0 ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    まだ割り当てされていません
                  </Typography>
                ) : unassignedChildren.length > 0 ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    自動で配置できなかった児童
                  </Typography>
                ) : null}

                <Box
                  sx={{
                    overflow: "auto",
                    maxHeight: "520px",
                  }}
                >
                  {assignCount !== 0 &&
                    (unassignedChildren ?? []).map((child) => (
                      <Box
                        onClick={() => handleSelectChild(child)}
                        key={child.id}
                        sx={{
                          border: "1px solid",
                          borderColor: "error.light",
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          cursor: "pointer",
                          backgroundColor:
                            selectedChild?.id === child.id
                              ? "action.selected"
                              : "transparent", // 選択中は色を変える
                        }}
                      >
                        <Typography variant="body2">
                          {child.child_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          保護者：{child.family_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", color: "text.secondary" }}
                        >
                          {availabilityLabel(child)}
                        </Typography>

                        <Box
                          sx={{
                            mt: 1,
                            p: 0.5,
                            borderRadius: 1,
                            backgroundColor: (theme) =>
                              hasOpenSlot(child)
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.warning.main, 0.1),
                          }}
                        >
                          {hasOpenSlot(child) ? (
                            <Typography
                              variant="caption"
                              sx={{ display: "block", color: "success.dark" }}
                            >
                              ✅希望の枠が空いています。面談表から割り当ててください
                            </Typography>
                          ) : (
                            <>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "warning.dark",
                                }}
                              >
                                ⚠希望の枠は埋まっています
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "warning.dark",
                                }}
                              >
                                電話で別の日時を確認し、
                                <br />
                                選んでから空き枠をクリック
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>
              <Box>
                <Typography
                  component="div"
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  {unassignedSection}
                </Typography>
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

              <Box id="tour-teacher-meeting-slos-are">
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
                      const noAssignId = !assignmentId; //空き枠
                      const isSelectId = fromAssignmentId !== null; //選択していない場合true
                      const hasUnassigned = unassignedChildren.length > 0; //未割り当て児童がいる場合
                      const isFrom =
                        fromAssignmentId !== null &&
                        assignmentId === fromAssignmentId; //このセルが選択元か
                      const isTo = cell?.id === toSlotId; //このセルが選択先か
                      const isHighlighted = highlightedSlotIds.includes(
                        cell.id,
                      );
                      //保護者不可日時を取得
                      const isUnavailable =
                        validSlotsData?.unavailable_start_at?.includes(
                          cell?.start_at,
                        ) ?? false;
                      // 兄弟の面談時間を取得
                      const isSiblingSlot =
                        validSlotsData?.siblings_start_at?.includes(
                          cell?.start_at,
                        ) ?? false;
                      // 特別支援の面談時間を取得
                      const isSupportSlot =
                        validSlotsData?.own_support_start_at?.includes(
                          cell?.start_at,
                        ) ?? false;
                      //教師の面談不可日
                      const isTeacherUnavailable = cell?.status === "blocked";
                      // 保護者または担任の不可日か
                      const isUnavailableTime =
                        isUnavailable || isTeacherUnavailable;
                      // 空き枠なのに、入れられる未割り当て児童がいないか
                      const isEmptyWithNoOneToAssign =
                        !assignmentId && !hasUnassigned;
                      // 何も選んでいないとき、押せない枠か
                      const isBlockedWhileIdle =
                        isUnavailableTime || isEmptyWithNoOneToAssign;

                      // 未割り当て児童を選択中か
                      const isSelectingUnassigned = selectedChild !== null;

                      // この枠を押せないか
                      const isBlocked = (() => {
                        // 未割り当て児童を選択中：人が入っている枠は押せない
                        if (isSelectingUnassigned) return !!assignmentId;
                        // 割り当て済みの児童を移動中：不可日は押せない
                        if (isSelectId) return isUnavailableTime;
                        // 何も選んでいない
                        return isBlockedWhileIdle;
                      })();

                      return (
                        <Box
                          key={date}
                          onClick={() => {
                            handleFromToSelect(cell);
                          }}
                          sx={{
                            position: "relative",
                            display: "flex", // ← 追加
                            flexDirection: "column",
                            backgroundColor: (theme) =>
                              isFrom
                                ? alpha(theme.palette.primary.main, 0.2) // 移動元
                                : isUnavailable
                                  ? alpha(theme.palette.warning.main, 0.15) // 保護者面談不可日
                                  : isTeacherUnavailable
                                    ? alpha(theme.palette.warning.main, 0.15) // 教師面談不可日
                                    : isHighlighted
                                      ? alpha(theme.palette.success.light, 0.4) // 変更決定後のハイライト
                                      : "transparent", // 通常
                            flex: 1,

                            minWidth: "120px",
                            cursor: isBlocked
                              ? "not-allowed" //上の条件のうち１つでも当てはまれば指がバツになる
                              : "pointer", // マウスを乗せたとき、指マークになる

                            "&:hover":
                              isBlocked || noAssignId
                                ? {} // 前の分岐が選択していない場合（true）、何も変えない
                                : {
                                    // 前の分岐が選択している場合（false）、色をつける
                                    backgroundColor: "#d6e4f0",
                                    boxShadow: isBlocked ? "0" : "3", //  ホバー時に、薄く影がつく
                                  },

                            minHeight: "80px",
                            borderRadius: 1,

                            // 選択中の枠線
                            border:
                              isFrom || isTo ? "solid 2px " : "solid 1px ",
                            borderColor: isFrom
                              ? "primary.main"
                              : isTo
                                ? "warning.main"
                                : "divider",
                          }}
                        >
                          {cell?.child_name ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              {/* 名前 + 書類アイコン（横並び） */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Typography variant="body1">
                                  {cell.child_name}
                                </Typography>
                                {isFrom && assignmentId && (
                                  <IconButton
                                    size="small"
                                    sx={{ p: 0.25 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      DrawerHandleClick(assignmentId);
                                    }}
                                  >
                                    <DescriptionIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "primary.main",
                                      }}
                                    />
                                    <ChevronRightIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "primary.main",
                                      }}
                                    />
                                  </IconButton>
                                )}
                              </Box>

                              {/* 希望日時未提出：セルの下端に固定 */}
                              {cell.submitted === false && (
                                <Chip
                                  variant="outlined"
                                  label="希望日時未提出"
                                  color="warning"
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    bottom: 2,
                                    left: 4,
                                    right: 4,
                                    maxHeight: "15px",
                                    fontSize: "caption",
                                  }}
                                />
                              )}
                            </Box>
                          ) : (
                            <Tooltip
                              title={
                                selectedChild
                                  ? ""
                                  : "先に一覧から児童を選んでください"
                              }
                            >
                              <Box
                                id="tour-teacher-meeting-slos-add-popbar"
                                sx={{
                                  textAlign: "center",
                                  minHeight: "78px",
                                }}
                              >
                                {/* 空きに児童を追加する */}

                                {selectedChild && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      color: "primary.main",
                                      alignItems: "center",
                                      pt: 0.25,
                                      gap: 0.5,
                                    }}
                                  >
                                    <AddIcon />
                                    <Typography variant="caption">
                                      {selectedChild.child_name}さんを割り当てる
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Tooltip>
                          )}
                          {isSiblingSlot && (
                            <Box
                              sx={{
                                position: "relative",
                                display: "flex", // ← 追加
                                flexDirection: "column", // ← 追加
                                bottom: 1,
                                width: 145,
                                backgroundColor: "#e8f5ee",
                                color: "success.dark",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ display: "block", lineHeight: 1.2 }}
                              >
                                {selectedName}さんの兄弟
                              </Typography>
                              <Typography variant="body2">
                                {siblingInfo && siblingInfo.classRoom}{" "}
                                {siblingInfo && siblingInfo.name}
                              </Typography>
                            </Box>
                          )}
                          {isSupportSlot && (
                            <Box
                              sx={{
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                bottom: 1,
                                width: 145,
                                backgroundColor: "#e8f5ee",
                                color: "success.dark",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ display: "block", lineHeight: 1.2 }}
                              >
                                {selectedName}さんの特支面談
                              </Typography>
                              <Typography variant="body2">
                                {supportInfo && supportInfo.classRoom} (
                                {supportInfo && supportInfo.teacher}先生)
                              </Typography>
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
                <Dialog open={editAlertOpen} onClose={handleCancelDialog}>
                  <DialogTitle variant="h5">
                    {" "}
                    {isToSlotExist
                      ? "以下の2人の面談時間を入れ替えます"
                      : "以下の児童の面談を、別の時間枠に移動します"}
                  </DialogTitle>

                  <DialogContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          backgroundColor: "#d6e4f0",
                          gap: 1,
                          p: 2,
                          minWidth: 200,
                          minHeight: 100,
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{ color: "primary.main", fontWeight: "bold" }}
                        >
                          現在の時間
                        </Typography>
                        <Box sx={{ backgroundColor: "white", borderRadius: 2 }}>
                          <Typography>
                            {formatDate(fromSlot?.start_at ?? "")}
                            {"  "}
                            {formatTime(fromSlot?.start_at ?? "")}
                          </Typography>
                        </Box>

                        <Typography>{`${fromSlot?.child_name}さん`}</Typography>
                      </Box>
                      {isToSlotExist ? (
                        <SwapHorizIcon
                          sx={{
                            minHeight: 100,
                            color: "primary.main",
                            fontSize: 30,
                            transform: { xs: "rotate(90deg)", md: "none" },
                          }}
                        />
                      ) : (
                        <ArrowForwardIcon
                          sx={{
                            minHeight: 100,
                            color: "primary.main",
                            fontSize: 30,
                            transform: { xs: "rotate(90deg)", md: "none" },
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          backgroundColor: "#e8f5ee",
                          p: 2,
                          minWidth: 200,
                          minHeight: 100,
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{ color: "success.main", fontWeight: "bold" }}
                        >
                          移動先の時間
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: "white",
                            borderRadius: 2,
                          }}
                        >
                          <Typography>
                            {formatDate(toSlot?.start_at ?? "")}
                            {"  "}
                            {formatTime(toSlot?.start_at ?? "")}
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {toSlot?.child_name
                            ? `${toSlot?.child_name}さん`
                            : "空の枠"}
                        </Typography>
                      </Box>
                    </Box>
                  </DialogContent>
                  <DialogContent>
                    {violations.length > 0 && (
                      <>
                        <Alert severity="warning">
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                              <AlertTitle
                                sx={{
                                  color: "warning.main",
                                  fontWeight: "bold",
                                }}
                              >
                                変更する前に、以下を確認してください
                              </AlertTitle>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {violations.map((v, index) => (
                                <Box
                                  component="li"
                                  sx={{ display: "flex", gap: 5 }}
                                  key={index}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "bold", width: 100 }}
                                  >
                                    {v.name}
                                  </Typography>
                                  <Box
                                    sx={{
                                      color: "warning.dark",
                                      backgroundColor: "#fff4e5",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {v.detail}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Alert>
                      </>
                    )}
                  </DialogContent>

                  <DialogActions sx={{ p: 3 }}>
                    <Button
                      variant={isViolationExist ? "contained" : "text"}
                      onClick={handleCancelDialog}
                      autoFocus={isViolationExist}
                    >
                      キャンセル
                    </Button>
                    <Button
                      // 編集用の面談表を再描写

                      onClick={handleApplyChange}
                      autoFocus
                      variant={isViolationExist ? "outlined" : "contained"}
                      color={isViolationExist ? "warning" : "primary"}
                      sx={
                        isViolationExist
                          ? {
                              color: "warning.dark",
                              borderColor: "warning.dark",
                            }
                          : {}
                      }
                    >
                      {isViolationExist
                        ? "このまま変更する"
                        : isToSlotExist
                          ? "入れ替える"
                          : "変更する"}
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
              {/* 未割り当て児童を移動する際のダイアログを表示 */}
              <Box>
                <Dialog open={unassignedGuideOpen}>
                  <DialogTitle variant="h5" sx={{ fontSize: 20 }}>
                    {selectedChild?.child_name}さんを
                    {formatDate(toSlot?.start_at ?? "")}
                    {"  "}
                    {formatTime(toSlot?.start_at ?? "")}
                    に割り当てますか
                  </DialogTitle>

                  <DialogContent>
                    {violations.length > 0 && (
                      <>
                        <Alert severity="warning">
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                              <AlertTitle
                                sx={{
                                  color: "warning.main",
                                  fontWeight: "bold",
                                }}
                              >
                                割り当てる前に、以下を確認してください
                              </AlertTitle>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {violations.map((v, index) => (
                                <Box
                                  component="li"
                                  sx={{ display: "flex", gap: 5 }}
                                  key={index}
                                >
                                  <Box
                                    sx={{
                                      color: "warning.dark",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {v.detail}
                                    </Typography>
                                    {v.kind === "parent_unavailable" && (
                                      <Typography variant="body2">
                                        {selectedChild &&
                                          availabilityLabel(selectedChild)}
                                      </Typography>
                                    )}

                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        color: "text.secondary",
                                      }}
                                    >
                                      {v.note}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Alert>
                      </>
                    )}
                  </DialogContent>
                  <DialogActions sx={{ p: 3 }}>
                    <Button
                      variant={isViolationExist ? "contained" : "text"}
                      onClick={handleCancelDialog}
                      autoFocus={isViolationExist}
                    >
                      キャンセル
                    </Button>
                    <Button
                      // 編集用の面談表を再描写
                      onClick={handleAssign}
                      autoFocus
                      variant={isViolationExist ? "outlined" : "contained"}
                      color={isViolationExist ? "warning" : "primary"}
                      sx={
                        isViolationExist
                          ? {
                              color: "warning.dark",
                              borderColor: "warning.dark",
                            }
                          : {}
                      }
                    >
                      {isViolationExist ? "このまま割り当てる" : "変更する"}
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
                  <Box
                    sx={
                      isMobile
                        ? { width: 300, p: 2, minWidth: 0, overflowX: "auto" }
                        : { width: 700, p: 2 }
                    }
                  >
                    {/* validSlotsDataがnullじゃないなら実行する */}
                    {drawerData && (
                      <Box sx={{ width: 668 }}>
                        {/* 特別支援の面談表があれば表示する */}
                        {drawerData.own_support_meeting_schedule.map(
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
                                              drawerData.unavailable_start_at.includes(
                                                cell?.start_at,
                                              )
                                                ? "warning.light"
                                                : cell?.status === "reserved"
                                                  ? "grey.300"
                                                  : cell?.status === "blocked"
                                                    ? "warning.light"
                                                    : "success.light",
                                          }}
                                        >
                                          {drawerData.unavailable_start_at.includes(
                                            cell?.start_at,
                                          )
                                            ? "不可日"
                                            : cell?.status === "reserved"
                                              ? "予約済"
                                              : cell?.status === "blocked"
                                                ? "担任の先生の都合で不可"
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
                        {drawerData.siblings_meeting_schedule.map(
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
                                                    drawerData.unavailable_start_at.includes(
                                                      cell?.start_at,
                                                    )
                                                      ? "warning.light"
                                                      : cell?.status ===
                                                          "reserved"
                                                        ? "grey.300"
                                                        : cell?.status ===
                                                            "blocked"
                                                          ? "warning.light"
                                                          : "success.light",
                                                }}
                                              >
                                                {drawerData.unavailable_start_at.includes(
                                                  cell?.start_at,
                                                )
                                                  ? "不可日"
                                                  : cell?.status === "reserved"
                                                    ? "予約済"
                                                    : cell?.status === "blocked"
                                                      ? "担任の先生の都合で不可"
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
