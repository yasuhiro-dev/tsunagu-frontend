"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

type Teacher = {
  name: string;
  email_address: string;
  class_room: string;
};

type Parent = {
  name: string;
  email_address: string;
  children_name: string;
};
type ClassRoom = {
  id: number;
  classname: string;
};

export default function Admin() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [classRoomId, setClassRoomId] = useState("");
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:3000/api/v1/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("エラーが発生しました");
        return res.json();
      })

      .then((data) => {
        setTeachers(data.teachers);
        setParents(data.parents);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    fetch("http://localhost:3000/api/v1/class_rooms")
      .then((res) => res.json())
      .then((data) => setClassRooms(data));
  }, [router]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/v1/admin/teachers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: {
          email_address: emailAddress,
          password: password,
        },
        name: name,
        class_room_id: classRoomId,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("登録が完了しました");
    } else {
      alert(data.error.join(","));
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        ユーザー管理
      </Typography>

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="教師一覧" />
        <Tab label="保護者一覧" />
      </Tabs>

      {tab === 0 && (
        <>
          <Paper>
            <TextField value={name} onChange={(e) => setName(e.target.value)} />
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
            <TextField
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
            <TextField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleSubmit}>登録</Button>
          </Paper>
          <Paper sx={{ mt: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>名前</TableCell>
                    <TableCell>メールアドレス</TableCell>
                    <TableCell>クラス</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teachers.map((teacher, i) => (
                    <TableRow key={i}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email_address}</TableCell>
                      <TableCell>{teacher.class_room}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {tab === 1 && (
        <Paper sx={{ mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>名前</TableCell>
                  <TableCell>メールアドレス</TableCell>
                  <TableCell>児童名</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parents.map((parent, i) => (
                  <TableRow key={i}>
                    <TableCell>{parent.name}</TableCell>
                    <TableCell>{parent.email_address}</TableCell>
                    <TableCell>{parent.children_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}
