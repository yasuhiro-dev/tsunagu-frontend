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
import { formatDate, formatTime } from "@/utils/dateUtils";
import Alert from "@mui/material/Alert";

type Props = {
  open: boolean;
  slotId: number;
  startAt: string;
  onClose: () => void;
  onAdded: () => void;
};
type Child = {
  id: number;
  child_name: string;
  className: string;
  submitted: boolean;
  available_start_at: string[]; //希望日
};

export default function UnassignedSelectDialog({
  open,
  slotId,
  startAt,
  onClose,
  onAdded,
}: Props) {
  const [unassignedList, setUnassignedList] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  //未割り当てリストにいる児童を選ぶ
  const selectedChild = unassignedList.find((c) => c.id === selectedId);
  //未提出の家庭は「制約なし」扱い
  const isAvailable =
    !selectedChild?.submitted || //未提出？ → yes なら即 true（ここで終わり）
    selectedChild.available_start_at.includes(startAt); //提出済みなら、希望日がこの枠と一緒か

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
      <DialogTitle>
        {formatDate(startAt)} {formatTime(startAt)}に割り当てる児童を選択
      </DialogTitle>
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
        {selectedChild && (
          <Alert severity={isAvailable ? "info" : "warning"}>
            {isAvailable ? (
              `${selectedChild.child_name}さんを割り当てます` //未提出・希望日が通っている場合
            ) : (
              <>
                {selectedChild.child_name}さんの保護者が参加できない時間です。
                <br />
                割り当てる前に、保護者へ電話で都合を確認しましょう
              </>
            )}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          onClick={handleConfirm}
          variant={isAvailable ? "contained" : "outlined"}
          color={isAvailable ? "primary" : "warning"}
          disabled={!selectedId}
        >
          {isAvailable ? "確定" : "割り当てる"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
