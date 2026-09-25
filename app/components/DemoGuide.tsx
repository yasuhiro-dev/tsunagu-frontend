"use client";

import { DemoPage, demoPageContent } from "./demoGuideContent";
import Typography from "@mui/material/Typography";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// 親コンポーネントからpageを受け取る時の型指定
type Props = { page: DemoPage };

// 親から page を受け取る
export default function DemoGuide({ page }: Props) {
  // 受け取った pageで、文言を取り出して content に入れる
  const content = demoPageContent[page];
  // sessionStorage に「案内を見た」と記録するときのキー名
  const storageKey = `demo-guide-seen:${page}`;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem(storageKey)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [storageKey]);

  const handleClose = () => {
    sessionStorage.setItem(storageKey, "1");
    setOpen(false);
  };

  return (
    <Dialog sx={{ p: 1, mb: 3 }} onClose={handleClose} open={open}>
      <DialogTitle variant="h5">{content.title}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography>{content.purpose}</Typography>
        {content.steps.map((step) => (
          <Typography sx={{ mb: 1 }} key={step}>
            {step}
          </Typography>
        ))}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {content.note}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            if (content.buttonUrl) {
              router.push(content.buttonUrl);
            } else {
              {
                handleClose();
              }
            }
          }}
        >
          {content.buttonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
