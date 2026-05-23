"use client";

import useSWR from "swr";
import { fetcher } from "@/utils";

export default function Home() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/health_check`;
  const { data, error } = useSWR(url, fetcher);

  if (error) return <div>An error has occurred.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <p>Rails疎通確認</p>
      <p>レスポンスメッセージ: {data.message}</p>
    </div>
  );
}
