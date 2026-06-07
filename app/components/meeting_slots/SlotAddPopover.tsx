"use client";

import UnassignedSelectDialog from "./UnassignedSelectDialog";
import { useState } from "react";
import {
  IconButton,
  Popover,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import MenuList from "@mui/material/MenuList";

type Props = {
  slotId: number;
  dateLabel: string;
  timeLabel: string;
  onAdded: () => void;
};

export default function SlotAddPopover({
  slotId,
  dateLabel,
  timeLabel,
  onAdded,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openSelect, setOpenSelect] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <AddIcon />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              setOpenSelect(true);
              handleClose();
            }}
          >
            <ListItemIcon>
              <PeopleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>未割り当てから選択</ListItemText>
          </MenuItem>
        </MenuList>
      </Popover>
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
