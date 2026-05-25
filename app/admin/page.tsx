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
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";

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
  const [open, setOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [children, setChildren] = useState([
    { childName: "", classRoomId: "" },
  ]);
  const [serchText, setSerchText] = useState("");
  const [filterClass, setFilterClass] = useState("");

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

  const handleSubmitParent = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/parents`,
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
      alert("登録が完了しました");

      setParents([
        ...parents,
        {
          id: data.user.id,
          name: familyName,
          children_name: children.map((child) => child.childName).join("、"),
          email_address: emailAddress,
          children_class: children
            .map((child) => {
              const room = classRooms.find(
                (r) => r.id === Number(child.classRoomId),
              );
              console.log("room", room);
              return room?.classname ?? "";
            })
            .join("、"),
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
  const filteredParents = parents
    .filter((p) => p.name.includes(serchText))
    .filter(
      (p) => filterClass === "" || p.children_class.includes(filterClass),
    );
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        ユーザー管理
      </Typography>
      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            width: 200,
            backgroundColor: "#323131ff",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Button
            sx={{
              color: "white",
              backgroundColor: tab === 0 ? "#1a3a6b" : "transparent",
              "&:hover": { backgroundColor: "#1a3a6b" },
            }}
            onClick={() => setTab(0)}
          >
            教師一覧
          </Button>
          <Button
            sx={{
              color: "white",
              backgroundColor: tab === 1 ? "#1a3a6b" : "transparent",
              "&:hover": { backgroundColor: "#1a3a6b" },
            }}
            onClick={() => setTab(1)}
          >
            保護者一覧
          </Button>
          <Button
            sx={{
              color: "white",
              backgroundColor: tab === 2 ? "#1a3a6b" : "transparent",
              "&:hover": { backgroundColor: "#1a3a6b" },
            }}
            onClick={() => setTab(2)}
          >
            教師登録
          </Button>
          <Button
            sx={{
              color: "white",
              backgroundColor: tab === 3 ? "#1a3a6b" : "transparent",
              "&:hover": { backgroundColor: "#1a3a6b" },
            }}
            onClick={() => setTab(3)}
          >
            保護者登録
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {tab === 0 && (
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
                        <TableCell>
                          {(teacher.classname ?? "")
                            .split(",")
                            .map((classname) => (
                              <span
                                key={classname}
                                className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-sm"
                              >
                                {classname}
                              </span>
                            ))}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            sx={{ color: "green" }}
                            onClick={() => {
                              setEditTarget(teacher);
                              setEditName(teacher.name);
                              setEditMailAddress(teacher.email_address);
                              setEditClassRoomId("");
                              setTeacherModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            sx={{ color: "red" }}
                            onClick={() => {
                              setOpen(true);
                              setDeleteTargetId(teacher.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Dialog open={open}>
                <DialogTitle>削除確認</DialogTitle>
                <DialogContent>本当に削除しますか？</DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpen(false)}>キャンセル</Button>
                  <Button
                    color="error"
                    onClick={() => {
                      if (deleteTargetId) handleDeleteTeacher(deleteTargetId);
                      setOpen(false);
                    }}
                  >
                    削除
                  </Button>
                </DialogActions>
              </Dialog>
            </Paper>
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
                    <Box>
                      <TextField
                        label="名前で検索"
                        value={serchText}
                        onChange={(e) => setSerchText(e.target.value)}
                      />
                      <Select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">全クラス</MenuItem>
                        {classRooms.map((classRoom) => (
                          <MenuItem
                            key={classRoom.id}
                            value={classRoom.classname}
                          >
                            {classRoom.classname}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                    {filteredParents.map((parent, i) => (
                      <TableRow key={i}>
                        <TableCell>{parent.name}</TableCell>
                        <TableCell>{parent.email_address}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {parent.children_class
                              .split(/[・、]/)
                              .map((cls) => (
                                <span
                                  key={cls}
                                  className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-sm"
                                >
                                  {cls}
                                </span>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {parent.children_name.split("、").map((child) => (
                              <span
                                key={child}
                                className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-sm"
                              >
                                {child}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            sx={{ color: "green" }}
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              const res = await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/parents/${parent.id}`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              );
                              const data = await res.json();
                              setEditTargetParent(parent);
                              setEditParentName(parent.name);
                              setEditChildren(data.children);
                              setParentModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            sx={{ color: "red" }}
                            onClick={() => {
                              setOpen(true);
                              setDeleteTargetId(parent.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Dialog open={open}>
                <DialogTitle>削除の確認</DialogTitle>
                <DialogContent>本当に削除しますか？</DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpen(false)}>キャンセル</Button>
                  <Button
                    onClick={() => {
                      if (deleteTargetId) handleDeleteParent(deleteTargetId);
                      setOpen(false);
                    }}
                  >
                    削除
                  </Button>
                </DialogActions>
              </Dialog>
            </Paper>
          )}
          {tab === 2 && (
            <Paper
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 3,
                flexGrow: 1,
                margin: "auto",
                width: 400,
              }}
            >
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
              <Button variant="contained" onClick={handleSubmit}>
                登録
              </Button>
            </Paper>
          )}
          {tab === 3 && (
            <Paper
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 3,
                flexGrow: 1,
                margin: "auto",
                width: 400,
              }}
            >
              <TextField
                label="保護者名"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
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
              {children.map((child, i) => (
                <div
                  key={i}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <TextField
                    label="児童名"
                    value={child.childName}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[i] = { ...updated[i], childName: e.target.value };
                      setChildren(updated);
                    }}
                  />
                  <FormControl>
                    <InputLabel>クラス</InputLabel>
                    <Select
                      value={child.classRoomId}
                      onChange={(e) => {
                        const updated = [...children];
                        updated[i] = {
                          ...updated[i],
                          classRoomId: e.target.value,
                        };
                        setChildren(updated);
                      }}
                      label="クラス"
                    >
                      {classRooms.map((classRoom) => (
                        <MenuItem key={classRoom.id} value={classRoom.id}>
                          {classRoom.classname}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    onClick={() => {
                      const updated = children.filter(
                        (child, index) => index !== i,
                      );
                      setChildren(
                        updated.length === 0
                          ? [{ childName: "", classRoomId: "" }]
                          : updated,
                      );
                    }}
                  >
                    元に戻す
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => {
                  setChildren([
                    ...children,
                    { childName: "", classRoomId: "" },
                  ]);
                }}
              >
                児童を追加
              </Button>

              <Button variant="contained" onClick={handleSubmitParent}>
                登録
              </Button>
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
          <Dialog
            open={parentModalOpen}
            onClose={() => setParentModalOpen(false)}
          >
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
        </Box>
      </Box>
    </Container>
  );
}
