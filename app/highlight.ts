import { Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";

export const highlightSx: SystemStyleObject<Theme> = {
  "@keyframes pulse": {
    "0%": {
      boxShadow: "0 0 0 0 rgba(255,167,38,0.9)",
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.04)",
    },
    "70%": {
      boxShadow: "0 0 0 16px rgba(255,167,38,0)",
    },
    "100%": {
      boxShadow: "0 0 0 0 rgba(255,167,38,0)",
      transform: "scale(1)",
    },
  },
  animation: "pulse 1.5s infinite",
};
