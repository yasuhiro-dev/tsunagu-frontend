"use client";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export type AlertSnackbarProps = {
  autoHideDuration?: number | null;
  open: boolean;
  severity: "success" | "error";
  message: string;
  onClose: () => void;
};

export default function AlertSnackbar({
  autoHideDuration,
  open,
  severity,
  message,
  onClose,
}: AlertSnackbarProps) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
    >
      <Alert severity={severity}>{message}</Alert>
    </Snackbar>
  );
}
