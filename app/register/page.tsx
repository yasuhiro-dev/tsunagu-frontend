"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/v1/users", {
      method: "post",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        user: { email_address: emailAddress, password: password, role: role },
      }),
    });

    const data = await res.json();
    console.log(data);
    if (res.ok) {
      setMessage("登録が完了した");
      router.push("/meeting_slots");
    } else {
      setMessage(data.errors.join(","));
    }
  };
  return (
    <div>
      <h1>ユーザー登録</h1>
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
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">役割の選択</option>
        <option value="teacher">先生</option>
        <option value="parent">保護者</option>
      </select>
      <button onClick={handleSubmit}>登録</button>
      {message && <p>{message}</p>}
    </div>
  );
}
