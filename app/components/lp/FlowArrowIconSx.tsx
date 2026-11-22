import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";

//矢印の見た目を事前に設定
export default function FlowArrowIconSx() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <ArrowForwardIcon
        sx={{
          color: "text.secondary",
          fontSize: { xs: 8, sm: 8, md: 20 },
          transform: { xs: "rotate(90deg)", md: "none" },
        }}
      />
    </Box>
  );
}
