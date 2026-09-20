export type DemoRole = "teacher" | "admin" | "parent";
export type DemoGuideContent = {
  roleLabel: string;
  purpose: string;
  steps: string[];
  note: string;
};
export const demoGuideContent: Record<DemoRole, DemoGuideContent> = {
  teacher: {
    roleLabel: "教師",
    purpose: "面談表を確認し、未割り当ての児童を手動で配置する画面です。",
    steps: [
      "「児童を割り当てる」を押して、未割り当ての児童を配置してみましょう。",
    ],
    note: "デモ用に、一部の児童はあらかじめ割り当ててあります。",
  },
  parent: {
    roleLabel: "保護者",
    purpose: "面談の日程調整のために、参加できる日時を先生に伝える画面です",
    steps: ["参加できる日時のボタンを押して回答してみましょう。"],
    note: "※提出後は変更できません。",
  },
  admin: {
    roleLabel: "管理者",
    purpose:
      "教師と保護者の都合をもとに、面談の日程を自動で割り当てる画面です。",
    steps: [
      "「割り当てを実行する」を押すと、残りの児童が自動で割り当てられます。",
    ],
    note: "＊デモ用に、一部の児童はあらかじめ割り当てています。",
  },
};
