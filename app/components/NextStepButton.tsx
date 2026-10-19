"use client";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
import { DemoPage, demoPageContent } from "./demoGuideContent";
import { demoLogin, DEMO_ACCOUNTS } from "@/utils/demoLogin";
import { useRouter } from "next/navigation";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import { useState, useEffect } from "react";

type Props = { page: DemoPage };

export default function NextStepButton({ page }: Props) {
  const content = demoPageContent[page];
  const router = useRouter();
  const [alertOpen, setAlertOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
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
  return (
    <>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      <Button
        variant="contained"
        color="success"
        sx={{ p: 1, fontWeight: "bold", fontSize: 14 }}
        endIcon={<ArrowForwardIcon />}
        onClick={() => {
          if (content.buttonUrl) {
            //遷移先があるかを判断
            nextDemoSubmit(); //ある場合には関数を呼ぶ
          }
        }}
      >
        {content.buttonLabel}
      </Button>
    </>
  );
}
