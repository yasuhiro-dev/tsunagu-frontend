"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/meeting_slots");
    } else {
      router.push("/login");
    }
  }, [router]);

  return <div>Loading...</div>;
}
