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
  | "my_schedule";

export type DemoGuideContent = {
  title: string;
  purpose?: string;
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

export const demoPageContent: Record<DemoPage, DemoGuideContent> = {
  teacher_unavailability: {
    title: "STEP 1 / 6 ",
    chip: "教師の画面です",
    color: "primary.main",
    heading: "出張で、面談に対応できない日時を登録する画面です。",
    steps: [
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          対応できない日時を
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              textAlign: "center",
              border: "1px solid #ddd",
              borderRadius: "4px",
              p: 1,
              bgcolor: "#fff",
              color: "#555",
              fontSize: "12px",
              whiteSpace: "nowrap",
              minHeight: 60,
            }}
          >
            × <br />
            対応できない
          </Box>
          にしてください。
        </Box>
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
    heading: "面談に参加できる日時を選んでみましょう。",
    steps: [
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          参加できる日時を
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              textAlign: "center",
              border: "1px solid #ddd",
              borderRadius: "4px",
              p: 1,
              bgcolor: "#fff",
              color: "#555",
              fontSize: "12px",
              whiteSpace: "nowrap",
              minHeight: 60,
            }}
          >
            ○ <br />
            参加できる
          </Box>
          にしてください。
        </Box>
      </>,
    ],
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
    chip: "管理者の画面です",
    color: "success.main",
    heading: "教師と保護者の希望から、面談日程を自動で割り当てます。",
    steps: [
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="span"
            sx={{
              display: "inlign-flex",
              alignItem: "center",
              textAlign: "center",
              border: "1px solid #ddd",
              borderRadius: "6px",
              bgcolor: "primary.main",
              color: "#fff",
              fontSize: "14",
              fontWeight: "bold",
              p: 2,
            }}
          >
            ▶︎ 割り当てを実行する
          </Box>
          を押して、結果を確認してみましょう。
        </Box>
      </>,
    ],
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
    chip: "教師の画面です",
    color: "primary.main",
    heading: "自動で入らなかった児童を、手動で割り当てましょう。",
    steps: [
      <>
        保護者と電話で相談できた想定で、
        <br />
        空いている枠の{" "}
        <Box
          component="span"
          sx={{
            display: "inline-block",
            border: "1px solid #ddd",
            borderRadius: "6px",
            bgcolor: "#fff",
            color: "primary.main",
            fontSize: 14,
            fontWeight: "bold",
            mt: 2,
            p: 2,
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <Box>
            <AddIcon />
          </Box>
          <Box>児童を割り当てる</Box>
        </Box>{" "}
        から入れてください。
      </>,
    ],
    buttonLabel: "面談の調整をはじめる",
  },

  admin_mail_send: {
    title: "STEP 5 / 6",
    chip: "管理者の画面です",
    color: "success.main",
    heading: "",
    steps: [
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="span"
            sx={{
              display: "inlign-flex",
              alignItem: "center",
              textAlign: "center",
              border: "1px solid #ddd",
              borderRadius: "6px",
              bgcolor: "primary.main",
              color: "#fff",
              fontSize: "14",
              fontWeight: "bold",
              p: 2,
            }}
          >
            ▶︎ 保護者に送信する
          </Box>
          から、保護者へ決定メールを送りましょう。
        </Box>
      </>,
    ],
    note: "※デモのため、実際にメールは送信されません。",
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
    heading: "決まった面談日時を確認しましょう。",
    steps: [
      "STEP 2で提出した希望をもとに決まっています。",
      "兄弟の面談は、連続した時間にまとめています。",
    ],
    buttonLabel: "確認する",
  },
};
