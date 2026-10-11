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
  | "admin_mail_send";

export type DemoGuideContent = {
  title: string;
  purpose?: string;
  steps?: string[];
  note?: string;
  buttonLabel: string;
  buttonUrl?: string;
  buttonCancel?: string;
  nextDemoRole?: keyof RedirectMap; //DEMO_ACCOUNTSではキーが決められているため、３つのキーを指定する
};

export const demoPageContent: Record<DemoPage, DemoGuideContent> = {
  teacher_unavailability: {
    title: "ここからは教師の画面です。",
    purpose: "出張や不在など、面談に対応できない日時を登録する画面です。",
    steps: ["対応できない日時を「参加できない」にしてください。"],
    buttonLabel: "はじめる",
  },

  teacher_submitted: {
    title: "面談不可日程の提出が完了しました。",
    purpose: "面談調整はこのあと、保護者側の来校できる日の回答へと進みます。",
    steps: ["次へを押し、保護者の画面もご覧ください。"],
    buttonLabel: "次へ",
    buttonCancel: "閉じる",
    buttonUrl: "/family_unavailabilities",
    nextDemoRole: "parent",
  },
  family_availability: {
    title: "ここからは保護者の画面です。",
    purpose: "面談の日程調整のために、参加できる日時を先生に伝える画面です",
    steps: ["参加できる日時のボタンを押して回答してみましょう。"],
    note: "※提出後は変更できません。",
    buttonLabel: "はじめる",
  },

  family_submitted: {
    title: "面談できる日時の提出が完了しました。",
    purpose: "面談調整はこのあと、管理者による割り当て処理に進みます。",
    steps: ["次へを押し、管理者の画面をご覧ください。"],
    buttonLabel: "次へ",
    buttonCancel: "閉じる",
    buttonUrl: "/admin?tab=1",
    nextDemoRole: "admin",
  },

  admin_assignment: {
    title: "ここからは管理者の画面です。",
    purpose: "教師と保護者の希望をもとに、面談日程を自動で割り当てます。",
    steps: ["「割り当てを実行する」を押して、結果を確認してみましょう。"],
    buttonLabel: "はじめる",
  },
  assignment_button: {
    title: "自動割り当てが完了しました。",
    purpose: "このあと、教師の画面に戻り面談表を確認する流れに進みます。",
    buttonLabel: "次へ",
    buttonCancel: "閉じる",
    buttonUrl: "/meeting_slots",
    nextDemoRole: "teacher",
  },
  teacher_meeting_slots: {
    title: "ここからは教師の画面です。",
    purpose: "面談の日程をこの画面で確認・変更できます。",
    steps: [
      "変更したい1コマをクリックし、続けて移動先のコマをクリックしてください",
    ],
    buttonLabel: "面談の調整をはじめる",
  },
  admin_mail_send: {
    title: "ここからは管理者の画面です",
    purpose: "担任が調整した面談日程を、管理者が保護者へメールで通知します",
    steps: [
      "「メールを送信する」を押してみましょう。",
      "デモのため、実際にメールは送信されません。",
    ],
    buttonLabel: "はじめる",
  },
  assignment_notification: {
    title: "通知の操作が完了しました",
    purpose:
      "ここまでが管理者の操作です。デモのため実際にメールは送信されません。",
    steps: ["次は保護者の画面で、決まった面談日時を確認しましょう。"],
    buttonLabel: "保護者の画面へ進む",
    buttonCancel: "閉じる",
    buttonUrl: "/my_schedule",
    nextDemoRole: "parent",
  },
};
