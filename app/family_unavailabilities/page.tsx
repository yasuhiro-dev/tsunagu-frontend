"use client";

import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useRouter } from "next/navigation";

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

type MeetingSlot = {
  id: number;
  start_at: string;
  end_at: string;
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
  const router = useRouter();
  const [slots, setSlots] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const hundleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const familyId = JSON.parse(atob(token.split(".")[1])).family_id;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities/${familyId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (res.ok) {
      setSubmitted(true);
      alert("提出しました");
    } else {
      alert("エラーが発生しました");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/all_meeting_slots`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })
      .then((data) => {
        setSlots(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })
      .then((data) => {
        setUnavailableSlots(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    const familyId = JSON.parse(atob(token.split(".")[1])).family_id;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/families/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitted(data.submitted);
      });
  }, [router]);

  const handleClick = async (slotId: number) => {
    const token = localStorage.getItem("token");
    if (unavailableSlots.includes(slotId)) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities/${slotId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnavailableSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      console.log("POST送信", slotId);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ meeting_slot_id: slotId }),
        },
      );
      setUnavailableSlots((prev) => [...prev, slotId]);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>面談が難しい日時を入力してください</h1>
      <Button variant="contained" disabled={submitted} onClick={hundleSubmit}>
        {submitted ? "提出済み" : "提出する"}
      </Button>
      <div style={{ display: "flex", gap: "16px" }}>
        {Object.entries(groupByDate(slots)).map(([date, dateSlots]) => (
          <div key={date} style={{ flex: 1, textAlign: "center" }}>
            <Card>
              <CardContent>
                <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
                  {date}
                </h2>
                {dateSlots.map((slot) => (
                  <div key={slot.id} style={{ marginBottom: "8px" }}>
                    <p
                      style={{
                        fontSize: "12px",
                        marginBottom: "4px",
                        textAlign: "center",
                      }}
                    >
                      {formatTime(slot.start_at)}~{formatTime(slot.end_at)}
                    </p>
                    <Button
                      variant="contained"
                      size="small"
                      color={
                        unavailableSlots.includes(slot.id) ? "error" : "primary"
                      }
                      onClick={() => handleClick(slot.id)}
                      disabled={submitted}
                      sx={{
                        "&.Mui-disabled": {
                          backgroundColor: unavailableSlots.includes(slot.id)
                            ? "#f44336" // 赤（面談不可）
                            : "#1976d2", // 青（面談可）
                          color: "white",
                        },
                      }}
                    >
                      {unavailableSlots.includes(slot.id)
                        ? "面談不可"
                        : "面談可"}
                    </Button>
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
