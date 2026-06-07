"use client";

import { useState, useEffect } from "react";
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

  return (
    <div>
      {isMobile ? (
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            textAlign: "center",
          }}
        >
          {children.map((child) => (
            <Card sx={{ boxShadow: 3, borderRadius: 2 }} key={child.id}>
              <CardContent>
                <Typography variant="h6">{child.child_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {child.family_name}
                </Typography>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "8px",
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "white" }}>児童名</TableCell>
                <TableCell sx={{ color: "white" }}>保護者名</TableCell>
                <TableCell sx={{ color: "white" }}>提出状況</TableCell>
                <TableCell sx={{ color: "white" }}>予約状況</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((child) => (
                <TableRow
                  key={child.id}
                  sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                >
                  <TableCell>{child.child_name}</TableCell>
                  <TableCell>{child.family_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={child.submitted ? "提出済み" : "未提出"}
                      color={child.submitted ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={child.assigned ? "予約済み" : "予約なし"}
                      color={child.assigned ? "success" : "error"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
