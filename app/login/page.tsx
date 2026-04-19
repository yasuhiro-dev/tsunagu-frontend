"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: emailAddress, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/");
    } else {
      alert("メールアドレスまたはパスワードが違います");
    }
  };
  return (
    <div>
      <h1>ログイン</h1>
      <input
        type="email"
        placeholder="メールアドレス"
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>ログイン</button>
    </div>
  );
}
