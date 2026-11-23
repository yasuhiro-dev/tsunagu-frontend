"use client";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { MeetingSlot, formatTime } from "@/utils/dateUtils";
import Typography from "@mui/material/Typography";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import { highlightSx } from "@/app/highlight";

type UnavailabilityCardProps = {
  parentTourId?: string;
  tourId?: string;
  isConsecutiveEnough?: boolean;
  highlightSlotId?: number;
  isLastDate?: boolean;
  date: string;
  dateSlots: MeetingSlot[];
  isAvailable: (slot: MeetingSlot) => boolean;
  isDisabled: (slot: MeetingSlot) => boolean;
  onClickSlot: (slotId: number) => void;
  onSelectAll: (dateSlots: MeetingSlot[]) => void;
  onClearAll: (dateSlots: MeetingSlot[]) => void;
  showBlockedNote?: boolean;
  isBlocked?: (slot: MeetingSlot) => boolean;
  availableLabel: string;
  unavailableLabel: string;
};

export default function UnavailabilityCard({
  parentTourId = undefined,
  tourId = undefined,
  highlightSlotId,
  isLastDate = false,
  isConsecutiveEnough = false,
  date,
  dateSlots,
  isAvailable,
  isDisabled,
  onClickSlot,
  onSelectAll,
  onClearAll,
  showBlockedNote,
  isBlocked,
  availableLabel,
  unavailableLabel,
}: UnavailabilityCardProps) {
  return (
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Card
        sx={{
          mt: 2,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Box
          id={isLastDate ? "tour_parent_availability_button" : "undefined"}
          sx={{ display: "flex", gap: 2, p: 2, justifyContent: "center" }}
        >
          <Button
            id={isLastDate ? parentTourId : "undefined"}
            variant="outlined"
            size="small"
            onClick={() => onSelectAll(dateSlots)}
            sx={[!isConsecutiveEnough && isLastDate && highlightSx]}
          >
            全て可能
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onClearAll(dateSlots)}
          >
            全て不可
          </Button>
        </Box>
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

          {dateSlots.map((slot, index) => (
            <Box key={index} sx={{ mb: 1 }}>
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
                  disabled={isDisabled(slot)}
                  value={isAvailable(slot) ? "yes" : "no"} //選択済みの枠に含まれているか
                  exclusive //どちらか１つ
                  size="small"
                  onChange={(_, newValue) => {
                    if (newValue === null) return; //同じボタンを押した時何もしない
                    onClickSlot(slot.id); //違うボタンを押した時変わる
                  }}
                >
                  <Tooltip
                    title={
                      isDisabled(slot)
                        ? "面談が決定済みのため変更できません"
                        : ""
                    }
                  >
                    <span>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <ToggleButton
                          sx={{
                            opacity: isDisabled(slot) ? 0.2 : 1,
                            width: 80,
                            "&.Mui-selected": {
                              backgroundColor: "primary.main",
                              color: "common.white",
                              "&:hover": { backgroundColor: "primary.dark" },
                            },
                          }}
                          value="yes"
                        >
                          <Box
                            sx={[{ display: "flex", flexDirection: "column" }]}
                          >
                            <Typography component="span">○</Typography>
                            <Typography
                              sx={{ fontSize: "10px" }}
                              component="span"
                            >
                              {availableLabel}
                            </Typography>
                          </Box>
                        </ToggleButton>

                        <ToggleButton
                          id={
                            slot.id === highlightSlotId
                              ? "tour_teacher_unavailability_button"
                              : undefined
                          }
                          sx={{
                            opacity: isDisabled(slot) ? 0.2 : 1,
                            width: 80,
                            "&.Mui-selected": {
                              backgroundColor: "error.light",
                              color: "common.white",
                              "&:hover": { backgroundColor: "error.dark" },
                            },
                          }}
                          value="no"
                        >
                          <Box
                            id={
                              slot.id === highlightSlotId ? tourId : undefined
                            }
                            sx={[
                              { display: "flex", flexDirection: "column" },
                              slot.id === highlightSlotId && highlightSx,
                            ]}
                          >
                            <Typography component="span">×</Typography>
                            <Typography
                              sx={{ fontSize: "10px" }}
                              component="span"
                            >
                              {unavailableLabel}
                            </Typography>
                          </Box>
                        </ToggleButton>
                      </Box>
                    </span>
                  </Tooltip>
                </ToggleButtonGroup>
                {showBlockedNote && (
                  <Typography
                    variant="caption"
                    sx={{
                      visibility: isBlocked?.(slot) ? "visible" : "hidden",
                    }}
                  >
                    担任の先生の面談できない日時
                  </Typography>
                )}

                {/* 教師の都合によりボタン操作を不可にする */}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
