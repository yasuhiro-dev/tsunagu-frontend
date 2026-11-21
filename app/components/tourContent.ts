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
        title: "まず「余裕」を確認",
        description:
          "上の「余裕」の数までなら、</br>「対応できない」にしても大丈夫です。",
      },
    },
    {
      element: "#tour-teacher-button-area",
      popover: {
        title: "対応できない日時を選ぶ",
        description:
          "出張などで面談できない時間の<br>「× 対応できない」を押します",
      },
    },
    {
      element: "#tour-teacher-submit-button",
      popover: {
        title: "選び終わったら提出",
        description: "提出後も、面談が入っていない枠は<br>変更できます。",
      },
    },
  ],
  family_availability: [
    {
      element: "#tour-parent-info",
      popover: {
        title: "まず選び方を確認",
        description: "同じ日に続けて2つ以上が必須です。",
      },
    },
    {
      element: "#tour-parent-button-area",
      popover: {
        title: "参加できる日時を選ぶ",
        description: "「全て可能」を押すと、<br>1日分まとめて選べます。",
      },
    },
    {
      element: "#tour-parent-submitted-button",
      popover: {
        title: "選び終わったら提出",
        description:
          "提出後は変更できません。選んだ日時を<br>確かめてから押しましょう。",
      },
    },
  ],
  admin_assignment: [
    {
      element: "#admin-assignment-execution-button",
      popover: {
        title: "割り当てを実行する",
        description: "担任と保護者の希望から、面談日程を<br>自動で決めます。",
      },
    },
    {
      element: "#admin-assignment-execution-siblings-result",
      popover: {
        title: "兄弟の連続面談",
        description:
          "割り当て後、同じ日に続けて組めた<br>家庭の数がここに出ます。",
      },
    },
    {
      element: "#admin-assignment-execution-assignment-result",
      popover: {
        title: "割り当ての結果",
        description:
          "実行後、全体・クラス別の割り当て率と、<br>入らなかった児童が出ます。",
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
          "希望の枠に空きがない児童です。</br>電話で相談して枠を決めます。",
      },
    },
    {
      element: "#tour-teacher-meeting-slos-add-popbar",
      popover: {
        title: "空き枠の時間に入れる",
        description: "空き枠を押すと、</br>「選択中」の児童が入ります。",
      },
    },

    {
      element: "#tour-teacher-meeting-slots-info",
      popover: {
        title: "迷ったら上の案内を見る",
        description:
          "選んだ児童に合わせて、</br>操作と色の意味が切り替わります。",
      },
    },
    {
      element: "#tour-teacher-meeting-slos-are",
      popover: {
        title: "割り当て済みの児童を動かす",
        description: "必要なら、児童 → 移動先の順に<br>押して動かせます。",
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
        description: "押すと、全クラスの保護者へ<br>一度に送信します。",
      },
    },
    {
      element: "#tour-admin-assignment-notification-next-button",
      popover: {
        title: "次は保護者の画面へ",
        description: "送信後は、「次へ」で<br>保護者の画面へ進みます。",
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
        title: "最後に出力例を確認",
        description:
          "印刷用の面談表（PDF）と、<br>届くメールの見本が見られます。",
      },
    },
  ],
};
