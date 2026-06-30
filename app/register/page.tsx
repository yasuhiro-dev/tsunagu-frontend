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
  const [showPassword, setShowPassword] = useState(false);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [children, setChildren] = useState([
    { childName: "", classRoomId: "" },
  ]);
  const [childrenErrors, setChildrenErrors] = useState([
    { childNameError: "", classRoomError: "" },
  ]);
  const [apiError, setApiError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [familyNameError, setFamilyNameError] = useState("");
  const addChild = () => {
    setChildren([...children, { childName: "", classRoomId: "" }]);
  };
  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/class_rooms`)
      .then((res) => res.json())
      .then((data) => setClassRooms(data));
  }, []);

  const handleSubmit = async () => {
    setApiError("");
    if (!familyName) {
      setFamilyNameError("保護者名を入力してください");
      return;
    } else {
      setFamilyNameError("");
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
          classRoomError: !child.classRoomId ? "クラスを選択してください" : "",
        })),
      );

      return;
    } else {
      setChildrenErrors(
        children.map(() => ({ childNameError: "", classRoomError: "" })),
      );
    }
    setIsLoading(true);
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
          children: children.map((child) => ({
            name: child.childName,
            class_room_id: child.classRoomId,
          })),
        }),
      },
    );

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
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        gap: 2,
        margin: "0 auto",
        backgroundImage: "url('tsunagu.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card sx={{ width: 400, p: 2, boxShadow: 3, borderRadius: 3 }}>
        {apiError && <Alert severity="error">{apiError}</Alert>}
        <Typography variant="h5" sx={{ mb: 2 }}>
          ユーザー登録
        </Typography>
        <TextField
          type="text"
          label="保護者名"
          value={familyName}
          sx={{ mb: 2, width: 350 }}
          onChange={(e) => setFamilyName(e.target.value)}
          error={!!familyNameError}
          helperText={familyNameError}
        />

        <Card
          sx={{
            p: 2,
            boxShadow: 2,
            borderRadius: 3,
            backgroundColor: "#f0f4f8",
            mb: 2,
          }}
        >
          {children.map((child, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
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
              borderRadius: 4,
            }}
          >
            + 児童を追加する
          </Button>
        </Card>

        <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
          <TextField
            type="email"
            label="メールアドレス"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            error={!!emailError}
            helperText={emailError}
          />

          <TextField
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
        <FormControl fullWidth>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ borderRadius: 3 }}
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
