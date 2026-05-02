"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

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
  const handleClick = async () => {
    await fetch("http://localhost:3000/api/v1/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 2 }),
    });
    setMessage("割り当て完了");
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:3000/api/v1/meeting_slots", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("isArray:", Array.isArray(data));
        console.log("data:", JSON.stringify(data));
        setslots(data);
      });
  }, [router]);

  const grouped = groupByDate(slots);

  return (
    <div style={{ padding: "24px" }}>
      <h1>面談スケジュール</h1>
      <button onClick={handleClick}>割り当てを実行する</button>
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
