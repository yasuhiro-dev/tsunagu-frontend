"use client";

import UnassignedSelectDialog from "./UnassignedSelectDialog";
import { useState } from "react";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";

type Props = {
  slotId: number;
  onAdded: () => void;
  isEditing: boolean;
};

export default function SlotAddPopover({ slotId, isEditing, onAdded }: Props) {
  const [openSelect, setOpenSelect] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          pointerEvents: isEditing ? "none" : "auto", //slotの移動中は未割り当て児童一覧を呼ばない
          opacity: isEditing ? 0.4 : 1,
        }}
        onClick={() => {
          if (isEditing) return;
          setOpenSelect(true);
        }}
      >
        <Box sx={{ color: "primary.main" }}>
          <AddIcon />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "primary.main" }}>
            児童を割り当てる
          </Typography>
        </Box>
      </Box>

      <UnassignedSelectDialog
        open={openSelect}
        slotId={slotId}
        onClose={() => setOpenSelect(false)}
        onAdded={() => {
          setOpenSelect(false);
          onAdded();
        }}
      />
    </>
  );
}
