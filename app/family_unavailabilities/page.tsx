"use client";

import Button from "@mui/material/Button";
import { useState, useEffect } from "react";

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

export default function FamilyUnavailability() {
  const [slots, setSlots] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/v1/meeting_slots", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setSlots(data);
      });
    fetch("http://localhost:3000/api/v1/family_unavailabilities", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUnavailableSlots(data);
      });
  }, []);

  const handleClick = async (slotId: number) => {
    const token = localStorage.getItem("token");
    if (unavailableSlots.includes(slotId)) {
      await fetch(
        `http://localhost:3000/api/v1/family_unavailabilities/${slotId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnavailableSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      await fetch("http://localhost:3000/api/v1/family_unavailabilities", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meeting_slot_id: slotId }),
      });
      setUnavailableSlots((prev) => [...prev, slotId]);
    }
  };

  return (
    <div>
      <h1>面談が難しい日時を入力してください</h1>
      {Object.entries(groupByDate(slots)).map(([date, dateSlots]) => (
        <div key={date}>
          <h2>{date}</h2>
          {dateSlots.map((slot) => (
            <div key={slot.id}>
              <p>
                {formatTime(slot.start_at)}~{formatTime(slot.end_at)}
              </p>
              <Button
                variant="contained"
                color={unavailableSlots.includes(slot.id) ? "error" : "primary"}
                onClick={() => handleClick(slot.id)}
              >
                {unavailableSlots.includes(slot.id) ? "面談不可" : "面談可"}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
