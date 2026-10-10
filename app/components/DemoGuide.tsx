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
import Box from "@mui/material/Box";
import { demoLogin, DEMO_ACCOUNTS } from "@/utils/demoLogin";
import AlertSnackbar from "@/app/components/AlertSnackbar";

// 親コンポーネントからpageを受け取る時の型指定
type Props = { page: DemoPage };

// 親から page を受け取る
export default function DemoGuide({ page }: Props) {
  // 受け取った pageで、文言を取り出して content に入れる
  const content = demoPageContent[page];
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  // sessionStorage に「案内を見た」と記録するときのキー名
  const storageKey = `demo-guide-seen:${page}`;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  const nextDemoSubmit = async () => {
    if (content.nextDemoRole) {
      //nextDemoRoleを持っているならば
      try {
        if (!content.buttonUrl) return;
        //apiが失敗しなければ実行
        const account = DEMO_ACCOUNTS[content.nextDemoRole]; //DEMO_ACCOUNTS に入っているメールとパスワードを取り出す
        const mail = account.email;
        const password = account.password;
        await demoLogin(mail, password); //メールとパスワードを持ってトークンを取得する
        setRedirectTo(content.buttonUrl);
      } catch {
        //api失敗したら表示する
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertMessage("デモログインに失敗しました");
      }
    } else {
      if (!content.buttonUrl) return;
      router.push(content.buttonUrl);
    }
  };
  // redirectToがセットされたら、実際に画面遷移を行う
  useEffect(() => {
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  }, [redirectTo]);

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
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <DialogTitle variant="h5">{content.title}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography>{content.purpose}</Typography>
        {content.steps?.map((step) => (
          <Typography sx={{ mb: 1 }} key={step}>
            {step}
          </Typography>
        ))}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {content.note}
        </Typography>
      </DialogContent>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {content.buttonCancel && (
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => {
                {
                  handleClose();
                }
              }}
            >
              {content.buttonCancel}
            </Button>
          </DialogActions>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              if (content.buttonUrl) {
                //遷移先があるかを判断
                nextDemoSubmit(); //ある場合には関数を呼ぶ、ボタンが１つしかないため引数に値を入れなくてもいい
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
      </Box>
    </Dialog>
  );
}
