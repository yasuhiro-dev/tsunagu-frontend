"use client";

import { useState } from "react";

export default function SchedulesPage() {
  const [message, setMessage] = useState("");
  const handleClick = async () => {
    await fetch("http://localhost:3000/api/v1/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 2 }),
    });
    setMessage("割り当て完了");
  };
  return (
    <div>
      <button onClick={handleClick}>割り当てを実行</button>
      <p>{message}</p>
    </div>
  );
}
