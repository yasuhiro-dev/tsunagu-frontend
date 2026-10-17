import { RedirectMap } from "@/utils/demoLogin";

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
  | "my_schedule";

export type DemoGuideContent = {
  title: string;
  purpose?: string;
  heading?: string;
  steps?: string[];
  note?: string;
  color: string;
  chip: string;
  buttonLabel: string;
  buttonUrl?: string;
  buttonCancel?: string;
  nextDemoRole?: keyof RedirectMap; //DEMO_ACCOUNTSではキーが決められているため、３つのキーを指定する
};

export const demoPageContent: Record<DemoPage, DemoGuideContent> = {
  teacher_unavailability: {
    title: "STEP 1 / 6 ",
    chip: "教師",
    color: "primary.main",
    heading: "出張で、面談に対応できない日時を登録する画面です。",
    steps: ["対応できない日時を「× 対応できない」にしてください。"],
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
    chip: "保護者",
    color: "#d18a94",
    heading: "面談に参加できる日時を選んでみましょう。",
    steps: ["参加できる日時を「○ 参加できる」にしてください。"],
    note: "※提出後は変更できません。",
    buttonLabel: "やってみる",
  },

  family_submitted: {
    title: "STEP 2 / 6",
    chip: "完了",
    color: "#d18a94",
    heading: "来校できる日時の提出が完了しました。",
    purpose: "次は管理者が、面談日時を自動で割り当てます。",
    steps: [],
    buttonLabel: "次へ:管理者の画面",
    buttonCancel: "閉じる",
    buttonUrl: "/admin?tab=1",
    nextDemoRole: "admin",
  },

  admin_assignment: {
    title: "STEP 3 / 6",
    chip: "管理者",
    color: "success.main",
    heading: "教師と保護者の希望から、面談日程を自動で割り当てます。",
    steps: ["「割り当てを実行する」を押して、結果を確認してみましょう。"],
    buttonLabel: "やってみる",
  },
  assignment_button: {
    title: "STEP 3 / 6",
    chip: "完了",
    color: "success.main",
    heading: "自動割り当てが完了しました。",
    purpose: "次は教師が、面談表を確認・調整します。",
    steps: ["条件に合う枠がなかった児童は、次の画面で手動で割り当てます。"],
    buttonLabel: "次へ:教師の画面",
    buttonCancel: "閉じる",
    buttonUrl: "/meeting_slots",
    nextDemoRole: "teacher",
  },
  teacher_meeting_slots: {
    title: "STEP 4 / 6",
    chip: "教師",
    color: "primary.main",
    heading: "自動で入らなかった児童を、手動で割り当てましょう。",
    steps: [
      "希望の時間がすでに埋まっている児童を、あえて用意しています。",
      "保護者と電話で相談できた想定で、空いている枠に入れてください。",
      "割り当て済みの児童も、クリックすると別の枠へ移動できます。",
    ],
    buttonLabel: "面談の調整をはじめる",
  },

  admin_mail_send: {
    title: "STEP 5 / 6",
    chip: "管理者",
    color: "success.main",
    heading: "「送信する」から、保護者へ決定メールを送りましょう。",
    steps: ["※デモのため、実際にメールは送信されません。"],
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
    chip: "保護者",
    color: "#d18a94",
    heading: "決まった面談日時を確認しましょう。",
    steps: [
      "STEP 2で提出した希望をもとに決まっています。",
      "兄弟の面談は、連続した時間にまとめています。",
    ],
    buttonLabel: "確認する",
  },
};
