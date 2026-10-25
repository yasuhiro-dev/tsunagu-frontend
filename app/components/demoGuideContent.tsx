import { RedirectMap } from "@/utils/demoLogin";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";

export type DemoPage =
  | "teacher_unavailability"
  | "teacher_meeting_slots"
  | "family_availability"
  | "admin_assignment"
  | "teacher_submitted"
  | "family_submitted"
  | "assignment_button"
  | "assignment_notification"
  | "admin_mail_send"
  | "my_schedule"
  | "assignment_before"
  | "my_schedule_before_submit"
  | "my_schedule_before_assign";

export type DemoGuideContent = {
  title: string;
  purpose?: ReactNode;
  heading?: string;
  steps?: ReactNode[];
  note?: string;
  color: string;
  chip: string;
  buttonLabel: string;
  buttonUrl?: string;
  buttonCancel?: string;
  nextDemoRole?: keyof RedirectMap; //DEMO_ACCOUNTSではキーが決められているため、３つのキーを指定する
};
const ButtonName = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="span"
    sx={{ fontWeight: "bold", color: "primary.main", mx: 0.5 }}
  >
    「{children}」
  </Box>
);

export const demoPageContent: Record<DemoPage, DemoGuideContent> = {
  teacher_unavailability: {
    title: "STEP 1 / 6 ",
    chip: "担任の先生の画面です",
    color: "primary.main",
    heading: "出張で、面談に対応できない日時を登録する画面です。",
    steps: [
      <>
        ① 試しに好きな時間を2つ選んで、<ButtonName>× 対応できない</ButtonName>
        を押す
      </>,
      <>
        ② 画面の一番下にある<ButtonName>上記の内容で提出する</ButtonName>を押す
      </>,
    ],
    buttonLabel: "やってみる",
  },

  teacher_submitted: {
    title: "STEP 1 / 6 ",
    chip: "完了",
    color: "primary.main",
    heading: "面談できない日時を登録しました",
    purpose: "次は保護者が、来校できる日時を提出します。",
    steps: [],
    buttonLabel: "次へ：保護者の画面",
    buttonCancel: "閉じる",
    buttonUrl: "/family_unavailabilities",
    nextDemoRole: "parent",
  },
  family_availability: {
    title: "STEP 2 / 6",
    chip: "保護者の画面です",
    color: "#d18a94",
    heading: "面談に参加できる日時を選んでみましょう",
    steps: [
      <>
        ① 同じ日の続いた時間を2つ以上選んで、
        <ButtonName>○ 参加できる</ButtonName>
        を押す
      </>,
      <>
        ② 画面の一番下にある<ButtonName>上記の内容で提出する</ButtonName>を押す
      </>,
    ],
    note: "※6枠以上選んでおくと、面談日時が決まりやすくなります（デモは2つでOK）",
    buttonLabel: "やってみる",
  },

  family_submitted: {
    title: "STEP 2 / 6",
    chip: "完了",
    color: "#d18a94",
    heading: "来校できる日時の提出が完了しました。",
    purpose: "次は教頭先生が、面談日時を自動で割り当てます。",
    steps: [],
    buttonLabel: "次へ:教頭先生の画面",
    buttonCancel: "閉じる",
    buttonUrl: "/admin?tab=1",
    nextDemoRole: "admin",
  },

  admin_assignment: {
    title: "STEP 3 / 6",
    chip: "教頭先生の画面です",
    color: "success.main",
    heading: "担任の先生と保護者の希望から、面談日程を自動で決めます",
    steps: [
      <>
        ① 画面の右にある<ButtonName>▶ 割り当てを実行する</ButtonName>を押す
      </>,
      <>② 「きょうだいの連続面談」と「全体割り当て率」で結果を確認する</>,
    ],
    buttonLabel: "やってみる",
  },
  assignment_button: {
    title: "STEP 3 / 6",
    chip: "完了",
    color: "success.main",
    heading: "自動割り当てが完了しました。",
    purpose: "次は担任の先生が、面談表を確認・調整します。",
    steps: ["条件に合う枠がなかった児童は、次の画面で手動で割り当てます。"],
    buttonLabel: "次へ:担任の先生の画面",
    buttonCancel: "閉じる",
    buttonUrl: "/meeting_slots",
    nextDemoRole: "teacher",
  },
  teacher_meeting_slots: {
    title: "STEP 4 / 6",
    chip: "担任の先生の画面です",
    color: "primary.main",
    heading: "自動で入らなかった児童を、手で割り当てましょう",
    purpose:
      "希望の枠がすでに埋まっていたため、保護者に電話で確認し\n「別の日でも大丈夫」と言われた想定です。",
    steps: [
      <>
        ① 空いている枠の<ButtonName>＋ 児童を割り当てる</ButtonName>を押す
      </>,
      <>
        ② 終わったら、画面右上の
        <ButtonName>次へ：保護者へメール送信</ButtonName>を押す
      </>,
    ],

    buttonLabel: "面談の調整をはじめる",
  },

  assignment_before: {
    title: "面談表",
    color: "primary.main",
    chip: "担任の先生の画面です",
    heading: "この画面はSTEP 4で使います",
    purpose: "まだ自動割り当てが実行されていないため、面談表は空の状態です。",
    steps: ["デモはSTEP 1から順番に進めると、流れがわかりやすくなります。"],
    buttonLabel: "STEP 1から始める",
    buttonUrl: "/teacher_unavailabilities",
    nextDemoRole: "teacher",
    buttonCancel: "この画面を見てみる",
  },

  admin_mail_send: {
    title: "STEP 5 / 6",
    chip: "教頭先生の画面です",
    color: "success.main",
    heading: "全クラスの面談日時を、保護者へまとめて知らせましょう",
    purpose:
      "どのクラスも面談表の確認が終わった想定です。\n教頭先生が、全クラス分をまとめて送信します。",
    steps: [
      <>
        ① 画面右の<ButtonName>▶ 保護者に送信する</ButtonName>を押す
      </>,
      <>
        ② <ButtonName>届くメールの例を見る</ButtonName>
        で、保護者に届くメールも確認できます
      </>,
    ],
    buttonLabel: "やってみる",
  },
  assignment_notification: {
    title: "STEP 5 / 6",
    chip: "完了",
    color: "success.main",
    heading: "通知の操作が完了しました",
    purpose: "次は保護者が、決まった面談日時を確認します。",
    buttonLabel: "次へ：保護者の画面",
    buttonCancel: "閉じる",
    buttonUrl: "/my_schedule",
    nextDemoRole: "parent",
  },
  my_schedule: {
    title: "STEP 6 / 6",
    chip: "保護者の画面です",
    color: "#d18a94",
    heading: "決まった面談日時を確認しましょう",

    steps: [
      <>① 2人のお子さんの面談が、同じ日の続く時間になっているか確認する</>,
      <>
        ② <ButtonName>カレンダーに追加</ButtonName>
        で、自分のカレンダーに登録もできます
      </>,
    ],
    note: "※これでデモは終わりです。お試しいただきありがとうございました。",
    buttonLabel: "確認する",
  },
  // 保護者がまだ日時を提出していない
  my_schedule_before_submit: {
    title: "面談日時の決定前",
    chip: "保護者の画面です",
    color: "#d18a94",
    heading: "まだ面談日時が決まっていません",
    purpose:
      "学校が面談日時を決めると、この画面に表示されます。\nまだ来校できる日時を提出していません。",
    steps: [
      <>①来校できる日時を提出すると、その中から面談日時が決まります。</>,
      <>②締切までに提出しなかった場合は、学校が日時を決めます。</>,
    ],
    buttonLabel: "来校できる日時を提出する",
    buttonUrl: "/family_unavailabilities",
    nextDemoRole: "parent",
    buttonCancel: "このまま見る",
  },

  // 提出は済んでいて、割り当てがまだ
  my_schedule_before_assign: {
    title: "面談日時の決定前",
    chip: "保護者の画面です",
    color: "#d18a94",
    heading: "まだ面談日時が決まっていません",
    purpose:
      "日時の提出は完了しています。学校（教頭先生）が日程を決めると、\nここに表示されます。",
    steps: [],
    buttonLabel: "教頭先生の画面で日程を決める",
    buttonUrl: "/admin?tab=1",
    nextDemoRole: "admin",
    buttonCancel: "このまま見る",
  },
};
