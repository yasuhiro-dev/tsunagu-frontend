"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import FormHelperText from "@mui/material/FormHelperText";

type ClassRoom = {
  id: number;
  classname: string;
};

export default function RegisterPage() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [familyNameKana, setFamilyNameKana] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [children, setChildren] = useState([
    { childName: "", childNameKana: "", classRoomId: "" },
  ]);
  const [childrenErrors, setChildrenErrors] = useState([
    { childNameError: "", childNameKanaError: "", classRoomError: "" },
  ]);
  const [apiError, setApiError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [familyNameError, setFamilyNameError] = useState("");
  const [familyNameKanaError, setFamilyNameKanaError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 児童の追加・削除
  const addChild = () => {
    setChildren([
      ...children,
      { childName: "", childNameKana: "", classRoomId: "" },
    ]);
  };
  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };
  // 最初に画面に表示された1回に、APIを送り情報を取得する
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/class_rooms`)
      .then((res) => res.json())
      .then((data) => setClassRooms(data));
  }, []);

  // エラーメッセージAPI
  const handleSubmit = async () => {
    setApiError("");
    if (!familyName) {
      setFamilyNameError("保護者名を入力してください");
      return;
    } else {
      setFamilyNameError("");
    }
    if (!familyNameKana) {
      setFamilyNameKanaError("ふりがなを入力してください");
      return;
    } else {
      setFamilyNameKanaError("");
    }
    if (!emailAddress) {
      setEmailError("メールアドレスを入力してください");
      return;
    } else if (!emailAddress.includes("@")) {
      setEmailError("正しいメールアドレスの形式で入力してください");
      return;
    } else {
      setEmailError("");
    }
    if (!password) {
      setPasswordError("パスワードを入力してください");
      return;
    } else if (password.length < 8) {
      setPasswordError("パスワードは８文字以上にしましょう");
      return;
    } else {
      setPasswordError("");
    }
    const hasChildError = children.some(
      (child) => !child.childName || !child.classRoomId,
    );
    if (hasChildError) {
      setChildrenErrors(
        children.map((child) => ({
          childNameError: !child.childName ? "児童名を入力してください" : "",
          childNameKanaError: !child.childNameKana
            ? "ふりがなを入力してください"
            : "",
          classRoomError: !child.classRoomId ? "クラスを選択してください" : "",
        })),
      );
      return;
    } else {
      setChildrenErrors(
        children.map(() => ({
          childNameError: "",
          childNameKanaError: "",
          classRoomError: "",
        })),
      );
    }
    setIsLoading(true);

    // ユーザー（保護者・児童・パスワード・メールアドレス）API
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/parent`,
      {
        method: "post",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            email_address: emailAddress,
            password: password,
          },
          family_name: familyName,
          family_name_kana: familyNameKana,
          children: children.map((child) => ({
            name: child.childName,
            name_kana: child.childNameKana,
            class_room_id: child.classRoomId,
          })),
        }),
      },
    );

    // 登録時の画面遷移・メッセージ
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setMessage("登録が完了した");
      window.location.href = "/family_unavailabilities";
    } else {
      setIsLoading(false);
      setApiError(
        Array.isArray(data.errors)
          ? data.errors.join(",")
          : JSON.stringify(data.errors),
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        gap: 2,
        overflow: "auto",
      }}
    >
      <Typography variant="h5" sx={{ width: 500 }}>
        ユーザー登録
      </Typography>
      <Card sx={{ width: 500, p: 2, boxShadow: 3, borderRadius: 3 }}>
        {apiError && <Alert severity="error">{apiError}</Alert>}
        <Typography variant="h6" sx={{ mb: 1 }}>
          保護者登録
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            type="text"
            label="保護者名"
            value={familyName}
            sx={{ mb: 2, width: 350 }}
            onChange={(e) => setFamilyName(e.target.value)}
            error={!!familyNameError}
            helperText={familyNameError}
          />
          <TextField
            fullWidth
            type="text"
            label="ふりがな"
            value={familyNameKana}
            sx={{ mb: 2, width: 350 }}
            onChange={(e) => setFamilyNameKana(e.target.value)}
            error={!!familyNameKanaError}
            helperText={familyNameKanaError}
          />
        </Box>

        <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
          <TextField
            fullWidth
            type="email"
            label="メールアドレス"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            error={!!emailError}
            helperText={emailError}
          />

          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Typography variant="h6" sx={{ mt: 3 }}>
          児童登録
        </Typography>
        {children.map((child, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              type="text"
              sx={{ flex: 1 }}
              label="児童名"
              value={child.childName}
              error={!!childrenErrors[index]?.childNameError}
              helperText={childrenErrors[index]?.childNameError}
              onChange={(e) => {
                const newChildren = [...children];
                newChildren[index].childName = e.target.value;
                setChildren(newChildren);
              }}
            />
            <TextField
              type="text"
              fullWidth
              sx={{ flex: 1 }}
              label="ふりがな"
              value={child.childNameKana}
              error={!!childrenErrors[index]?.childNameKanaError}
              helperText={childrenErrors[index]?.childNameKanaError}
              onChange={(e) => {
                const newChildren = [...children];
                newChildren[index].childNameKana = e.target.value;
                setChildren(newChildren);
              }}
            />
            <FormControl
              fullWidth
              sx={{ flex: 1 }}
              error={!!childrenErrors[index]?.classRoomError}
            >
              <InputLabel>クラス選択</InputLabel>
              <Select
                value={child.classRoomId}
                onChange={(e) => {
                  const newChildren = [...children];
                  newChildren[index].classRoomId = e.target.value;
                  setChildren(newChildren);
                }}
              >
                {classRooms.map((classRoom) => (
                  <MenuItem key={classRoom.id} value={classRoom.id}>
                    {classRoom.classname}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {childrenErrors[index]?.classRoomError}
              </FormHelperText>
            </FormControl>
            {children.length > 1 && (
              <IconButton
                onClick={() => removeChild(index)}
                color="error"
                aria-label="この児童を削除"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

        <Button
          onClick={addChild}
          fullWidth
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            mb: 2,
          }}
        >
          + 児童を追加する
        </Button>

        <FormControl fullWidth>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ borderRadius: 2 }}
            disabled={isLoading}
          >
            登録
          </Button>
          {message && <p>{message}</p>}
        </FormControl>
      </Card>
    </Box>
  );
}
