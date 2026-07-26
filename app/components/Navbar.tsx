"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import Avatar from "@mui/material/Avatar";
import LogoutIcon from "@mui/icons-material/Logout";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Image from "next/image";

const decodeToken = (token: string) => {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(escape(atob(base64))));
};

const getRole = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = decodeToken(token);
    return decoded.role;
  } catch {
    return null;
  }
};

const getName = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = decodeToken(token);
    return decoded.name;
  } catch {
    return null;
  }
};

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [name, setName] = useState<string | null>(null);
  const [logoutMessageOpen, setLogoutMessageOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRole(getRole());
    setName(getName());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    setName(null);
    setLogoutMessageOpen(true);
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#ffffff", color: "primary.main" }}
      >
        <Toolbar>
          <Box sx={{ p: 1 }}>
            <Image
              src="/tsunag_logo2.png"
              alt="Tsunagu"
              width={140}
              height={40}
              className="h-12 w-auto"
            />
          </Box>

          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}
          >
            {mounted && role === "teacher" && (
              <>
                <Button
                  component={Link}
                  href="/child_list"
                  variant="outlined"
                  color="inherit"
                  sx={{
                    borderRadius: 3,
                    "&:hover": { backgroundColor: "rgba(193, 149, 149, 0.1)" },
                    fontSize: isMobile ? "12px" : "16px",
                  }}
                >
                  児童一覧
                </Button>
                <Button
                  component={Link}
                  color="inherit"
                  variant="outlined"
                  href="/meeting_slots"
                  sx={{
                    borderRadius: 3,
                    "&:hover": { backgroundColor: "rgba(193, 149, 149, 0.1)" },
                    fontSize: isMobile ? "12px" : "16px",
                  }}
                >
                  面談表
                </Button>
              </>
            )}
            {mounted && role === "parent" && (
              <>
                <Button
                  sx={{
                    borderRadius: 3,
                    fontSize: isMobile ? "12px" : "16px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  variant="outlined"
                  component={Link}
                  startIcon={<CalendarMonthIcon />}
                  href="/my_schedule"
                  color="inherit"
                >
                  面談の決定日
                </Button>
                <Button
                  sx={{
                    borderRadius: 3,
                    fontSize: isMobile ? "12px" : "16px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  variant="outlined"
                  component={Link}
                  href="/family_unavailabilities"
                  startIcon={<EventBusyIcon />}
                  color="inherit"
                >
                  不可日時
                </Button>
              </>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
            }}
          >
            {mounted && role === null && (
              <Button
                component={Link}
                href="/login"
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                  fontSize: isMobile ? "12px" : "16px",
                }}
              >
                ログイン
              </Button>
            )}
            {mounted && role !== null && (
              <>
                <Button
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  color="inherit"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                >
                  ログアウト
                </Button>
                <Box
                  sx={{
                    width: "1px",
                    height: "24px",
                    backgroundColor: "rgba(255,255,255,0.4)",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mr: 2,
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "#ffffff33" }}>
                    {name?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" color="inherit">
                    {role === "teacher"
                      ? `${name} 先生`
                      : role === "admin"
                        ? `管理者`
                        : `${name} 様`}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Snackbar
        open={logoutMessageOpen}
        autoHideDuration={1500}
        onClose={() => setLogoutMessageOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          ログアウトしました
        </Alert>
      </Snackbar>
    </>
  );
}
