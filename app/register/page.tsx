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
  const [role, setRole] = useState("");
  const [childName, setChildName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [classRoomId, setClassRoomId] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/class_rooms")
      .then((res) => res.json())
      .then((data) => setClassRooms(data));
  }, []);

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/v1/users", {
      method: "post",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        user: { email_address: emailAddress, password: password, role: role },
        family_name: familyName,
        child_name: childName,
        class_room_id: classRoomId,
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
      <FormControl fullWidth>
        <InputLabel>クラス選択</InputLabel>
        <Select
          value={classRoomId}
          onChange={(e) => setClassRoomId(e.target.value)}
        >
          {classRooms.map((classRoom) => (
            <MenuItem key={classRoom.id} value={classRoom.id}>
              {classRoom.classname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="text"
        label="児童名"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
      />
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
        <InputLabel>役割選択</InputLabel>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <MenuItem value="">未選択</MenuItem>
          <MenuItem value="teacher">先生</MenuItem>
          <MenuItem value="parent">保護者</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleSubmit}>
          登録
        </Button>
        {message && <p>{message}</p>}
      </FormControl>
    </Box>
  );
}
