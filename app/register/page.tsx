"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

type ClassRoom = {
  id: number;
  classname: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [children, setChildren] = useState([
    { childName: "", classRoomId: "" },
  ]);
  const addChild = () => {
    setChildren([...children, { childName: "", classRoomId: "" }]);
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/class_rooms")
      .then((res) => res.json())
      .then((data) => setClassRooms(data));
  }, []);

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/v1/users/parent", {
      method: "post",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email_address: emailAddress, // email → email_address
          password: password,
        },
        family_name: familyName, // user の外に出す
        children: children.map((child) => ({
          name: child.childName,
          class_room_id: child.classRoomId,
        })),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("登録が完了した");
      router.push("/meeting_slots");
    } else {
      setMessage(data.errors.join(","));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <h1>ユーザー登録</h1>
      <TextField
        type="text"
        label="保護者名"
        value={familyName}
        onChange={(e) => setFamilyName(e.target.value)}
      />
      {children.map((child, index) => (
        <Box key={index}>
          <TextField
            type="text"
            label="児童名"
            value={child.childName}
            onChange={(e) => {
              const newChildren = [...children];
              newChildren[index].childName = e.target.value;
              setChildren(newChildren);
            }}
          />
          <FormControl fullWidth>
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
          </FormControl>
        </Box>
      ))}
      <Button onClick={addChild}>+ 児童を追加する</Button>

      <TextField
        type="email"
        label="メールアドレス"
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
      />
      <TextField
        type="password"
        label="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <FormControl fullWidth>
        <Button variant="contained" onClick={handleSubmit}>
          登録
        </Button>
        {message && <p>{message}</p>}
      </FormControl>
    </Box>
  );
}
