"use client";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { MeetingSlot, formatTime } from "@/utils/dateUtils";
import Typography from "@mui/material/Typography";

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
                <Button
                  variant="contained"
                  size="small"
                  color={isUnavailable(slot) ? "error" : "primary"}
                  onClick={() => onClickSlot(slot.id)}
                  disabled={isDisabled(slot)}
                  sx={{
                    "&.Mui-disabled": {
                      backgroundColor: isUnavailable(slot)
                        ? "error"
                        : "primary",
                      color: "white",
                    },
                  }}
                >
                  {isUnavailable(slot) ? "面談不可" : "面談可"}
                  {/* 教師の都合によりボタン操作を不可にする */}
                </Button>
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
