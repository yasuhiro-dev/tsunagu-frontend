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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

type Teacher = {
  name: string;
  email_address: string;
  classname: string;
  id: number;
};

type Parent = {
  name: string;
  email_address: string;
  children_name: string;
  children_class: string;
  id: number;
};
type ClassRoom = {
  id: number;
  classname: string;
};

type EditChild = {
  id: number;
  name: string;
  class_room_ids: number[];
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
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);
  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMailAddress, setEditMailAddress] = useState("");
  const [editClassRoomId, setEditClassRoomId] = useState("");
  const [editTargetParent, setEditTargetParent] = useState<Parent | null>(null);
  const [editParentName, setEditParentName] = useState("");
  const [editChildren, setEditChildren] = useState<EditChild[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users`, {
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

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/class_rooms`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setClassRooms(data);
      });
  }, [router]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/teachers`,
      {
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
      },
    );
    const data = await res.json();
    if (res.ok) {
      alert("登録が完了しました");
      const selectedClass = classRooms.find(
        (c) => c.id === Number(classRoomId),
      );
      setTeachers([
        ...teachers,
        {
          id: data.teacher.id,
          name: data.teacher.name,
          email_address: emailAddress,
          classname: selectedClass?.classname ?? "",
        },
      ]);
      setName("");
      setEmailAddress("");
      setPassword("");
      setClassRoomId("");
    } else {
      alert(data.errors?.join(",") ?? "エラーが発生しました");
    }
  };
  const handleDeleteTeacher = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/teachers/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      alert("削除しました");
      setTeachers(teachers.filter((t) => t.id !== id));
    } else {
      alert("削除されませんでした");
    }
  };

  const handleDeleteParent = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/parents/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      alert("削除しました");
      setParents(parents.filter((p) => p.id !== id));
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/teachers/${editTarget?.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          email_address: editMailAddress,
          class_room_id: editClassRoomId,
        }),
      },
    );
    if (res.ok) {
      alert("更新しました");
      setTeacherModalOpen(false);
      const selectedClass = classRooms.find(
        (c) => c.id === Number(editClassRoomId),
      );
      setTeachers(
        teachers.map((t) =>
          t.id === editTarget?.id
            ? {
                id: t.id,
                name: editName,
                email_address: editMailAddress,
                classname: selectedClass?.classname ?? t.classname,
              }
            : t,
        ),
      );
    } else {
      alert("更新に失敗しました");
    }
  };
  const handleUpdateParent = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/parents/${editTargetParent?.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editParentName,
          children: editChildren,
        }),
      },
    );
    if (res.ok) {
      alert("更新しました");
      setParentModalOpen(false);
      setParents(
        parents.map((p) =>
          p.id === editTargetParent?.id
            ? {
                ...p,
                name: editParentName,
                children_name: editChildren.map((c) => c.name).join("、"),
                children_class: editChildren
                  .map((c) =>
                    classRooms
                      .filter((r) => c.class_room_ids.includes(r.id))
                      .map((r) => r.classname)
                      .join("、"),
                  )
                  .join("、"),
              }
            : p,
        ),
      );
    } else {
      alert("更新に失敗しました");
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
            <TextField
              label="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormControl>
              <InputLabel>クラス</InputLabel>
              <Select
                value={classRoomId}
                onChange={(e) => setClassRoomId(e.target.value)}
                label="クラス"
              >
                {classRooms.map((classRoom) => (
                  <MenuItem key={classRoom.id} value={classRoom.id}>
                    {classRoom.classname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="メールアドレス"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
            <TextField
              label="パスワード"
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
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teachers.map((teacher, i) => (
                    <TableRow key={i}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email_address}</TableCell>
                      <TableCell>{teacher.classname}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => {
                            setEditTarget(teacher);
                            setEditName(teacher.name);
                            setEditMailAddress(teacher.email_address);
                            setEditClassRoomId("");
                            setTeacherModalOpen(true);
                          }}
                        >
                          編集
                        </Button>
                        <Button onClick={() => handleDeleteTeacher(teacher.id)}>
                          削除
                        </Button>
                      </TableCell>
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
                  <TableCell>クラス</TableCell>
                  <TableCell>児童名</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parents.map((parent, i) => (
                  <TableRow key={i}>
                    <TableCell>{parent.name}</TableCell>
                    <TableCell>{parent.email_address}</TableCell>
                    <TableCell>
                      {Array.isArray(parent.children_class)
                        ? parent.children_class.join("/")
                        : parent.children_class}
                    </TableCell>
                    <TableCell>{parent.children_name}</TableCell>
                    <TableCell>
                      <Button
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/parents/${parent.id}`,
                            { headers: { Authorization: `Bearer ${token}` } },
                          );
                          const data = await res.json();
                          setEditTargetParent(parent);
                          setEditParentName(parent.name);
                          setEditChildren(data.children);
                          setParentModalOpen(true);
                        }}
                      >
                        編集
                      </Button>

                      <Button onClick={() => handleDeleteParent(parent.id)}>
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <Dialog
        open={teacherModalOpen}
        onClose={() => setTeacherModalOpen(false)}
      >
        <DialogTitle>先生の編集</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="名前"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <TextField
            label="メールアドレス"
            value={editMailAddress}
            onChange={(e) => setEditMailAddress(e.target.value)}
          />
          <Select
            value={editClassRoomId}
            onChange={(e) => setEditClassRoomId(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">クラス選択</MenuItem>
            {classRooms.map((classRoom) => (
              <MenuItem key={classRoom.id} value={classRoom.id}>
                {classRoom.classname}
              </MenuItem>
            ))}
          </Select>

          <DialogActions>
            <Button onClick={() => setTeacherModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdate} variant="contained">
              更新
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Dialog open={parentModalOpen} onClose={() => setParentModalOpen(false)}>
        <DialogTitle>保護者の編集</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="保護者名"
            value={editParentName}
            onChange={(e) => setEditParentName(e.target.value)}
          />
          {editChildren.map((child, i) => (
            <div key={i}>
              <TextField
                label="児童名"
                value={child.name}
                onChange={(e) => {
                  const updated = [...editChildren];
                  updated[i] = { ...updated[i], name: e.target.value };
                  setEditChildren(updated);
                }}
              />
              <Select
                value={child.class_room_ids[0] ?? ""}
                onChange={(e) => {
                  const updated = [...editChildren];
                  updated[i] = {
                    ...updated[i],
                    class_room_ids: [
                      Number(e.target.value),
                      child.class_room_ids[1],
                    ],
                  };
                  setEditChildren(updated);
                }}
                displayEmpty
              >
                <MenuItem value="">クラス選択</MenuItem>
                {classRooms.map((classRoom) => (
                  <MenuItem key={classRoom.id} value={classRoom.id}>
                    {classRoom.classname}
                  </MenuItem>
                ))}
              </Select>
              <Select
                value={child.class_room_ids[1] ?? ""}
                onChange={(e) => {
                  const updated = [...editChildren];
                  updated[i] = {
                    ...updated[i],
                    class_room_ids: [
                      child.class_room_ids[0],
                      Number(e.target.value),
                    ],
                  };
                  setEditChildren(updated);
                }}
                displayEmpty
              >
                <MenuItem value="">クラス選択</MenuItem>
                {classRooms.map((classRoom) => (
                  <MenuItem key={classRoom.id} value={classRoom.id}>
                    {classRoom.classname}
                  </MenuItem>
                ))}
              </Select>
            </div>
          ))}

          <DialogActions>
            <Button onClick={() => setParentModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateParent} variant="contained">
              更新
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
