export type MeetingSlot = {
  id: number;
  start_at: string;
  end_at: string;
  schedule_id: number;
  child_name: string;
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
