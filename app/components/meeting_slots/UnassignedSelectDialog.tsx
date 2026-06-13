"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  slotId: number;
  onClose: () => void;
  onAdded: () => void;
};
type Child = {
  id: number;
  child_name: string;
  className: string;
};

export default function UnassignedSelectDialog({
  open,
  slotId,
  onClose,
  onAdded,
}: Props) {
  const [unassignedList, setUnassignedList] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUnassigned = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/children/unassigned`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await res.json();
    setUnassignedList(data);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ meeting_slot_id: slotId, child_id: selectedId }),
    });
    onAdded();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      fetchUnassigned();
    }, 0);

    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>未割り当て児童から選択</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {unassignedList.map((child) => (
              <ListItemButton
                key={child.id}
                selected={selectedId === child.id}
                onClick={() => setSelectedId(child.id)}
              >
                <ListItemText primary={child.child_name} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedId}
        >
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
