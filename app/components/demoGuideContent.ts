export type DemoPage =
  | "teacher_unavailability"
  | "teacher_meeting_slots"
  | "family_availability"
  | "admin_assignment";

export type DemoGuideContent = {
  roleLabel: string;
  purpose: string;
  steps: string[];
  note?: string;
};

export const demoPageContent: Record<DemoPage, DemoGuideContent> = {
  teacher_unavailability: {
    roleLabel: "教師",
    purpose: "出張や不在など、面談に対応できない日時を登録する画面です。",
    steps: ["対応できない日時を「参加できない」にしてください。"],
  },
  teacher_meeting_slots: {
    roleLabel: "教師",
    purpose: "面談表を確認し、未割り当ての児童を手動で配置する画面です。",
    steps: [
      "「児童を割り当てる」を押して、未割り当ての児童を配置してみましょう。",
    ],
    note: "デモ用に、一部の児童はあらかじめ割り当ててあります。",
  },
  family_availability: {
    roleLabel: "保護者",
    purpose: "面談の日程調整のために、参加できる日時を先生に伝える画面です",
    steps: ["参加できる日時のボタンを押して回答してみましょう。"],
    note: "※提出後は変更できません。",
  },
  admin_assignment: {
    roleLabel: "管理者",
    purpose: "教師と保護者の希望をもとに、面談日程を自動で割り当てます。",

    steps: ["「割り当てを実行する」を押して、結果を確認してみましょう。"],
  },
};
