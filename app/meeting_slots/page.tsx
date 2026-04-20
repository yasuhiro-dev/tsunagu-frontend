"use client";

import { useEffect, useState } from "react";

type MeetingSlot = {
  id: number;
  start_at: string;
  end_at: string;
  status: string;
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/v1/meeting_slots", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setslots(data));
  }, []);

  const grouped = groupByDate(slots);

  return (
    <div>
      <h1>面談スケジュール</h1>
      {Object.entries(grouped).map(([date, dateSlots]) => (
        <div key={date}>
          <h2>{date}</h2>
          {dateSlots.map((slot) => (
            <div key={slot.id}>
              <p>
                {formatTime(slot.start_at)}~{formatTime(slot.end_at)}{" "}
                {slot.status}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
