import { DemoPage } from "./demoGuideContent";

export type TourStep = {
  element: string;
  popover: {
    title: string;
    description: string;
  };
};

export const tourContent: Partial<Record<DemoPage, TourStep[]>> = {
  teacher_unavailability: [
    {
      element: "#tour-teacher-unavailability-status",
      popover: {
        title: "まず必要な枠数を確認",
        description: "あと何枠「対応できない」にできるかが、ここでわかります。",
      },
    },
    {
      element: "#tour-teacher-button-area",
      popover: {
        title: "対応できない日時を選ぶ",
        description:
          "出張などで面談できない時間の</br>「× 対応できない」を押します",
      },
    },
    {
      element: "#tour-teacher-submit-button",
      popover: {
        title: "選び終わったら提出",
        description: "提出後も、面談が入っていない枠は</br>変更できます。",
      },
    },
  ],
  family_availability: [
    {
      element: "#tour-parent-info",
      popover: {
        title: "まず選び方を確認",
        description: "「必須」と「目安」を読んでから</br>選びましょう。",
      },
    },
    {
      element: "#tour-parent-button-area",
      popover: {
        title: "参加できる日時を選ぶ",
        description: "都合のよい時間の「○ 参加できる」を</br>押します。",
      },
    },
    {
      element: "#tour-parent-submitted-button",
      popover: {
        title: "選び終わったら提出",
        description:
          "提出後は変更できないので、選んだ日時を確かめてから押しましょう。",
      },
    },
  ],
  admin_assignment: [
    {
      element: "#admin-assignment-execution-button",
      popover: {
        title: "割り当てを実行する",
        description: "担任と保護者の希望から、面談日程を自動で決めます。",
      },
    },
    {
      element: "#admin-assignment-execution-siblings-result",
      popover: {
        title: "兄弟の連続面談",
        description: "割り当て後、同じ日に続けて組めた家庭の数がここに出ます。",
      },
    },
    {
      element: "#admin-assignment-execution-assignment-result",
      popover: {
        title: "全体の割り当て率",
        description:
          "割り当て後、全体と学年別の割り当て率、自動で入らなかった児童がここに出ます。",
      },
    },
    {
      element: "#tour-admin-assignment-execution-next-button",
      popover: {
        title: "割り当ての後は",
        description:
          "割り当て後、結果を確認したら<br>「次へ」で担任の先生の画面へ進みます。",
      },
    },
  ],
  teacher_meeting_slots: [
    {
      element: "#tour-teacher-meeting-slos-unassignedChildren",
      popover: {
        title: "自動で入らなかった児童",
        description:
          "希望の日時が埋まっていた児童です。<br>まずはこの児童をクリック",
      },
    },
    {
      element: "#tour-teacher-meeting-slos-add-popbar",
      popover: {
        title: "空き枠の時間に入れる",
        description:
          "保護者と相談して日時が決まったら、<br>その時間の「＋」から入れます。<br>※デモでは相談済みとして進めます",
      },
    },

    {
      element: "#tour-teacher-meeting-slots-info",
      popover: {
        title: "操作の案内はここに出ます",
        description:
          "選んだ内容に合わせて、<br>操作のしかたと色の意味が変わります。",
      },
    },
    {
      element: "#tour-teacher-meeting-slos-are",
      popover: {
        title: "児童を別の時間に移す",
        description: "移動したい児童 → 移動先の順に<br>クリックします。",
      },
    },
  ],
  admin_mail_send: [
    {
      element: "#tour-admin-assignment-notification-example",
      popover: {
        title: "送る前にメールを確認",
        description: "押すと、保護者に届く<br>メールの例が見られます。",
      },
    },
    {
      element: "#tour-admin-assignment-notification-button",
      popover: {
        title: "保護者にまとめて送信",
        description:
          "押すと、全クラスの保護者に<br>面談日時がまとめて届きます。",
      },
    },
    {
      element: "tour-admin-assignment-notification-next-button",
      popover: {
        title: "次は保護者の画面へ",
        description: "送信後は、「次へ」で<br>保護者の画面へ進みます",
      },
    },
  ],
  my_schedule: [
    {
      element: "#tour-parent-my-schedule-area",
      popover: {
        title: "決まった面談日時",
        description: "お子さんごとの面談日時です。<br>兄弟は続けて面談します。",
      },
    },
    {
      element: "#tour-parent-my-shedule-calendar",
      popover: {
        title: "Googleカレンダーに追加",
        description: "面談の予定を、Googleカレンダーに<br>登録できます。",
      },
    },
    {
      element: "#tour-parent-my-schedule-finish",
      popover: {
        title: "デモはここまでです",
        description:
          "先生が印刷する面談表と、<br>保護者に届くメールを確認できます。",
      },
    },
  ],
};
