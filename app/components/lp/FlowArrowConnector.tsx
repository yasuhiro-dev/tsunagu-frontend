import FlowArrowIconSx from "@/app/components/lp/FlowArrowIconSx";
import Box from "@mui/material/Box";

type Props = {
  offset?: number;
};

export default function FlowArrowConnector({ offset = 25 }: Props) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        bottom: 0, // 上から下まで、カードと同じ高さにする
        right: -offset,
        display: { xs: "none", md: "flex" },
        alignItems: "center", // その中で、縦の真ん中に置く
        zIndex: 1,
        "& svg": {
          fontSize: 40,
          color: "primary.main",
        },
      }}
    >
      <FlowArrowIconSx />
    </Box>
  );
}
