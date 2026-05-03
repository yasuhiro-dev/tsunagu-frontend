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

export default function Admin() {
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const router = useRouter();
  const [tab, setTab] = useState(0);

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
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data.teachers);
        setParents(data.parents);
      });
  }, [router]);

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
