"use client";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { MeetingSlot, formatTime } from "@/utils/dateUtils";
import Typography from "@mui/material/Typography";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

type UnavailabilityCardProps = {
  date: string;
  dateSlots: MeetingSlot[];
  isUnavailable: (slot: MeetingSlot) => boolean;
  isDisabled: (slot: MeetingSlot) => boolean;
  onClickSlot: (slotId: number) => void;
  onSelectAll: (dateSlots: MeetingSlot[]) => void;
  onClearAll: (dateSlots: MeetingSlot[]) => void;
  showBlockedNote?: boolean;
  isBlocked?: (slot: MeetingSlot) => boolean;
};

export default function UnavailabilityCard({
  date,
  dateSlots,
  isUnavailable,
  isDisabled,
  onClickSlot,
  onSelectAll,
  onClearAll,
  showBlockedNote,
  isBlocked,
}: UnavailabilityCardProps) {
  return (
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              color: "primary.dark",
              borderBottom: 2,
              borderColor: "primary.main",
              pb: 2,
            }}
          >
            {date}
          </Typography>
          {dateSlots.map((slot) => (
            <Box key={slot.id} sx={{ mb: 1 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  mb: 1,
                  textAlign: "center",
                }}
              >
                {formatTime(slot.start_at)}~{formatTime(slot.end_at)}
              </Typography>
              <Box
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  mb: 1,
                  pb: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <ToggleButtonGroup
                  color={isUnavailable(slot) ? "error" : "primary"}
                  disabled={isDisabled(slot)}
                  value={isUnavailable(slot) ? "no" : "yes"} //unavailable_slotに値があるかないか
                  exclusive //どちらか１つ
                  size="small"
                  onChange={(_, newValue) => {
                    if (newValue === null) return; //同じボタンを押した時何もしない
                    onClickSlot(slot.id); //違うボタンを押した時変わる
                  }}
                >
                  <Box>
                    <ToggleButton
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "primary.main",
                          color: "common.white",
                          "&:hover": { backgroundColor: "primary.dark" },
                        },
                      }}
                      value="yes"
                    >
                      ○ 可
                    </ToggleButton>
                    <ToggleButton
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "error.main",
                          color: "common.white",
                          "&:hover": { backgroundColor: "error.dark" },
                        },
                      }}
                      value="no"
                    >
                      × 不可
                    </ToggleButton>
                  </Box>
                </ToggleButtonGroup>
                {showBlockedNote && (
                  <Typography
                    variant="caption"
                    sx={{
                      visibility: isBlocked?.(slot) ? "visible" : "hidden",
                    }}
                  >
                    教師の都合により対応不可
                  </Typography>
                )}

                {/* 教師の都合によりボタン操作を不可にする */}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
      <Box sx={{ display: "flex", gap: 2, mt: 1, justifyContent: "center" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onSelectAll(dateSlots)}
        >
          全選択
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClearAll(dateSlots)}
        >
          全解除
        </Button>
      </Box>
    </Box>
  );
}
