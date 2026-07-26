"use client";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useRouter } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

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
  const isMobile = useMediaQuery("(max-width:600px)");

  const decodeToken = (token: string) => {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  };

  const handleSelectAll = async (dateSlots: MeetingSlot[]) => {
    const token = localStorage.getItem("token");
    const newIds = dateSlots
      .filter((slot) => !unavailableSlots.includes(slot.id))
      .map((slot) => slot.id);
    for (const slotId of newIds) {
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
    }
    setUnavailableSlots((prev) => [...prev, ...newIds]);
  };
  const handleClerAll = async (dateSlots: MeetingSlot[]) => {
    const token = localStorage.getItem("token");
    const removeIds = dateSlots
      .filter((slot) => unavailableSlots.includes(slot.id))
      .map((slot) => slot.id);
    for (const slotId of removeIds) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/family_unavailabilities/${slotId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    }
    setUnavailableSlots((prev) => prev.filter((id) => !removeIds.includes(id)));
  };

  const hundleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const familyId = decodeToken(token).family_id;
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

    const familyId = decodeToken(token).family_id;
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
    <Container sx={{ mt: 4 }}>
      <Box sx={{ p: 3 }}>
        <Typography>面談に参加できない日時のボタンを押してください</Typography>

        <Box
          sx={
            isMobile
              ? { display: "flex", flexDirection: "column", gap: 2 }
              : { display: "flex", gap: 2 }
          }
        >
          {Object.entries(groupByDate(slots)).map(([date, dateSlots]) => (
            <Box key={date} sx={{ flex: 1, textAlign: "center" }}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "primary.dark",
                      borderBottom: 2,
                      borderColor: "primary.main",
                      pb: 2,
                    }}
                  >
                    {date}
                  </Typography>
                  {dateSlots.map((slot) => (
                    <Box key={slot.id} sx={{ mb: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          mb: 1,
                          textAlign: "center",
                        }}
                      >
                        {formatTime(slot.start_at)}~{formatTime(slot.end_at)}
                      </Typography>
                      <Box
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          mb: 1,
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          color={
                            unavailableSlots.includes(slot.id)
                              ? "error"
                              : "primary"
                          }
                          onClick={() => handleClick(slot.id)}
                          disabled={submitted}
                          sx={{
                            "&.Mui-disabled": {
                              backgroundColor: unavailableSlots.includes(
                                slot.id,
                              )
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
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 1,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  disabled={submitted}
                  onClick={() => handleSelectAll(dateSlots)}
                >
                  全選択
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={submitted}
                  onClick={() => handleClerAll(dateSlots)}
                >
                  全解除
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={isMobile ? { display: "flex", justifyContent: "center" } : {}}>
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            disabled={submitted}
            onClick={hundleSubmit}
          >
            {submitted ? "提出が完了しました" : "上記の内容で提出する"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
