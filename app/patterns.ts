import { alpha, Theme } from "@mui/material/styles";

type StripeOptions = {
  lineWidth?: number; // 線の太さ(px)
  gap?: number; // すき間(px)
  lineOpacity?: number; // 線の濃さ(0〜1)
};

// 灰色の斜線
export const teacherUnavailableBg = (
  theme: Theme,
  { lineWidth = 2, gap = 4, lineOpacity = 0.25 }: StripeOptions = {},
) => {
  const line = alpha(theme.palette.grey[500], lineOpacity); // 斜線の色
  const end = lineWidth + gap; // 1セットの長さ
  return {
    backgroundColor: alpha(theme.palette.grey[500], 0.1), // 背景色
    // 45度、0〜lineWidthを灰色、lineWidth〜endを透明、の繰り返し
    backgroundImage: `repeating-linear-gradient(
      45deg, ${line} 0px, ${line} ${lineWidth}px, transparent ${lineWidth}px, transparent ${end}px
    )`,
  };
};
