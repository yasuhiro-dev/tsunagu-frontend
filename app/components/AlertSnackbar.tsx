"use client";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export type AlertSnackbarProps = {
  open: boolean;
  severity: "success" | "error";
  message: string;
  onClose: () => void;
};

export default function AlertSnackbar({
  open,
  severity,
  message,
  onClose,
}: AlertSnackbarProps) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
    >
      <Alert severity={severity}>{message}</Alert>
    </Snackbar>
  );
}
