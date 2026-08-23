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
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

type Child = {
  id: number;
  child_name: string;
  child_name_kana: string;
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

  // 名前の順
  const sortChildren = useMemo(() => {
    return [...filteredChildren].sort((a, b) => {
      return (a.child_name_kana ?? "").localeCompare(
        b.child_name_kana ?? "",
        "ja",
      );
    });
  }, [filteredChildren]);

  // 名前で検索
  const [serchText, setSerchText] = useState("");
  const serchChildren = useMemo(() => {
    return [...sortChildren].filter(
      (c) =>
        c.child_name.startsWith(serchText) ||
        c.child_name_kana.startsWith(serchText),
    );
  }, [sortChildren, serchText]);

  // 提出・割り当て状況
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
    return Math.ceil(serchChildren.length / itemsPerPage);
  }, [serchChildren, itemsPerPage]);

  const pagedChildren = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return serchChildren.slice(start, end);
  }, [serchChildren, itemsPerPage, currentPage]);

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2, maxHeight: 680 }}>
        <Box sx={{ p: 1 }}>
          <Box
            sx={{
              mb: 1,
              pl: 2,
            }}
          >
            <Typography variant="h5">児童一覧</Typography>
          </Box>
          {isMobile ? (
            <Box
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                textAlign: "center",
                minHeight: 850,
              }}
            >
              {sortChildren.map((child) => (
                <Card sx={{ boxShadow: 3, borderRadius: 2 }} key={child.id}>
                  <CardContent>
                    <Typography variant="h6">{child.child_name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
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
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ mb: 2 }}>
                  <Tabs
                    value={filter}
                    onChange={(_, v) => {
                      setFilter(v);
                      setCurrentPage(1);
                    }}
                    sx={{
                      "& .MuiTab-root": {
                        minWidth: 120,
                        "&:hover": {
                          backgroundColor: "rgba(26, 58, 107, 0.06)",
                        },
                      },
                      "& .Mui-selected": {
                        backgroundColor: "rgba(26, 58, 107, 0.14)",
                        "& .MuiTypography-root": { fontWeight: "bold" },
                      },
                    }}
                  >
                    <Tab
                      sx={{ borderRadius: 2 }}
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography>全て</Typography>
                          <Chip variant="outlined" label={counts.all} />
                        </Box>
                      }
                      value="all"
                    />
                    <Tab
                      sx={{ borderRadius: 2 }}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography>未提出</Typography>
                          <Chip
                            variant="outlined"
                            color="error"
                            label={counts.unsubmitted}
                          />
                        </Box>
                      }
                      value="unsubmitted"
                    />
                    <Tab
                      sx={{ borderRadius: 2 }}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography>予約待ち</Typography>
                          <Chip
                            variant="outlined"
                            color="warning"
                            label={counts.waiting}
                          />
                        </Box>
                      }
                      value="waiting"
                    />
                    <Tab
                      sx={{ borderRadius: 2 }}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography>予約済み</Typography>
                          <Chip
                            variant="outlined"
                            color="success"
                            label={counts.done}
                          />
                        </Box>
                      }
                      value="done"
                    />
                  </Tabs>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
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
                    value={serchText}
                    onChange={(e) => setSerchText(e.target.value)}
                  />
                </Box>
              </Box>

              <TableContainer
                component={Paper}
                sx={{
                  height: "calc(100vh - 360px)",
                  overflow: "auto",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: "white",
                          backgroundColor: "primary.dark",
                          width: "33%",
                        }}
                      >
                        児童名
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          backgroundColor: "primary.dark",
                          width: "33%",
                        }}
                      >
                        保護者名
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          backgroundColor: "primary.dark",
                          width: "34%",
                        }}
                      >
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
                          <Chip variant="outlined" {...getStatus(child)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: "flex", mt: 2, pl: 1 }}>
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
      </Paper>
    </Container>
  );
}
