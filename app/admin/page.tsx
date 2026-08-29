/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
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
import Pagination from "@mui/material/Pagination";
import Checkbox from "@mui/material/Checkbox";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import Chip from "@mui/material/Chip";
import AssignmentState from "@/app/assignment_stats/page";
import { useSearchParams } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";

type Teacher = {
  name: string;
  name_kana: string;
  email_address: string;
  classname: string;
  id: number;
};

type Parent = {
  name: string;
  name_kana: string;
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

function AdminContent() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const router = useRouter();
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
  const [editNameKana, setEditNameKana] = useState("");
  const [editMailAddress, setEditMailAddress] = useState("");
  const [editClassRoomId, setEditClassRoomId] = useState("");
  const [editTargetParent, setEditTargetParent] = useState<Parent | null>(null);
  const [editParentName, setEditParentName] = useState("");
  const [editChildren, setEditChildren] = useState<EditChild[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [nameKana, setNameKana] = useState("");
  const [children, setChildren] = useState([
    { childName: "", childNameKana: "", classRoomId: "" },
  ]);
  const [serchText, setSerchText] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [currentTeacherPage, setCurrentTeacherPage] = useState(1);
  const itemsPerTeacherPage = 6;
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [teacherSerchText, setTeacherSerchText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  // ハンバーガーバーの設定（モバイル）
  //URLからクエリ部分だけを取り出す
  const searchParams = useSearchParams();
  // そのクエリの中からtabを取り出す
  const tabParam = searchParams.get("tab");
  // そのクエリから指定されたtabをstateする
  const [tab, setTab] = useState(Number(tabParam) || 0);
  useEffect(() => {
    setTab(Number(tabParam) || 0);
  }, [tabParam]);
  // 教師名の絞り込み
  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        t.name.startsWith(teacherSerchText) ||
        t.name_kana.startsWith(teacherSerchText),
    );
  }, [teachers, teacherSerchText]);

  const handleCheck = (id: number) => {
    if (selectedParentIds.includes(id)) {
      setSelectedParentIds(selectedParentIds.filter((p) => p !== id));
    } else {
      setSelectedParentIds([...selectedParentIds, id]);
    }
  };
  const teacherHandleCheck = (id: number) => {
    if (selectedTeacherIds.includes(id)) {
      setSelectedTeacherIds(selectedTeacherIds.filter((p) => p !== id));
    } else {
      setSelectedTeacherIds([...selectedTeacherIds, id]);
    }
  };

  const handleBulkDeleteParents = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/parents/bulk_destroy`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedParentIds }),
      },
    );
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("削除されました");
      setParents(parents.filter((p) => !selectedParentIds.includes(p.id)));
      setSelectedParentIds([]);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("削除されませんでした");
    }
  };

  const handleBulkDeleteTeachers = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/teachers/bulk_destroy`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedTeacherIds }),
      },
    );
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("削除しました");
      setTeachers(teachers.filter((t) => !selectedTeacherIds.includes(t.id)));
      setSelectedTeacherIds([]);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("削除されませんでした");
    }
  };

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

  const filteredParents = useMemo(() => {
    return [...parents]
      .filter(
        (p) =>
          p.name.startsWith(serchText) || p.name_kana.startsWith(serchText),
      )
      .filter(
        (p) => filterClass === "" || p.children_class.startsWith(filterClass),
      )
      .sort((a, b) => {
        if (sortKey === "name") {
          return (a.name_kana ?? "").localeCompare(b.name_kana ?? "", "ja");
        }
        if (sortKey === "class") {
          const aClass = a.children_class.split(/[、・]/)[0];
          const bClass = b.children_class.split(/[、・]/)[0];
          return aClass.localeCompare(bClass, "ja");
        }
        return 0;
      });
  }, [parents, serchText, filterClass, sortKey]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredParents.length / itemsPerPage);
  }, [filteredParents, itemsPerPage]);

  const pageParents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return filteredParents.slice(start, end);
  }, [filteredParents, currentPage, itemsPerPage]);

  const totalTeacherPages = useMemo(() => {
    return Math.ceil(filteredTeachers.length / itemsPerTeacherPage);
  }, [filteredTeachers, itemsPerTeacherPage]);

  const pageTeachers = useMemo(() => {
    const start = (currentTeacherPage - 1) * itemsPerTeacherPage;
    const end = currentTeacherPage * itemsPerTeacherPage;
    return filteredTeachers.slice(start, end);
  }, [filteredTeachers, currentTeacherPage, itemsPerTeacherPage]);

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
          name_kana: nameKana,
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
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("登録が完了しました");

      setParents([
        ...parents,
        {
          id: data.user.id,
          name: familyName,
          name_kana: nameKana,
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
      setFamilyName("");
      setNameKana("");
      setEmailAddress("");
      setPassword("");
      setChildren([{ childName: "", childNameKana: "", classRoomId: "" }]);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage(data.errors?.join(",") ?? "登録に失敗しました");
    }
  };

  // 教師登録のAPI
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
          name_kana: nameKana,
          class_room_id: classRoomId,
        }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("登録が完了しました");
      const selectedClass = classRooms.find(
        (c) => c.id === Number(classRoomId),
      );
      setTeachers([
        ...teachers,
        {
          id: data.teacher.id,
          name: data.teacher.name,
          name_kana: data.teacher.name_kana,
          email_address: emailAddress,
          classname: selectedClass?.classname ?? "",
        },
      ]);
      setName("");
      setEmailAddress("");
      setPassword("");
      setClassRoomId("");
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage(data.errors?.join(",") ?? "登録されませんでした");
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
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("削除しました");
      setTeachers(teachers.filter((t) => t.id !== id));
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("削除されませんでした");
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
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("削除しました");
      setParents(parents.filter((p) => p.id !== id));
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("削除できませんでした");
    }
  };

  // 教師の編集画面
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
          name_kana: editNameKana,
          email_address: editMailAddress,
          class_room_id: editClassRoomId,
        }),
      },
    );
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("更新しました");
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
                name_kana: editNameKana,
                email_address: editMailAddress,
                classname: selectedClass?.classname ?? t.classname,
              }
            : t,
        ),
      );
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("更新に失敗しました");
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
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("更新しました");
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
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("更新に失敗しました");
    }
  };
  const sidebarButtonStyle = (tabIndex: number) => ({
    justifyContent: "flex-start",
    borderRadius: 2,
    fontSize: "0.875rem",
    width: "100%",
    borderLeft: tab === tabIndex ? "3px solid #1a3a6b" : "none",
    color: tab === tabIndex ? "#1a3a6b" : "#5f6b7a",
    backgroundColor:
      tab === tabIndex ? "rgba(26, 58, 107, 0.14)" : "transparent",
    fontWeight: tab === tabIndex ? "bold" : "normal",
    "&:hover": { backgroundColor: "rgba(26, 58, 107, 0.06)" },
  });

  return (
    <Container maxWidth={false} sx={{ mt: 4 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          ユーザー管理
        </Typography>
        {/* サイドバー一覧 */}
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              width: 200,
              backgroundColor: "#ffffff",
              borderRight: "1px solid ",
              borderColor: "divider",

              flexDirection: "column",
              p: 1,
              gap: 0.5,
              display: { xs: "none", md: "flex" },
            }}
          >
            <Button
              startIcon={<PersonIcon />}
              sx={sidebarButtonStyle(0)}
              onClick={() => setTab(0)}
            >
              教師一覧
            </Button>
            <Button
              startIcon={<PeopleIcon />}
              sx={sidebarButtonStyle(1)}
              onClick={() => setTab(1)}
            >
              保護者一覧
            </Button>
            <Button
              startIcon={<PersonAddAlt1Icon />}
              sx={sidebarButtonStyle(2)}
              onClick={() => setTab(2)}
            >
              教師登録
            </Button>
            <Button
              startIcon={<GroupAddIcon />}
              sx={sidebarButtonStyle(3)}
              onClick={() => setTab(3)}
            >
              保護者登録
            </Button>
            <Button
              startIcon={<AssignmentIcon />}
              sx={sidebarButtonStyle(4)}
              onClick={() => setTab(4)}
            >
              割り当て管理
            </Button>
          </Box>

          {/* 教師一覧画面 */}

          <Box sx={{ flexGrow: 1 }}>
            {tab === 0 && (
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">教師一覧</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 3,
                      justifyContent: "space-between",
                      flexDirection: { xs: "column", sm: "column", md: "row" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: {
                          xs: "column",
                          sm: "column",
                          md: "row",
                        },
                      }}
                    >
                      <TextField
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        placeholder="名前を検索..."
                        size="small"
                        value={teacherSerchText}
                        onChange={(e) => setTeacherSerchText(e.target.value)}
                      />
                    </Box>
                    {/* 一括削除 */}
                    <Box>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={selectedTeacherIds.length === 0}
                        onClick={handleBulkDeleteTeachers}
                      >
                        一括削除
                      </Button>
                    </Box>
                  </Box>
                </Box>

                <TableContainer
                  sx={{
                    maxHeight: "calc(100vh - 400px)",
                    minHeight: "calc(100vh - 400px)",
                    overflow: "auto",
                    maxWidth: isMobile ? "265px" : "100",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: "primary.dark",
                          "& th": { color: "white" },
                        }}
                      >
                        <TableCell sx={{ width: "5%" }}>選択</TableCell>
                        <TableCell sx={{ width: "15%" }}>名前</TableCell>
                        <TableCell sx={{ width: "30%" }}>
                          メールアドレス
                        </TableCell>
                        <TableCell sx={{ width: "35%" }}>クラス</TableCell>
                        <TableCell sx={{ width: "15%" }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageTeachers.map((teacher, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTeacherIds.includes(teacher.id)}
                              onChange={() => teacherHandleCheck(teacher.id)}
                            />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {teacher.name}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {teacher.email_address}
                          </TableCell>
                          <TableCell>
                            {(teacher.classname ?? "")
                              .split(",")
                              .map((classname) => (
                                <Chip
                                  key={classname}
                                  label={classname}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <IconButton
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "primary.main" },
                              }}
                              onClick={() => {
                                setEditTarget(teacher);
                                setEditName(teacher.name);
                                setEditNameKana(teacher.name_kana);
                                setEditMailAddress(teacher.email_address);
                                setEditClassRoomId("");
                                setTeacherModalOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "error.main" },
                              }}
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
                <Pagination
                  count={totalTeacherPages}
                  page={currentTeacherPage}
                  onChange={(e, page) => setCurrentTeacherPage(page)}
                />
              </Box>
            )}

            {/* 保護者一覧 */}
            {tab === 1 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">保護者一覧</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 3,
                      justifyContent: "space-between",
                      flexDirection: { xs: "column", sm: "column", md: "row" },
                    }}
                  >
                    {/* 児童名の検索 */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: {
                          xs: "column",
                          sm: "column",
                          md: "row",
                        },
                      }}
                    >
                      <TextField
                        placeholder="名前を検索..."
                        size="small"
                        value={serchText}
                        onChange={(e) => setSerchText(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      {/* クラスの絞り込み */}
                      <Select
                        size="small"
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
                      {/* 名前・クラスの並び替え */}
                      <Select
                        size="small"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">並び替えなし</MenuItem>
                        <MenuItem value="name">名前の順</MenuItem>
                        <MenuItem value="class">クラス順</MenuItem>
                      </Select>
                    </Box>

                    {/* 一括削除 */}
                    <Box>
                      <Button
                        variant="contained"
                        color="error"
                        disabled={selectedParentIds.length === 0}
                        onClick={handleBulkDeleteParents}
                        startIcon={<DeleteIcon />}
                      >
                        一括削除
                      </Button>
                    </Box>
                  </Box>
                </Box>

                <TableContainer
                  sx={{
                    maxHeight: "calc(100vh - 400px)",
                    minHeight: "calc(100vh - 400px)",
                    overflow: "auto",
                    maxWidth: isMobile ? "265px" : "100",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: "primary.dark",
                          "& th": { color: "white" },
                        }}
                      >
                        <TableCell sx={{ width: "5%" }}>選択</TableCell>
                        <TableCell sx={{ width: "10%" }}>名前</TableCell>
                        <TableCell sx={{ width: "35%" }}>
                          メールアドレス
                        </TableCell>
                        <TableCell sx={{ width: "20%" }}>クラス</TableCell>
                        <TableCell sx={{ width: "20%" }}>児童名</TableCell>
                        <TableCell sx={{ width: "10%" }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageParents.map((parent, i) => {
                        const classArray =
                          parent.children_class.split(/[・、]/);
                        const childList = classArray
                          .slice(0, 2)
                          .map((cls) => (
                            <Chip
                              key={cls}
                              label={cls}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ));

                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <Checkbox
                                checked={selectedParentIds.includes(parent.id)}
                                onChange={() => handleCheck(parent.id)}
                              />
                            </TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {parent.name}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {parent.email_address}
                            </TableCell>
                            <TableCell>
                              <Box
                                key={i}
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {childList}
                                {classArray.length > 2 &&
                                  `+${classArray.length - 2}件`}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {parent.children_name
                                  .split("、")
                                  .map((child) => (
                                    <Chip
                                      variant="outlined"
                                      sx={{ color: "text.secondary" }}
                                      key={child}
                                      label={child}
                                      size="small"
                                    />
                                  ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex" }}>
                                <IconButton
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": { color: "primary.main" },
                                  }}
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    const res = await fetch(
                                      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/parents/${parent.id}`,
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
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
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": { color: "error.main" },
                                  }}
                                  onClick={() => {
                                    setOpen(true);
                                    setDeleteTargetId(parent.id);
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                />
              </Box>
            )}

            {/* 教師登録画面 */}
            {tab === 2 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  p: 3,
                  minHeight: "calc(100vh - 264px)",
                  maxHeight: "calc(100vh - 400px)",
                  overflow: "auto",
                  maxWidth: 500,
                }}
              >
                <Typography variant="h6">教師登録</Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "column", md: "row" },
                  }}
                >
                  <TextField
                    fullWidth
                    label="教師の名前"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="ふりがな"
                    value={nameKana}
                    onChange={(e) => setNameKana(e.target.value)}
                  />
                  <FormControl fullWidth>
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
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "column", md: "row" },
                  }}
                >
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}
                  disabled={
                    name === "" ||
                    classRoomId === "" ||
                    emailAddress === "" ||
                    password === ""
                  }
                >
                  登録
                </Button>
              </Box>
            )}

            {/* 保護者登録画面 */}
            {tab === 3 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  p: 3,
                  minHeight: "calc(100vh - 264px)",
                  maxHeight: "calc(100vh - 400px)",
                  overflow: "auto",
                  maxWidth: 500,
                  flexDirection: "column",
                }}
              >
                {/* 保護者登録 */}

                <Typography variant="h6" sx={{ mb: 1 }}>
                  保護者登録
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "column", md: "row" },
                  }}
                >
                  <TextField
                    fullWidth
                    label="保護者名"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="ふりがな"
                    value={nameKana}
                    onChange={(e) => setNameKana(e.target.value)}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "column", md: "row" },
                  }}
                >
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                {/* 児童登録 */}
                <Typography variant="h6" sx={{ mt: 10 }}>
                  児童登録
                </Typography>
                {children.map((child, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: {
                          xs: "column",
                          sm: "column",
                          md: "row",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        label="児童名"
                        value={child.childName}
                        onChange={(e) => {
                          const updated = [...children];
                          updated[i] = {
                            ...updated[i],
                            childName: e.target.value,
                          };
                          setChildren(updated);
                        }}
                      />
                      <TextField
                        fullWidth
                        label="ふりがな"
                        value={child.childNameKana}
                        onChange={(e) => {
                          const updated = [...children];
                          updated[i] = {
                            ...updated[i],
                            childNameKana: e.target.value,
                          };
                          setChildren(updated);
                        }}
                      />
                      <FormControl fullWidth>
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
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: {
                          xs: "column",
                          sm: "column",
                          md: "row",
                        },
                      }}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 4,
                        }}
                        onClick={() => {
                          setChildren([
                            ...children,
                            {
                              childName: "",
                              childNameKana: "",
                              classRoomId: "",
                            },
                          ]);
                        }}
                      >
                        + 児童を追加する
                      </Button>
                      <Button
                        variant="text"
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                        }}
                        onClick={() => {
                          const updated = children.filter(
                            (child, index) => index !== i,
                          );
                          setChildren(
                            updated.length === 0
                              ? [
                                  {
                                    childName: "",
                                    childNameKana: "",
                                    classRoomId: "",
                                  },
                                ]
                              : updated,
                          );
                        }}
                      >
                        この児童を削除
                      </Button>
                    </Box>
                  </Box>
                ))}

                <Button
                  disabled={
                    familyName === "" ||
                    nameKana === "" ||
                    emailAddress === "" ||
                    password === "" ||
                    children.some(
                      (child) =>
                        child.childName === "" || child.classRoomId === "",
                    )
                  }
                  variant="contained"
                  sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}
                  onClick={handleSubmitParent}
                >
                  登録
                </Button>
              </Box>
            )}

            {/* 割り当て管理 */}
            {tab === 4 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  p: 3,
                  minHeight: "calc(100vh - 264px)",
                  maxHeight: "calc(100vh - 400px)",
                  overflow: "auto",
                  flexDirection: "column",
                }}
              >
                <Box>
                  <AssignmentState />
                </Box>
              </Box>
            )}

            {/* 教師編集画面 */}

            <Dialog
              open={teacherModalOpen}
              onClose={() => setTeacherModalOpen(false)}
            >
              <DialogTitle>先生の編集</DialogTitle>
              <DialogContent
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                <TextField
                  sx={{ mt: 2 }}
                  label="名前"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="ふりがな"
                  value={editNameKana}
                  onChange={(e) => setEditNameKana(e.target.value)}
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

            {/* 保護者編集画面 */}
            <Dialog
              open={parentModalOpen}
              onClose={() => setParentModalOpen(false)}
            >
              <DialogTitle>保護者の編集</DialogTitle>
              <DialogContent
                sx={
                  isMobile
                    ? {
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        overflow: "auto",
                        maxHeight: 300,
                        mt: 1,
                      }
                    : {
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 1,
                      }
                }
              >
                <TextField
                  sx={{ mt: 2 }}
                  label="保護者名"
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
                />
                {editChildren.map((child, i) => (
                  <Box key={i}>
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
                  </Box>
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
      </Paper>
    </Container>
  );
}
export default function Admin() {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <AdminContent />
    </Suspense>
  );
}
