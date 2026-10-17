export type RedirectMap = {
  teacher: string;
  parent: string;
  admin: string;
};

export const DEMO_ACCOUNTS = {
  teacher: { email: "aoki@example.com", password: "password" },
  parent: { email: "parent-nonsubmit@example.com", password: "password" },
  admin: { email: "admin@example.com", password: "password" },
};

export const demoLogin = async (loginEmail: string, loginPassword: string) => {
  //emailとpasswordを引数として受け取る
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email_address: loginEmail,
      password: loginPassword,
    }),
  });
  if (res.ok) {
    const data: { token: string; role: keyof RedirectMap } = await res.json(); //トークンとroleを受け取る
    localStorage.setItem("token", data.token); //トークンを保存する
    return data.role; //roleを返す
  }
  throw new Error("ログインに失敗しました");
};

// デモ環境を初期状態に戻す（デモアカウントでログインした後に呼ぶ）
export const resetDemo = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/demo/reset`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
  if (!res.ok) throw new Error("デモ環境のリセットに失敗しました");
  // 前回の体験で「案内を見た」記録を消し、STEPの案内をもう一度表示させる
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith("demo-guide-seen:"))
    .forEach((key) => sessionStorage.removeItem(key));
};
