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
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { teacherUnavailableBg } from "@/app/patterns";
import { highlightSx } from "@/app/highlight";

type ChildAvailability = {
  siblings_start_at: string[];
  own_support_start_at: string[];
  available_start_at: string[];
  submitted: boolean;
  support_info: { class_room: string; teacher: string } | null;
  siblings_info: {
    name: string;
    class_room: string | null;
    child_id: number;
  }[];
};

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
//変更前の状態を保存する型
type EditDialogInfo = {
  fromStartAt: string;
  fromName: string;
  toStartAt: string;
  toName: string;
  isSwap: boolean;
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
  available_start_at: string[]; //保護者が来校できると答えた時刻
};
//兄弟情報を取得
const getSiblingsInfo = (data: ChildAvailability | null) => {
  //兄弟の開始時刻
  const startAt = data?.siblings_start_at[0];
  //兄弟のクラス名
  const siblingClassRoom = data?.siblings_info[0]?.class_room;
  //兄弟名
  const siblingName = data?.siblings_info[0]?.name;
  return { name: siblingName, classRoom: siblingClassRoom, startAt };
};
//特別支援情報を取得
const getSupportInfo = (data: ChildAvailability | null) => {
  //特支の開始時刻
  const startAt = data?.own_support_start_at[0];
  //特支のクラス名
  const supportClassRoom = data?.support_info?.class_room;
  //特支の担任名
  const supportTeacher = data?.support_info?.teacher;
  return {
    classRoom: supportClassRoom,
    teacher: supportTeacher,
    startAt,
  };
};
// 保護者が来られない時刻か（未提出なら制約なし）
const isParentUnavailable = (data: ChildAvailability | null, startAt: string) =>
  !!data?.submitted && !data?.available_start_at.includes(startAt);

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
  const [editDialogInfo, setEditDialogInfo] = useState<EditDialogInfo | null>(
    null,
  );
  const [selectedChild, setSelectedChild] = useState<UnassignedChildren | null>(
    null,
  );
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const [unassignedChildren, setUnassignedChildren] = useState<
    UnassignedChildren[]
  >([]);
  //希望日などを取得
  const [availabilityByChild, setAvailabilityByChild] = useState<
    Record<string, ChildAvailability>
  >({});

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
  //変更ダイアログに変更した児童名を表示する設定
  const fromSlot =
    slots.find(
      (slot) => slot.assignment_id === fromAssignmentId, //移動元（空枠を選ばないように児童がいるassignment_id/slot.idに合わせるため）
    ) ?? null;
  const toSlot = slots.find((slot) => slot.id === toSlotId) ?? null; //移動先（空枠も含まれるのでslot.id）
  // 今選んでいる子のID（未割り当ての子 か、マスで選んだ子）
  const selectedChildId = selectedChild?.id ?? fromSlot?.child_id;
  // その子の制約（来校できる日時・兄弟・特支）を箱から取り出す（毎回の描画で計算し直す）
  const validSlotsData =
    selectedChildId != null
      ? (availabilityByChild[String(selectedChildId)] ?? null)
      : null;
  const siblingsIds =
    validSlotsData?.siblings_info.map((s) => s.child_id) ?? [];
  //ドロワーから面談表を取得する
  const [drawerData, setDrawerData] = useState<ValidSlotsData | null>(null);
  //兄弟の情報をコンポーネントから取得する→これをgetSiblingsInfoで呼ぶ
  const siblingInfo = getSiblingsInfo(validSlotsData);
  //特支の情報をコンポーネントから取得する→これをgetSupportInfoで呼ぶ
  const supportInfo = getSupportInfo(validSlotsData);
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
    setUnassignedGuideOpen(false); // 割り当てのダイアログを閉じる
    setEditAlertOpen(false); // 移動のダイアログを閉じる
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
  const handleFromToSelect = (cell: MeetingSlot) => {
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
      setFromAssignmentId(cell?.assignment_id); // validSlotsData はこの子の分に自動で切り替わる
      setHighlightedSlotIds([]);
    } else if (fromAssignmentId === cell?.assignment_id) {
      //選択してもう一度同じところを選択(移動元と同じ枠（取消）)
      setFromAssignmentId(null); // validSlotsData も自動で null になる
    } else {
      // ２回目移動さきを選択の場合、
      setToSlotId(cell?.id);
      // 移動先に他の児童が入っている場合
      const dataB = cell.assignment_id
        ? (availabilityByChild[String(cell.child_id)] ?? null) // 移動先の児童のデータを箱から取り出す
        : null; //もしいなければ何も返さない（情報がないため）
      endTour();
      if (!fromSlot) return;
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
      setViolations([...violationsA, ...violationsB]); //2つのリストを1つに合体

      setEditDialogInfo({
        fromStartAt: fromSlot.start_at,
        fromName: fromSlot.child_name,
        toStartAt: cell.start_at,
        toName: cell.child_name,
        isSwap: Boolean(cell.assignment_id),
      });
    }
  };
  //　兄弟/特支が連続（15分）かどうかを判断する関数
  const isNextTo = (a: string, b: string) => {
    const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime()); //２つのslotの日時を計算できる形に変換（差を表す）
    return diff === 15 * 60 * 1000; //差がちょうど15分なら true、それ以外は false を返す
  };

  // 移動しても良いかを判断する関数（引数を受け取る）
  const checkPlacement = (
    data: ChildAvailability | null,
    slot: MeetingSlot,
    fromStartAt?: string,
    childName?: string,
  ) => {
    const name = childName ? `${childName}さん` : "この児童";
    const violations: Violation[] = []; //中身が空の配列 [] を用意
    //保護者の不可日の時間が含まれている場合
    if (isParentUnavailable(data, slot.start_at)) {
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
      fetchChildData(); // 兄弟・特支の時刻が変わることがあるので取り直す
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
  };

  // 面談不可日・兄弟関係を取得（childのid　未割り当て児童）
  const handleSelectChild = (child: UnassignedChildren) => {
    if (selectedChild?.id === child.id) {
      //1回目に選択した児童と２回目に選択した児童が同じなら
      setSelectedChild(null); //選択中を解除（validSlotsData も自動で null になる）
      setHighlightedSlotIds([]);
      return;
    }
    setSelectedChild(child); //今選択している児童を状態として保存（validSlotsData はこの子の分に自動で切り替わる）
    setFromAssignmentId(null); //割り当て と 入れ替えが混ざらないようにリセット
  };

  // クラスの全児童の制約（来校できる日時・兄弟・特支）をまとめて取得する
  const fetchAvailability = () => {
    fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/child_availabilities`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("児童の情報の取得に失敗しました");
        return res.json();
      })
      .then((data) => setAvailabilityByChild(data))
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    //クラスの全児童の情報を取得（希望日時・兄弟・特支）
    fetchAvailability();

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
        // 未割り当て児童がいるときだけ、最初の1人を選ぶ
        if (data.length > 0) setSelectedChild(data[0]);
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
    if (!child.submitted) return "来校できる日時が未提出";
    const times = child.available_start_at;
    // 多いと欄からあふれるので、3枠までは日時を、それより多いときは件数を出す
    if (times.length > 3) return `来校できる日時：${times.length}枠`;
    const label = times
      .map((t) => `${formatDate(t)} ${formatTime(t)}`)
      .join("、");
    return `来校できる日時：${label}${times.length === 1 ? " のみ" : ""}`;
  };

  const isEditing = fromAssignmentId !== null;
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
    // 3つ目：兄弟・特支の時刻が変わることがあるので、制約も取り直す
    fetchAvailability();
  };

  //バーナーが３つあるため、今どのバナーを出すかを判定
  let selectMode;
  if (selectedChild) {
    //未割り当て児童
    selectMode = "assign";
  } else if (isEditing) {
    //編集中
    selectMode = "move";
  } else {
    selectMode = "normal"; //何も選択していない
  }
  //枠を選択時の分岐
  const isCellClickable = (assignmentId: number | null) => {
    if (selectMode === "normal") return assignmentId != null; //何も選択していない時、枠に児童が入っている場合true
    if (selectMode === "assign") return assignmentId == null; //未割り当て児童を選択している時、何も入っていなければtrue
    return true; //選択している時、空きも割り当てもtrue
  };

  //選んだ児童の来校できる日時
  const availableSlots = validSlotsData?.available_start_at;
  //選択しているか
  const isSelectId = fromAssignmentId !== null;
  //ハイライトを当てる空き枠を見つける
  const highlightedSlots =
    demoMode === "guided" &&
    slots.filter((s) => s.status === "available").map((s) => s.id);
  //未割り当て児童がいる場合;
  const hasUnassigned = unassignedChildren.length > 0;

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

              {/* pにすると globals.css の「最後の行に1文字だけ残さない」指定が効く */}
              <Typography
                variant="caption"
                component="p"
                sx={{ color: "text.secondary" }}
              >
                ※来校できる日時が未提出の児童は、日時の制約なしとして割り当てられます
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
                    sx={[
                      { p: 1, fontWeight: "bold", fontSize: 14 },
                      !hasUnassigned && highlightSx,
                    ]}
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
                      面談の一括割り当てへ戻る
                    </Button>
                  )
                )}
              </Box>
            </Box>
          </Box>
          <Box id="tour-teacher-meeting-slots-info" sx={{ display: "grid" }}>
            <Box
              sx={{
                gridArea: "1 / 1",
                visibility: selectMode === "assign" ? "visible" : "hidden",
              }}
            >
              {/* 未割り当て児童を選択したときのバーナー */}
              <Alert
                severity="info"
                sx={{
                  my: 2,
                }}
              >
                <Typography variant="h6">
                  {selectedChild?.child_name}
                  さんの面談の枠を決めてください
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {" "}
                    ①
                    希望の時間に入れられない場合は、保護者に電話で日時を相談してください
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {" "}
                    ② 空いている枠をクリックすると割り当てられます
                  </Typography>
                  {/* スマホは3つ横に並べると1行2〜3文字になるため、縦に並べる */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 0, sm: 1 },
                    }}
                  >
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={(theme) => ({
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            backgroundColor: teacherUnavailableBg(theme, {
                              lineWidth: 1,
                              gap: 2,
                              lineOpacity: 1,
                            }),
                            border: "1px solid",
                            borderColor: "divider",
                          })}
                        />
                        担任の先生の面談できない日時
                      </Box>
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.4),
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                        選んだ児童の来校できる日時
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <TouchAppIcon sx={{ mt: 1, width: 14, height: 14 }} />{" "}
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontSize: "12px" }}
                      >
                        もう一度カードを押すと取消
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Alert>
            </Box>
            <Box
              sx={{
                gridArea: "1 / 1",
                visibility: selectMode === "move" ? "visible" : "hidden",
              }}
            >
              {/* 選択後のバーナー */}
              <Alert
                severity="info"
                sx={{
                  my: 2,
                  height: 110,
                }}
              >
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
                      sx={(theme) => ({
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        backgroundColor: teacherUnavailableBg(theme, {
                          lineWidth: 1,
                          gap: 2,
                          lineOpacity: 1,
                        }),
                        border: "1px solid",
                        borderColor: "divider",
                      })}
                    />
                    <Typography variant="caption">
                      担任の先生の面談できない日時
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={(theme) => ({
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.4),
                        border: "1px solid",
                        borderColor: "divider",
                      })}
                    />
                    <Typography variant="caption">
                      選んだ児童の来校できる日時
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={(theme) => ({
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        backgroundColor: alpha(
                          theme.palette.secondary.main,
                          0.4,
                        ),
                        border: "1px solid",
                        borderColor: "divider",
                      })}
                    />
                    <Typography variant="caption">
                      選んだ児童の兄弟・特支の面談（連続した時間帯が基本）
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <DescriptionIcon
                      sx={{ fontSize: "16px", color: "primary.main" }}
                    />
                    <Typography variant="caption">
                      <Divider
                        sx={{ borderColor: "text.secondary" }}
                        orientation="vertical"
                        flexItem
                      />
                      兄弟・特支の面談表を見る
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            </Box>
            {/* // 選択前のバーナー */}
            <Box
              sx={{
                gridArea: "1 / 1",
                visibility: selectMode === "normal" ? "visible" : "hidden",
              }}
            >
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
                      <Typography variant="body2">
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={(theme) => ({
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            backgroundColor: teacherUnavailableBg(theme, {
                              lineWidth: 1,
                              gap: 2,
                              lineOpacity: 1,
                            }),
                            border: "1px solid",
                            borderColor: "divider",
                          })}
                        />
                        担任の先生の面談できない日時
                      </Box>
                    </Box>
                  </Box>

                  {/* 管理者画面へ遷移するボタン */}
                </Box>
              </Alert>
            </Box>
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
                  {/* 未割り当て児童一覧 */}
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
                          "&:hover": isEditing
                            ? {}
                            : { boxShadow: 3, borderColor: "grey.500" },
                          backgroundColor:
                            selectedChild?.id === child.id
                              ? "action.selected"
                              : "transparent", // 選択中は色を変える
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h6">
                            {child.child_name}
                          </Typography>
                          {selectedChild?.id === child.id && (
                            <Chip
                              label={"選択中"}
                              size="small"
                              color="primary"
                              sx={{ fontSize: 10 }}
                            />
                          )}
                        </Box>

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
                              ☑︎希望の枠が空いています。面談表から割り当ててください
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
                                ⚠︎希望の枠に空きがありません
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "warning.dark",
                                }}
                              >
                                保護者に電話で相談し、
                                <br />
                                決まった時間の枠へ
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
              id="tour_child_assignment"
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
                      const isFrom =
                        fromAssignmentId !== null &&
                        assignmentId === fromAssignmentId; //このセルが選択元か
                      const isTo = cell?.id === toSlotId; //このセルが選択先か
                      const isHighlighted = highlightedSlotIds.includes(
                        cell.id,
                      );
                      //保護者不可日時を取得
                      const isUnavailable = isParentUnavailable(
                        validSlotsData,
                        cell.start_at,
                      );
                      //割り当て児童の希望日
                      const isPreferred = !isUnavailable && isSelectId;
                      //未割り当て児童の希望日
                      const unassignedIsPreferred =
                        !isUnavailable && selectedChild;
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
                      //空き枠（担任の不可日を除く）
                      const isAvailable = cell?.status === "available";
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

                      //選択中の時の空き枠のツールチップ
                      const tooltipText = () => {
                        // 何も選んでいない：空き枠だけ案内（子がいる枠は押すと選べるので出さない）
                        if (!selectedChild && !isSelectId)
                          return assignmentId ? "" : "先に児童を選んでください";
                        // 選んでいる子自身の枠（押すと取消）
                        if (isFrom) return "";
                        // 未割り当ての子を選択中：子がいる枠は押しても何も起きない
                        if (selectedChild && assignmentId) return "";
                        if (isTeacherUnavailable)
                          return "担任の先生の面談できない日時";
                        if (isUnavailable) return "保護者の希望外（要相談）";
                        return "";
                      };
                      //枠のラベル（未割り当てと割り当て済みで分岐）
                      const slotLabel = () => {
                        if (selectedChild && !isUnavailable)
                          return (
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
                              <AddIcon fontSize="small" />
                              {selectedChild.child_name}さんを割り当てる
                            </Box>
                          );
                        if (isSelectId && !isBlocked)
                          return (
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
                              <AddIcon fontSize="small" />
                              ここに入れる
                            </Box>
                          );
                        return null;
                      };
                      const clickable = isCellClickable(assignmentId);
                      return (
                        <Tooltip key={date} title={tooltipText()} followCursor>
                          <Box
                            onClick={() => {
                              handleFromToSelect(cell);
                            }}
                            sx={(theme) => ({
                              position: "relative",
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                              minWidth: "120px",
                              minHeight: "80px",
                              borderRadius: 1,
                              backgroundColor: isFrom
                                ? alpha(theme.palette.primary.main, 0.2) // 移動元
                                : isPreferred || unassignedIsPreferred
                                  ? alpha(theme.palette.primary.light, 0.25) // 保護者面談不可日()
                                  : isHighlighted
                                    ? alpha(theme.palette.success.light, 0.4) // 変更決定後のハイライト
                                    : "transparent", // 通常
                              // 教師面談不可日は、斜線を出す
                              ...(isTeacherUnavailable &&
                                teacherUnavailableBg(theme)),
                              cursor: clickable ? "pointer" : "default",
                              //選択前と未割り当て＆割り当て時のホバー
                              "&:hover": clickable
                                ? {
                                    boxShadow: 3,
                                    borderColor: "grey.500",
                                  }
                                : {},

                              // 選択中の枠線
                              border:
                                isFrom || isTo ? "solid 2px " : "solid 1px ",
                              borderColor: isFrom
                                ? "primary.main"
                                : isTo
                                  ? "warning.main"
                                  : "divider",
                            })}
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
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                    }}
                                  >
                                    <Typography variant="body1">
                                      {cell.child_name}
                                    </Typography>

                                    {availableSlots &&
                                      selectedChild &&
                                      availableSlots.includes(
                                        cell.start_at,
                                      ) && (
                                        <Chip
                                          sx={{
                                            fontSize: 12,
                                            height: "auto",
                                            "& .MuiChip-label": {
                                              whiteSpace: "normal",
                                            },
                                          }}
                                          color="primary"
                                          size="small"
                                          variant="outlined"
                                          label={
                                            <>
                                              {selectedChild.child_name}さんと
                                              <br />
                                              希望が重複
                                            </>
                                          }
                                          icon={<PeopleAltOutlinedIcon />}
                                        />
                                      )}
                                  </Box>

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

                                {/* 未提出：セルの下端に固定 */}
                              </Box>
                            ) : (
                              <Box
                                id={
                                  isAvailable
                                    ? "tour-teacher-meeting-slos-add-popbar"
                                    : undefined
                                }
                                sx={[
                                  {
                                    textAlign: "center",
                                    minHeight: "78px",
                                  },
                                  highlightedSlots && //空き枠
                                    isAvailable && //空き枠（担任を除く）
                                    hasUnassigned && //未割り当て児童がいない
                                    highlightSx,
                                ]}
                              >
                                {/* 空きに児童を追加する */}

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
                                  <Typography variant="caption">
                                    {slotLabel()}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                left: 1,
                                right: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.25,
                              }}
                            >
                              {isSiblingSlot && (
                                <Box
                                  sx={{
                                    backgroundColor: (theme) =>
                                      alpha(theme.palette.secondary.main, 0.12),
                                    color: "secondary.dark",
                                    borderLeft: "3px solid",
                                    borderColor: "secondary.main",
                                    px: 0.5,
                                    borderRadius: 0.5,

                                    bottom: 0,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ display: "block", lineHeight: 1.2 }}
                                  >
                                    {selectedName}さんの兄弟
                                  </Typography>
                                  <Typography variant="caption">
                                    {siblingInfo && siblingInfo.classRoom}{" "}
                                    {siblingInfo && siblingInfo.name}
                                  </Typography>
                                </Box>
                              )}
                              {isSupportSlot && (
                                <Box
                                  sx={{
                                    backgroundColor: (theme) =>
                                      alpha(theme.palette.secondary.main, 0.12),
                                    color: "secondary.dark",
                                    borderLeft: "3px solid",
                                    borderColor: "secondary.main",
                                    px: 0.5,
                                    borderRadius: 0.5,
                                    bottom: 0,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "block",
                                      lineHeight: 1.2,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {selectedName}さんの特支面談
                                  </Typography>
                                  <Typography variant="caption">
                                    {supportInfo && supportInfo.classRoom} (
                                    {supportInfo && supportInfo.teacher}先生)
                                  </Typography>
                                </Box>
                              )}
                              {cell.submitted === false && (
                                <Chip
                                  variant="outlined"
                                  label="未提出"
                                  color="warning"
                                  size="small"
                                  sx={{
                                    maxHeight: "15px",
                                    fontSize: "caption",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Box>

              {/* 面談児童入れ替え時の案内表示 */}
              <Box>
                <Dialog
                  open={editAlertOpen}
                  onClose={handleCancelDialog}
                  slotProps={{
                    transition: {
                      onExited: () => {
                        setFromAssignmentId(null); // 移動元
                        setSelectedChild(null); // 未割り当て児童
                        setToSlotId(null); // 移動先・割り当て先
                        setViolations([]); // 警告
                        setEditDialogInfo(null); //入れ替え前の状態をリセット
                      },
                    },
                  }}
                >
                  <DialogTitle variant="h5">
                    {" "}
                    {editDialogInfo?.isSwap
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
                            {formatDate(editDialogInfo?.fromStartAt ?? "")}
                            {"  "}
                            {formatTime(editDialogInfo?.fromStartAt ?? "")}
                          </Typography>
                        </Box>

                        <Typography>{`${editDialogInfo?.fromName}さん`}</Typography>
                      </Box>
                      {editDialogInfo?.isSwap ? (
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
                            {formatDate(editDialogInfo?.toStartAt ?? "")}
                            {"  "}
                            {formatTime(editDialogInfo?.toStartAt ?? "")}
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {editDialogInfo?.toName
                            ? `${editDialogInfo?.toName}さん`
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
                        : editDialogInfo?.isSwap
                          ? "入れ替える"
                          : "変更する"}
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
              {/* 未割り当て児童を移動する際のダイアログを表示 */}
              <Box>
                <Dialog
                  open={unassignedGuideOpen}
                  slotProps={{
                    transition: {
                      onExited: () => {
                        setFromAssignmentId(null); // 移動元
                        setSelectedChild(null); // 未割り当て児童
                        setToSlotId(null); // 移動先・割り当て先
                        setViolations([]); // 警告
                        setEditDialogInfo(null); //入れ替え前の状態をリセット
                      },
                    },
                  }}
                >
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

                                      const isUnavailable =
                                        drawerData.unavailable_start_at.includes(
                                          cell?.start_at,
                                        );
                                      const getBgColor = (
                                        status: string,
                                        isUnavailable: boolean,
                                      ) => {
                                        if (status === "blocked")
                                          return "grey.300";
                                        if (isUnavailable) return "#ffff";
                                        if (!isUnavailable) return "#d6e4f0";
                                      };
                                      // 選んでいる児童本人の枠か
                                      const isSelf =
                                        selectedChildId != null &&
                                        cell?.child_id === selectedChildId;

                                      return (
                                        <Box
                                          key={date}
                                          sx={(theme) => ({
                                            minHeight: "38.52px",
                                            flex: 1,
                                            textAlign: "center",
                                            fontSize: "11px",
                                            border: "1px solid",
                                            borderColor: "divider",
                                            backgroundColor: getBgColor(
                                              cell?.status,
                                              isUnavailable,
                                            ),
                                            ...(cell?.status === "blocked" &&
                                              teacherUnavailableBg(theme)),
                                            ...(isSelf && {
                                              outline: `3px solid ${theme.palette.primary.main}`,
                                              outlineOffset: "-2px",
                                            }),
                                          })}
                                        >
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

                                            const isUnavailable =
                                              drawerData.unavailable_start_at.includes(
                                                cell?.start_at,
                                              );
                                            const getBgColor = (
                                              status: string,
                                              isUnavailable: boolean,
                                            ) => {
                                              if (isUnavailable) return "#ffff";
                                              if (!isUnavailable)
                                                return "#d6e4f0";
                                            };
                                            const isSiblings =
                                              cell?.child_id != null &&
                                              siblingsIds.includes(
                                                cell?.child_id,
                                              );

                                            return (
                                              <Box
                                                key={date}
                                                sx={(theme) => ({
                                                  minHeight: "38.52px",
                                                  flex: 1,
                                                  textAlign: "center",
                                                  fontSize: "11px",
                                                  border: "1px solid",
                                                  borderColor: "divider",

                                                  backgroundColor: getBgColor(
                                                    cell?.status,
                                                    isUnavailable,
                                                  ),
                                                  ...(cell?.status ===
                                                    "blocked" &&
                                                    teacherUnavailableBg(
                                                      theme,
                                                    )),
                                                  ...(isSiblings && {
                                                    outline: `3px solid ${theme.palette.primary.main}`,
                                                    outlineOffset: "-2px",
                                                  }),
                                                })}
                                              >
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
