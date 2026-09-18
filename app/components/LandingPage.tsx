"use client";

import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MailIcon from "@mui/icons-material/Mail";
import useMediaQuery from "@mui/material/useMediaQuery";
import AlertSnackbar from "@/app/components/AlertSnackbar";

type RedirectMap = {
  teacher: string;
  parent: string;
  admin: string;
};

export default function LandingPage() {
  const demoSectionRef = useRef<HTMLElement>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const handleSubmit = async (
    loginEmail: string,
    loginPassword: string,
    redirectOverride?: string,
  ) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: loginEmail,
        password: loginPassword,
      }),
    });
    if (res.ok) {
      const data: { token: string; role: keyof RedirectMap } = await res.json();
      localStorage.setItem("token", data.token);
      const redirectMap: RedirectMap = {
        teacher: "/meeting_slots",
        parent: "/family_unavailabilities",
        admin: "/admin",
      };
      // redirectOverride（my_scheduleへの遷移）がなければroleを見て指定されたURLへ遷移
      setRedirectTo(redirectOverride ?? redirectMap[data.role] ?? "/");
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("デモログインに失敗しました");
    }
  };
  // redirectToがセットされたら、実際に画面遷移を行う
  useEffect(() => {
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  }, [redirectTo]);

  // 3つの立場の説明
  const roleDescriptions = [
    {
      image: "/images/admin.webp",
      title: "管理者",
      description: "学校全体の面談日程をつくる",
      items: [
        "教師・保護者情報の登録・編集",
        "面談の一括自動割り当て",
        "提出締切日の設定",
        "クラス別の割り当て状況の可視化",
      ],
      color: "#e8f5ee",
      circleColor: "success.main",
    },
    {
      image: "/images/teacher.webp",
      title: "教師",
      description: "自分の予定を確認・調整する",
      items: [
        "児童一覧・未提出者の確認",
        "未割当児童の一覧確認",
        "個別の手動割り当て",
        "面談不可日時の登録",
        "面談表のPDF出力",
      ],
      color: "#d6e4f0",
      circleColor: "primary.main",
    },
    {
      image: "/images/parent.webp",
      title: "保護者",
      description: "都合を伝え、日程を確認する",
      items: [
        "参加できる日時を選んで提出",
        "調整中の状況を確認",
        "確定した面談日を確認",
      ],
      color: "#fbebec",
      circleColor: "error.main",
    },
  ];

  // 学校の悩みの説明
  const teacherProblems = [
    {
      title: "兄弟の調整",
      image: "/images/problems/siblings.webp",
      description: "兄弟が別々な日になると何度も来校する必要がある",
      color: "#d6e4f0",
    },
    {
      title: "支援学級との調整",
      image: "/images/problems/support.webp",
      description: "通常学級と支援学級の面談も連続にする必要がある",
      color: "#d6e4f0",
    },
    {
      title: "保護者の都合",
      image: "/images/problems/parent.webp",
      description: "仕事や家庭の都合で来られない時間がある",
      color: "#d6e4f0",
    },
    {
      title: "教師の都合",
      image: "/images/problems/teacher.webp",
      description: "出張が入っている日には実施できない",
      color: "#d6e4f0",
    },
  ];

  const roleExperience = [
    {
      image: "/images/admin.webp",
      title: "管理者として体験する",
      description: "自動割り当てや結果を確認できます",
      mail: "admin@example.com",
      color: "#e8f5ee",
      font_color: "",
      button: "管理者デモを開始",
      circleColor: "success.main",
    },
    {
      image: "/images/teacher.webp",
      title: "教師として体験する",
      description: "面談表や未提出者の確認、手動調節などを体験できます",
      mail: "aoki@example.com",
      color: "#d6e4f0",
      button: "教師デモを開始",
      circleColor: "primary.main",
    },
    {
      image: "/images/parent.webp",
      title: "保護者として体験する",
      description: "都合を選んで提出し、面談日の確認までを体験できます",
      mail: "parent-nonsubmit@example.com",
      color: "#fbebec",
      button: "保護者デモを開始",
      circleColor: "error.main",
    },
  ];

  const steps = [
    {
      image: "/images/tsunagu-logic/group.webp",
      title: "家庭をグループ化",
      description: "兄弟のいる児童はグループ化、いない児童は単独で処理します",
    },
    {
      image: "/images/tsunagu-logic/priority.webp",
      title: "優先順位を決定",
      description:
        "兄弟・特別支援・時間を考慮し、対応が難しい家庭ほど優先度を高くします",
    },
    {
      image: "/images/tsunagu-logic/filter.webp",
      title: "空き枠から条件に合う候補を探す",
      description: "時間・兄弟・特別支援の条件を順に確認します",
    },
    {
      image: "/images/tsunagu-logic/auto.webp",
      title: "優先度の高い順に自動配置",
      description: "絞り込んだ候補の中から、優先度の高い家庭から順に配置します",
    },
    {
      image: "/images/tsunagu-logic/teacher-controll.webp",
      title: "配置できなかった家庭を確認",
      description: "条件に合う枠がなかった家庭は、教師が調整します",
    },
  ];
  // モバイルの時（widthが600px以下の場合trueを返す）
  const isMobile = useMediaQuery("(max-width:600px)");

  const fontSizes = {
    subheading: { xs: "14px", sm: "18px", md: "24px" }, //タイトル
    caption: { xs: "14px", sm: "14px", md: "16px" }, // サブタイトル・チェック項目文など
    body: { xs: "13px", sm: "13px", md: "14px" }, // 比較表の説明文など
    lead: { xs: "15px", sm: "15px", md: "14px" }, // 「なぜ作ったのか」本文
  };

  return (
    <>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      {/* ヒーロー */}
      <Box
        sx={{
          display: "flex",
          p: 4,
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          {/* ヒーロー見出し */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "text.secondary",
                mb: 1,
                fontSize: fontSizes.caption,
              }}
            >
              学校向け 面談日程調整サービス
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h3"
                sx={{ fontSize: { xs: "26px", sm: "36px", md: "48px" } }}
              >
                保護者が学校へ行く日を、
                <br />
                1日にまとめます。
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "15px", sm: "15px", md: "18px" },
                  lineHeight: 1.8,
                  color: "text.secondary",
                }}
              >
                兄弟も支援学級も保護者の都合も。
                <br />
                複数の条件を考慮して、面談日程を自動でする
                <br />
                学校向けのスケジューリングジステムです。
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Button
                  onClick={() =>
                    demoSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  variant="contained"
                  sx={{ minWidth: 300, minHeight: 50 }}
                >
                  デモを体験する(約３分)→
                </Button>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  ログイン不要・デモデータですぐに体験できます
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 兄弟連続画像 */}
          <Box
            sx={{
              flex: 1,
              m: 2,
              maxHeight: 350,
            }}
          >
            画像
          </Box>
        </Box>
      </Box>
      <Typography variant="h4">
        教師の空き状況と保護者の希望から、管理者が児童の面談日をつくります。
      </Typography>
      {/* ３つの役割の説明をまとめる箱 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          p: 3,
          justifyContent: "center",
          gap: { xs: 3, md: 6 },
        }}
      >
        {roleDescriptions.map((role, index) => {
          return (
            // １役割の説明が書かれている箱
            <Box
              key={index}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: role.color,
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography variant="h5" sx={{ color: role.circleColor }}>
                {role.title}
              </Typography>
              <Image
                src={role.image}
                alt={role.title}
                width={300}
                height={300}
              />

              <Typography>{role.description}</Typography>
              <Box sx={{ textAlign: "left" }}>
                {role.items.map((item, itemIndex) => (
                  <Typography key={itemIndex}>
                    <CheckCircleIcon sx={{ color: role.circleColor }} />
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 学校現場の悩み */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h4">学校現場の悩み</Typography>
          <Typography variant="h4">面談調整は、条件が多くて大変です</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            p: 2,
            alignItems: "center",
          }}
        >
          {teacherProblems.map((problem, index) => {
            return (
              <Box
                key={index}
                sx={{
                  backgroundColor: problem.color,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minHeight: 250,
                  flex: 1,
                }}
              >
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                  {problem.title}
                </Typography>

                <Image
                  src={problem.image}
                  alt={problem.title}
                  width={300}
                  height={300}
                />
                <Typography sx={{ textAlign: "center", width: 200 }}>
                  {problem.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box>
          <Typography variant="h4">
            これらを１件ずつ調節するには、時間がかかります
          </Typography>
        </Box>
      </Box>

      {/* tsunaguの割り当てロジックフロー */}
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#d6e4f0",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
          >
            Tsunaguなら
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
          >
            複数の条件を考慮して、面談日程を自動で組み立てます。
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              // ロジックの大外
              <Box
                key={step.title}
                sx={{
                  display: "flex",

                  flexDirection: { xs: "column", sm: "column", md: "row" },
                }}
              >
                {/* 「アイコンの円」「タイトル」「説明文」を囲んでいる */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    flex: 1,
                    width: 250,
                  }}
                >
                  {/* アイコン１つだけを囲んでいる */}
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={400}
                      height={400}
                    />
                  </Box>
                  <Typography variant="subtitle1">{step.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {step.description}
                  </Typography>
                </Box>

                {!isLast && (isMobile ? <span>↓</span> : <span>→</span>)}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 実際のtsunaguの動画 */}

      {/*デモ導線 */}

      <Box component="section" ref={demoSectionRef} sx={{ p: 3 }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
        >
          デモでTsunaguを体験する
        </Typography>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
        >
          実際の画面で、それぞれの立場の操作を体験できます
          デモデータをご用意しているので、すぐにお試しいただけます
        </Typography>

        {/* 管理者側の枠 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
            gap: { xs: 3, md: 6 },
          }}
        >
          {roleExperience.map((role, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: role.color,
                flex: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  textAlign: "center",
                  fontSize: fontSizes.caption,
                  color: role.circleColor,
                }}
              >
                {role.title}
              </Typography>
              <Image
                src={role.image}
                alt={role.title}
                width={300}
                height={300}
              />

              <Typography sx={{ fontSize: fontSizes.caption }}>
                {role.description}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleSubmit(role.mail, "password")}
              >
                {role.button}
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

      {/* プレビュー */}
      <Box sx={{ display: "flex", p: 4, flexDirection: "column" }}>
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
        >
          出力プレビュー
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 2,
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 550,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PictureAsPdfIcon sx={{ color: "red" }} />
              <Typography variant="h5" sx={{ fontSize: fontSizes.subheading }}>
                面談表PDF
              </Typography>
            </Box>
            <Box sx={{ position: "relative", width: "100%", flex: 1, mt: 1 }}>
              <Image
                src="/images/meeting-slots.png"
                alt="面談表"
                fill
                style={{ objectFit: "contain", borderRadius: 8 }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 550,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MailIcon sx={{ color: "blue", ml: isMobile ? 0 : 15 }} />
              <Typography variant="h5" sx={{ fontSize: fontSizes.subheading }}>
                保護者への通知メール
              </Typography>
            </Box>
            <Box sx={{ position: "relative", width: "100%", flex: 1, mt: 1 }}>
              <Image
                src="/images/gmail-response.png"
                alt="通知メール"
                fill
                style={{ objectFit: "contain", borderRadius: 8 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* なぜTsunaguを作ったのか */}
      <Box component="section" sx={{ p: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 2, fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
        >
          なぜTsunaguを作ったのか
        </Typography>
        <Typography
          variant="body2"
          sx={{
            maxWidth: 700,
            lineHeight: 1.8,
            color: "text.secondary",
            mb: 3,
            fontSize: fontSizes.caption,
          }}
        >
          教員として働く中で、保護者面談の日程調整に多くの時間を取られる場面を見てきました。
          Googleフォームなどを使う学校もありますが、兄弟の連続配置や特別支援学級への配慮といった
          学校特有の条件までは対応しきれていないのが実情です。
          <br />
          <br />
          そこで、学校現場の運用に合わせた面談日程調整システム「Tsunagu」を開発しました。
        </Typography>
        <Image
          src="/images/teacher-picture.webp"
          alt="調整に追われる時間から、子どもと向き合う時間へ"
          width={1200}
          height={800}
          style={{ width: "100%", height: "auto", borderRadius: 8 }}
        />
      </Box>
    </>
  );
}
