"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

type MeetingSlot = {
  id: number;
  start_at: string;
  end_at: string;
  status: string;
  child_name: string | null;
};

const formatDate = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
  });
};
const formatTime = (utcString: string) => {
  return new Date(utcString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const groupByDate = (slots: MeetingSlot[]) => {
  return slots.reduce(
    (acc, slot) => {
      const date = formatDate(slot.start_at);
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    },
    {} as Record<string, MeetingSlot[]>,
  );
};

export default function MeetingSlotPage() {
  const [slots, setslots] = useState<MeetingSlot[]>([]);
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const handleClick = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: 1 }),
    });
    setMessage("割り当て完了");
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setslots(data));
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/meeting_slots`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("データ取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        setslots(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [router]);

  const grouped = groupByDate(slots);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
        面談スケジュール
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        sx={{ mb: 2 }}
      >
        割り当てを実行する
      </Button>
      <p>{message}</p>
      <div style={{ display: "flex", gap: "14px" }}>
        {Object.entries(grouped).map(([date, dateSlots]) => (
          <div key={date} style={{ flex: 1, textAlign: "center" }}>
            <Card>
              <CardContent>
                <h2>{date}</h2>
                {dateSlots.map((slot) => (
                  <div key={slot.id}>
                    <div>
                      {formatTime(slot.start_at)}~{formatTime(slot.end_at)}
                      {slot.child_name}{" "}
                      <Chip
                        label={
                          slot.status === "available" ? "空き" : "予約済み"
                        }
                        color={
                          slot.status === "available" ? "success" : "error"
                        }
                        size="small"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
