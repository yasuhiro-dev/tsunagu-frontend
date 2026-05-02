"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Assignment = {
  child_name: string;
  class_name: string;
  start_at: string;
  end_at: string;
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

export default function MySchedulePage() {
  const [assignment, setAssignment] = useState<Assignment[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:3000/api/v1/meeting_slots", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAssignment(data));
  }, [router]);

  return (
    <div style={{ padding: "24px" }}>
      <h1>面談日程決定のお知らせ</h1>
      {assignment.map((a, i) => (
        <div key={i}>
          <p>
            {a.child_name}（{a.class_name}）
          </p>
          <p>
            {formatDate(a.start_at)} {formatTime(a.start_at)}〜
            {formatTime(a.end_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
