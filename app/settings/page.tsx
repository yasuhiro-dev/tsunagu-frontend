"use client";

import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function SettingPage() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_auth/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })
      .then((data) => {
        setConnected(data.connected);
      });
  }, []);

  const handleClick = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google_auth/connect`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <Box sx={{ p: 3 }}>
      {connected ? (
        <Typography variant="h5">連携できています</Typography>
      ) : (
        <Button variant="contained" color="primary" onClick={handleClick}>
          google連携をする
        </Button>
      )}
    </Box>
  );
}
