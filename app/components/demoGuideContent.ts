export type DemoPage =
  | "teacher_unavailability"
  | "teacher_meeting_slots"
  | "family_availability"
  | "admin_assignment"
  | "teacher_submitted"
  | "family_submitted"
  | "assignment_button";

export type DemoGuideContent = {
  title: string;
  purpose?: string;
  steps: string[];
  note?: string;
  buttonLabel: string;
  buttonUrl?: string;
};

export const demoPageContent: Record<DemoPage, DemoGuideContent> = {
  teacher_unavailability: {
    title: "教師として体験します。",
    purpose: "出張や不在など、面談に対応できない日時を登録する画面です。",
    steps: ["対応できない日時を「参加できない」にしてください。"],
    buttonLabel: "デモをはじめる",
  },

  teacher_submitted: {
    title: "面談不可日程の提出が完了しました。",
    purpose: "面談調整はこのあと、保護者側の来校できる日の回答へと進みます。",
    steps: ["トップページに戻り、保護者の画面もご覧ください。"],
    buttonLabel: "トップページに戻る",
    buttonUrl: "/",
  },
  teacher_meeting_slots: {
    title: "教師として体験します。",
    purpose: "面談の日程をこの画面で確認・変更できます。",
    steps: [
      "変更したい1コマをクリックし、続けて移動先のコマをクリックしてください",
    ],
    buttonLabel: "面談の調整をはじめる",
  },

  family_availability: {
    title: "保護者として体験します。",
    purpose: "面談の日程調整のために、参加できる日時を先生に伝える画面です",
    steps: ["参加できる日時のボタンを押して回答してみましょう。"],
    note: "※提出後は変更できません。",
    buttonLabel: "デモをはじめる",
  },
  family_submitted: {
    title: "面談できる日時の提出が完了しました。",
    purpose: "面談調整はこのあと、管理者による割り当て処理に進みます。",
    steps: ["トップページに戻り、管理者の画面もご覧ください。"],
    buttonLabel: "トップページに戻る",
    buttonUrl: "/",
  },
  admin_assignment: {
    title: "管理者として体験します。",
    purpose: "教師と保護者の希望をもとに、面談日程を自動で割り当てます。",

    steps: ["「割り当てを実行する」を押して、結果を確認してみましょう。"],
    buttonLabel: "デモをはじめる",
  },
  assignment_button: {
    title: "自動割り当てが完了しました。",
    purpose:
      "面談調整はこのあと、教師の画面に戻り面談表を確認する流れに進みます。",
    steps: [
      "",
      "トップページの「Tsunaguで面談日程が決まるまで」から",
      "④「面談表の確認・調整」に進んでみましょう。",
    ],
    buttonLabel: "トップページに戻る",
    buttonUrl: "/",
  },
};
