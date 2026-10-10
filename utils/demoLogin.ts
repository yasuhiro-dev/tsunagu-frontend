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
