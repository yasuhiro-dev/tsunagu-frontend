"use client";

import { useState, useEffect, useMemo } from "react";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";

type Child = {
  id: number;
  child_name: string;
  family_name: string;
  submitted: boolean;
  assigned: boolean;
};

export default function ChildList() {
  const [children, setChildren] = useState<Child[]>([]);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const counts = {
    all: children.length,
    unsubmitted: children.filter((c) => !c.submitted).length,
    waiting: children.filter((c) => c.submitted && !c.assigned).length,
    done: children.filter((c) => c.submitted && c.assigned).length,
  };

  const filteredChildren = children.filter((child) => {
    if (filter === "all") return true;
    if (filter === "unsubmitted") return !child.submitted;
    if (filter === "waiting") return child.submitted && !child.assigned;
    if (filter === "done") return child.submitted && child.assigned;
  });
  const getStatus = (child: Child) => {
    if (!child.submitted) return { label: "未提出", color: "error" as const };
    if (!child.assigned)
      return { label: "予約待ち", color: "warning" as const };
    return { label: "完了", color: "success" as const };
  };
  useEffect(() => {
    const fetchChildren = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/child_list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setChildren(data);
    };
    fetchChildren();
  }, []);

  const totalPerPages = useMemo(() => {
    return Math.ceil(filteredChildren.length / itemsPerPage);
  }, [filteredChildren, itemsPerPage]);

  const pagedChildren = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return filteredChildren.slice(start, end);
  }, [filteredChildren, itemsPerPage, currentPage]);

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          mt: 2,
        }}
      >
        <Typography variant="h5">児童一覧</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Card sx={{ p: 2, minWidth: 100, textAlign: "center" }}>
            <Typography>児童数</Typography>
            <Typography variant="h4">{counts.all}</Typography>
          </Card>
          <Card sx={{ p: 2, minWidth: 100, textAlign: "center" }}>
            <Typography>未提出</Typography>
            <Typography variant="h4" color="error">
              {counts.unsubmitted}
            </Typography>
          </Card>
          <Card sx={{ p: 2, minWidth: 100, textAlign: "center" }}>
            <Typography>未割り当て</Typography>
            <Typography variant="h4" color="warning">
              {counts.waiting}
            </Typography>
          </Card>
          <Card sx={{ p: 2, minWidth: 100, textAlign: "center" }}>
            <Typography>予約済み</Typography>
            <Typography variant="h4" color="success">
              {counts.done}
            </Typography>
          </Card>
        </Box>
      </Box>
      {isMobile ? (
        <Box
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            textAlign: "center",
          }}
        >
          {filteredChildren.map((child) => (
            <Card sx={{ boxShadow: 3, borderRadius: 2 }} key={child.id}>
              <CardContent>
                <Typography variant="h6">{child.child_name}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {child.family_name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1,
                    justifyContent: "center",
                  }}
                >
                  <Chip
                    label={child.submitted ? "提出済み" : "未提出"}
                    color={child.submitted ? "success" : "error"}
                  />
                  <Chip
                    label={child.assigned ? "予約済み" : "予約なし"}
                    color={child.assigned ? "success" : "error"}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box>
          <Tabs
            value={filter}
            onChange={(_, v) => {
              setFilter(v);
              setCurrentPage(1);
            }}
          >
            <Tab
              sx={{ minWidth: 120 }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>全て</Typography>
                  <Chip label={counts.all} />
                </Box>
              }
              value="all"
            />
            <Tab
              sx={{ minWidth: 120 }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>未提出</Typography>
                  <Chip color="error" label={counts.unsubmitted} />
                </Box>
              }
              value="unsubmitted"
            />
            <Tab
              sx={{ minWidth: 120 }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>予約待ち</Typography>
                  <Chip color="warning" label={counts.waiting} />
                </Box>
              }
              value="waiting"
            />
            <Tab
              sx={{ minWidth: 120 }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>予約済み</Typography>
                  <Chip color="success" label={counts.done} />
                </Box>
              }
              value="done"
            />
          </Tabs>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: "calc(100vh - 100px)" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.dark" }}>
                  <TableCell sx={{ color: "white", width: "40%" }}>
                    児童名
                  </TableCell>
                  <TableCell sx={{ color: "white", width: "40%" }}>
                    保護者名
                  </TableCell>
                  <TableCell sx={{ color: "white", width: "20%" }}>
                    ステータス
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedChildren.map((child) => (
                  <TableRow
                    key={child.id}
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                  >
                    <TableCell>{child.child_name}</TableCell>
                    <TableCell>{child.family_name}</TableCell>
                    <TableCell>
                      <Chip {...getStatus(child)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPerPages}
              page={currentPage}
              onChange={(_, page) => {
                setCurrentPage(page);
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
