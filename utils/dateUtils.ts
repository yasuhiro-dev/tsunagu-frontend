import { fetchWithAuth } from "@/utils/fetchWithAuth";

export type MeetingSlot = {
  id: number;
  start_at: string;
  end_at: string;
  schedule_id: number;
  status: string;
  child_name: string;
  assignment_id: number | null;
  submitted: boolean | null;
};

// 日付を日本版で読みやすくした形
export const formatDate = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
  });
};

// 時間を日本版で読みやすくした形
export const formatTime = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 同じ日付でまとめる
export const groupByDate = (slots: MeetingSlot[]) => {
  return slots.reduce(
    // acc=今までの処理の結果が溜まっていく箱
    (acc, slot) => {
      // slotにある日付を読みやすい形に変換
      const date = formatDate(slot.start_at);
      //   その日付が存在しないなら新しく箱を作る
      if (!acc[date]) acc[date] = [];
      //   日付ごとにslotを入れる
      acc[date].push(slot);
      //   次のループに引き継ぐ
      return acc;
    },
    {} as Record<string, MeetingSlot[]>,
  );
};

// 今年度のschedule_idを取得する
export const fetchCurrentSchedule = async () => {
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/current`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await res.json();
  return data.id;
};

// 保護者の面談不可日程締め切り日の表示
export const fetchDeadline = async (scheduleId: number) => {
  const schedule = scheduleId;
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${schedule}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await res.json();
  return data.deadline_at;
};
// 保護者が提出しているか
export const fetchFamilySubmitted = async (familyId: number) => {
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/families/${familyId}`,
  );
  const data = await res.json();
  return data.submitted;
};
// トークンを取得する関数
export const decodeToken = (token: string) => {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(escape(atob(base64))));
};
