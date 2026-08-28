"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole, getName } from "@/utils/auth";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LogoutIcon from "@mui/icons-material/Logout";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Image from "next/image";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EventBusyIcon from "@mui/icons-material/EventBusy";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [name, setName] = useState<string | null>(null);
  const [logoutMessageOpen, setLogoutMessageOpen] = useState(false);
  // 要素からMenuを下ろす
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // クリックした要素をstateで保管
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  // 要素が何もない時閉じる
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  useEffect(() => {
    // localStorageはクライアントでしか読めないため、マウント後に同期する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setRole(getRole());
    setName(getName());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    setName(null);
    setAnchorEl(null);
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
          <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
            <Button component={Link} href="/">
              <Image
                src="/images/tsunagu4.png"
                alt="Tsunagu"
                width={70}
                height={70}
              />
              <Typography variant="h6">Tsunagu</Typography>
            </Button>
          </Box>
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}
          >
            {/* 教師でログイン */}
            {mounted && role === "teacher" && (
              <>
                <Button
                  component={Link}
                  href="/child_list"
                  variant="outlined"
                  color="inherit"
                  startIcon={<ChildCareIcon />}
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
                  startIcon={<EventNoteIcon />}
                  sx={{
                    borderRadius: 3,
                    "&:hover": { backgroundColor: "rgba(193, 149, 149, 0.1)" },
                    fontSize: isMobile ? "12px" : "16px",
                  }}
                >
                  面談表
                </Button>
                <Button
                  component={Link}
                  color="inherit"
                  variant="outlined"
                  href="/teacher_unavailabilities"
                  startIcon={<EventBusyIcon />}
                  sx={{
                    borderRadius: 3,
                    "&:hover": { backgroundColor: "rgba(193, 149, 149, 0.1)" },
                    fontSize: isMobile ? "12px" : "16px",
                  }}
                >
                  都合の悪い日時
                </Button>
              </>
            )}

            {/* 保護者でログイン */}
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
                  startIcon={<EventAvailableIcon />}
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
                  都合の悪い日時
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
              <Box
                onClick={handleClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mr: 2,
                  cursor: "pointer",
                  borderRadius: 2,
                  px: 1,
                  py: 0.5,
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                }}
              >
                <Typography variant="body2" color="inherit">
                  {role === "teacher"
                    ? `${name} 先生`
                    : role === "admin"
                      ? `管理者`
                      : `${name} 様`}
                </Typography>
                <KeyboardArrowDownIcon fontSize="small" />
              </Box>
            )}
          </Box>
          {/* メニュータグ */}
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {role !== "admin" && (
              <MenuItem component={Link} href="/settings" onClick={handleClose}>
                Googleアカウント連携
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              ログアウト
            </MenuItem>
          </Menu>
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
