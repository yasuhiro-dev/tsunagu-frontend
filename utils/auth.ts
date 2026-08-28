// トークンのペイロード（デコード処理）からrole、name、有効期限などを取り出す処理
export const decodeToken = (token: string) => {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(escape(atob(base64))));
};

//roleを取り出す
export const getRole = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // デコード済みのトークンからroleを取り出す
    const decoded = decodeToken(token);
    return decoded.role;
  } catch {
    return null;
  }
};
// nameを取り出す
export const getName = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // デコード済みのトークンからnameを取り出す
    const decoded = decodeToken(token);
    return decoded.name;
  } catch {
    return null;
  }
};
