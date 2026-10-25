"use client";

import { DemoPage, demoPageContent } from "./demoGuideContent";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import NextStepButton from "@/app/components/NextStepButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// 親コンポーネントからpageを受け取る時の型指定
type Props = { page: DemoPage; open: boolean; onClose: () => void };
// sessionStorage に「案内を見た」と記録するときのキー名を作る（GuideHelpでも同じ形で使うから定義した）
export const getGuideStorageKey = (page: DemoPage) => `demo-guide-seen:${page}`;

// 親から page を受け取る
export default function DemoGuide({ page, open, onClose }: Props) {
  // 受け取った pageで、文言を取り出して content に入れる
  const content = demoPageContent[page];
  const handleClose = () => {
    // sessionStorage に「案内を見た」と記録するときのキー名（pageごとに記録される）
    const storageKey = `demo-guide-seen:${page}`;
    sessionStorage.setItem(storageKey, "1");
    onClose();
  };

  return (
    <Dialog sx={{ p: 1, mb: 3 }} onClose={handleClose} open={open}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          alignItems: "center",
        }}
      >
        <DialogTitle variant="h5">{content.title}</DialogTitle>

        <Chip
          label={content.chip}
          size="medium"
          sx={{
            fontSize: 18,
            fontWeight: "bold",
            backgroundColor: content.color,
            color: "common.white",
          }}
        />
      </Box>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6">{content.heading}</Typography>
        <Typography sx={{ whiteSpace: "pre-line" }}>
          {content.purpose}
        </Typography>
        {content.steps && content.steps.length > 0 && (
          <Box
            sx={{
              bgcolor: "grey.200",
              borderRadius: 2,
              p: 2,
            }}
          >
            {content.steps?.map((step, index) => (
              <Typography sx={{ mb: 1 }} key={index}>
                {step}
              </Typography>
            ))}
          </Box>
        )}

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {content.note}
        </Typography>
      </DialogContent>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {content.buttonCancel && (
          <DialogActions>
            <Button
              variant="outlined"
              sx={{ p: 1, fontSize: 14 }}
              onClick={handleClose}
            >
              {content.buttonCancel}
            </Button>
          </DialogActions>
        )}

        <DialogActions>
          {/* もしURL先がある場合、NextStepButtonが処理 */}
          {content.buttonUrl ? (
            <NextStepButton page={page} />
          ) : (
            // URL先がない場合は閉じるだけ
            <Button
              variant="contained"
              color="success"
              sx={{ p: 1, fontWeight: "bold", fontSize: 14 }}
              endIcon={<ArrowForwardIcon />}
              onClick={handleClose}
            >
              {content.buttonLabel}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
