"use client";

import { DemoRole, demoGuideContent } from "./demoGuideContent";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

// 親コンポーネントからroleを受け取る時の型指定
type Props = { role: DemoRole };

// 親から role を受け取る
export default function DemoGuide({ role }: Props) {
  // 受け取った role(教師・管理者・保護者) で、文言を取り出して content に入れる
  const content = demoGuideContent[role];
  const [openBanner, setOpenBanner] = useState(true);

  if (!openBanner) return null;

  return (
    <Alert
      sx={{ p: 1, mb: 3 }}
      severity="info"
      variant="outlined"
      onClose={() => setOpenBanner(false)}
    >
      <AlertTitle variant="h5">{content.roleLabel}として体験中です</AlertTitle>
      <Typography>{content.purpose}</Typography>
      {content.steps.map((step) => (
        <Typography sx={{ mb: 1 }} key={step}>
          {step}
        </Typography>
      ))}
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {content.note}
      </Typography>
    </Alert>
  );
}
