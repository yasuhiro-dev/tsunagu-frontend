"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import Paper from "@mui/material/Paper";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MailIcon from "@mui/icons-material/Mail";
import useMediaQuery from "@mui/material/useMediaQuery";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";

type RedirectMap = {
  teacher: string;
  parent: string;
  admin: string;
};

export default function LandingPage() {
  const workflowRef = useRef<HTMLElement>(null);
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
        teacher: "/teacher_unavailabilities",
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
      image: "/images/teacher.webp",
      title: "教師",
      description: "自分の予定を確認・調整する",
      items: [
        "児童一覧・未提出者の確認",
        "個別の手動割り当て",
        "都合の悪い日時の登録",
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
        "スマホ操作も可能",
      ],
      color: "#fbebec",
      circleColor: "warning.main",
    },
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

  //　デモログインの手順表示
  const demologins = [
    {
      number: "1",
      role: "教師",
      mail: "aoki@example.com",
      back_color: "#d6e4f0",
      color: "primary.main",
      hoverColor: "primary.dark",
      title: "面談できない日時を登録",
      button_content: "教師デモを開始",
      description: "出張・不在の日を設定します。",
    },
    {
      number: "2",
      role: "保護者",
      mail: "parent-nonsubmit@example.com",
      back_color: "#fbebec",
      color: "error.main",
      hoverColor: "error.dark",
      title: "来校できる日を提出",
      button_content: "保護者デモを開始",
      description: "都合のいい日時を選んで提出します。",
    },
    {
      number: "3",
      role: "管理者",
      mail: "admin@example.com",
      back_color: "#e8f5ee",
      color: "success.main",
      hoverColor: "success.dark",
      title: "自動割り当てを実行",
      button_content: "管理者デモを開始",
      description: "提出された希望と条件を基に、割り当てます。",
    },
  ];

  // このアプリのワークフロー
  const workflows = [
    {
      role: "教師",
      color: "primary.main",
      title: "面談できない日時を登録",
      image: "/images/workflows/teacher_availability.webp",
      description: "学校の都合で対応できない日を登録します。",
    },
    {
      role: "保護者",
      color: "error.main",
      title: "来校できる日を提出",
      image: "/images/workflows/family_availability.webp",
      description: "都合のいい日時を選んで提出します。",
    },
    {
      role: "管理者",
      color: "success.main",
      title: "自動割り当てを実行",
      image: "/images/workflows/admin_assignment.webp",
      description: "提出された希望と条件を基に、割り当てする。",
    },
    {
      role: "教師",
      title: "面談表を確認・調整",
      color: "primary.main",
      image: "/images/workflows/teacher_manual.webp",
      description: "面談表を確認し、必要に応じて調整します。",
    },
    {
      role: "保護者",
      title: "決定した日時を確認",
      color: "error.main",
      image: "/images/workflows/family_schedule.webp",
      description: "面談日時をメールやマイページから確認できます。",
    },
  ];

  const steps = [
    {
      image: "/images/tsunagu-logic/group-family.webp",
      title: "兄弟を1家庭にまとめる",
      description: "兄弟がいる児童は、保護者の来校が1回で済むようまとめます",
    },
    {
      image: "/images/tsunagu-logic/priority.webp",
      title: "調整困難な家庭を優先",
      description: "兄弟が多い・支援学級に通う家庭ほど優先度を高くします",
    },
    {
      image: "/images/tsunagu-logic/reserch.webp",
      title: "条件に合う空き枠を探す",
      description: "保護者の都合の悪い日時や教師の出張日を避けて、探します",
    },
    {
      image: "/images/tsunagu-logic/assignment.webp",
      title: "空き枠に自動で配置",
      description: "見つかった枠に、1家庭ずつ自動で入れていきます",
    },
    {
      image: "/images/tsunagu-logic/manual-assignment.webp",
      title: "入らなかった家庭を確認",
      description: "入らなかった家庭は「未割り当て」から手動で配置",
    },
  ];
  // モバイルの時（widthが600px以下の場合trueを返す）
  const isMobile = useMediaQuery("(max-width:600px)");

  const fontSizes = {
    subheading: { xs: "14px", sm: "18px", md: "24px" }, //タイトル
    caption: { xs: "14px", sm: "14px", md: "18px" }, // サブタイトル・チェック項目文など
    body: { xs: "13px", sm: "13px", md: "14px" }, // 比較表の説明文など
    lead: { xs: "15px", sm: "15px", md: "14px" }, // 「なぜ作ったのか」本文
  };

  //矢印の見た目を事前に設定
  function FlowArrow() {
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
            fontSize: 20,
            transform: { xs: "rotate(90deg)", md: "none" },
          }}
        />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="lg">
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
            p: 3,
            flexDirection: "column",
            mb: 5,
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
                  sx={{ fontSize: { xs: "26px", sm: "36px", md: "45px" } }}
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
                    lineHeight: 2.5,
                    color: "text.secondary",
                  }}
                >
                  兄弟も支援学級も保護者の都合も。
                  <br />
                  複数の条件を考慮して、面談日程を自動で調整します。
                </Typography>
              </Box>
            </Box>

            {/* 兄弟連続画像 */}
            <Box
              sx={{
                flex: 1,
              }}
            >
              <Image
                src="/images/LP-top.webp"
                alt="兄弟がいる家庭をまとめるイメージ"
                width={1200}
                height={1200}
              />
            </Box>
          </Box>

          {/*デモ導線 */}
          <Paper elevation={4} sx={{ mt: 3, p: 3 }}>
            <Box component="section">
              <Typography variant="h5" sx={{ mb: 2 }}>
                まずはデモを体験してみる
              </Typography>
              <Typography sx={{ mb: 3 }}>
                <Box
                  component="span"
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  ①から順に体験
                </Box>
                すると、面談日が決まるまでの流れを実際に試せます
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 1,
                }}
              >
                {demologins.map((demologin, index) => {
                  const isLast = index === demologins.length - 1;

                  return (
                    <Fragment key={demologin.number}>
                      {/* カード */}
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          backgroundColor: demologin.back_color,
                          borderRadius: 5,
                          p: 2,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              backgroundColor: demologin.color,
                              color: "common.white",
                              borderRadius: "50%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {demologin.number}
                          </Box>
                          <Chip
                            sx={{
                              minWidth: 110,
                              backgroundColor: demologin.color,
                              color: "common.white",
                            }}
                            label={demologin.role}
                          />
                        </Box>
                        <Typography variant="h6">{demologin.title}</Typography>
                        <Typography variant="body2" sx={{ flexGrow: 1, mb: 2 }}>
                          {demologin.description}
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() =>
                            handleSubmit(demologin.mail, "password")
                          }
                          sx={{
                            height: 50,
                            fontSize: fontSizes.caption,
                            backgroundColor: demologin.color,
                            "&:hover": {
                              backgroundColor: demologin.hoverColor,
                            },
                          }}
                        >
                          {demologin.button_content}
                        </Button>
                      </Box>

                      {/* 矢印（最後のカードの後ろには出さない） */}
                      {!isLast && <FlowArrow />}
                    </Fragment>
                  );
                })}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  onClick={() =>
                    workflowRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  sx={{
                    textDecoration: "underline",
                    "&:hover": {
                      textDecoration: "underline", // ホバーで消えないようにする
                      backgroundColor: "transparent",
                    },
                    fontSize: 15,
                  }}
                >
                  Tsunaguの詳しい流れを見る <ArrowDownwardIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Tsunaguで面談日程が決まるまで */}

        <Box sx={{ p: 3, mb: 5 }} ref={workflowRef}>
          <Box
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              backgroundColor: "#d6e4f0",
              borderRadius: 5,
              height: "auto",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="h4" sx={{ px: 3 }}>
                Tsunaguで面談日程が決まるまで
              </Typography>
              <Typography variant="body2" sx={{ px: 3 }}>
                教師・保護者が情報を入力し、管理者が自動割り当て
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "row" },
                justifyContent: "center",
                gap: 1,
              }}
            >
              {workflows.map((workflow, index) => {
                const isLast = index === workflows.length - 1;
                return (
                  <Fragment key={index}>
                    <Paper
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 350,
                        flex: 1,
                        minWidth: 0,
                        p: 3,
                        gap: 1,
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        sx={{
                          minWidth: 110,
                          backgroundColor: workflow.color,
                          color: "common.white",
                        }}
                        label={workflow.role}
                      />

                      <Typography variant="h6">{workflow.title}</Typography>
                      <Image
                        src={workflow.image}
                        alt={workflow.title}
                        width={180}
                        height={180}
                        style={{ width: "100%", height: "auto", maxWidth: 180 }}
                      />
                      <Typography>{workflow.description}</Typography>
                    </Paper>
                    {/* 矢印 */}
                    {!isLast && <FlowArrow />}
                  </Fragment>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* 学校現場では、こんな調節が必要です */}
        <Paper sx={{ p: 3, mb: 5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              height: "auto",
              p: 3,
              borderRadius: 5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                px: 3,
              }}
            >
              <Typography variant="h4">
                学校現場では、こんな調整が必要です
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                p: 3,
                alignItems: "center",
              }}
            >
              {teacherProblems.map((problem, index) => {
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minHeight: 200,
                      flex: 1,
                      borderRadius: 5,
                      p: 2,
                      gap: 2,
                      backgroundColor: "#d6e4f0",
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
                      style={{
                        borderRadius: 10,
                        width: "80%",
                        height: "auto",
                        aspectRatio: "16 / 9", //幅に対する高さの比率を、どの画像でも 16:9 に固定
                      }}
                    />
                    <Typography sx={{ textAlign: "center", width: 200 }}>
                      {problem.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>

        {/* tsunaguの割り当てロジックフロー */}
        <Box sx={{ p: 3, mb: 5 }}>
          <Box
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              backgroundColor: "#d6e4f0",
              borderRadius: 5,
              height: "auto",
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
              >
                Tsunaguが自動で解決します。
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "row" },
                justifyContent: "center",
                gap: 3,
              }}
            >
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                return (
                  // ロジックの大外
                  <Fragment key={step.title}>
                    {/* 「画像」「タイトル」「説明文」を囲んでいる */}
                    <Paper
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        textAlign: "center",
                        p: 1,
                        flex: 1,
                        minWidth: 0,
                        minHeight: 320,
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: 140,
                          flexShrink: 0,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          src={step.image}
                          alt={step.title}
                          width={150}
                          height={150}
                          style={{
                            width: "100%",
                            maxWidth: 150,
                            height: "auto",
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{ fontSize: fontSizes.caption }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {step.description}
                      </Typography>
                    </Paper>
                    {/* 矢印 */}
                    {!isLast && <FlowArrow />}
                  </Fragment>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* ３つのrole(役割)の説明 */}
        <Box sx={{ p: 3, mb: 5 }}>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ px: 3 }}>
              教師の空き状況と保護者の希望から、管理者が児童の面談日をつくります。
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "row" },
                p: 3,
                justifyContent: "center",
                gap: { xs: 1, md: 2 },
              }}
            >
              {roleDescriptions.map((role, index) => {
                return (
                  // 役割の説明が書かれている箱
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: role.color,
                      gap: 2,
                      alignItems: "center",
                      borderRadius: 5,
                      p: 2,
                    }}
                  >
                    <Typography variant="h5" sx={{ color: role.circleColor }}>
                      {role.title}
                    </Typography>
                    <Typography>{role.description}</Typography>
                    <Image
                      src={role.image}
                      alt={role.title}
                      width={300}
                      height={300}
                      style={{ borderRadius: "50%" }}
                    />

                    {/* 書く役割のできることリスト */}
                    <Box
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
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
          </Paper>
        </Box>

        {/* プレビュー */}
        <Box sx={{ p: 3, mb: 5 }}>
          <Box
            sx={{
              borderRadius: 5,
              display: "flex",
              p: 3,
              flexDirection: "column",
              backgroundColor: "#d6e4f0",
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
            >
              実際に出力されるもの
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                flexDirection: { xs: "column", sm: "column", md: "row" },
              }}
            >
              <Paper
                sx={{
                  flex: 1,
                  minHeight: 550,
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <PictureAsPdfIcon sx={{ color: "red" }} />
                  <Typography
                    variant="h5"
                    sx={{ fontSize: fontSizes.subheading }}
                  >
                    面談表PDF
                  </Typography>
                </Box>
                <Paper
                  elevation={4}
                  sx={{ position: "relative", width: "100%", flex: 1, mt: 1 }}
                >
                  <Image
                    src="/images/meeting-slots.png"
                    alt="面談表"
                    fill
                    style={{ objectFit: "contain", borderRadius: 8 }}
                  />
                </Paper>
              </Paper>

              <Paper
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <MailIcon sx={{ color: "blue" }} />
                  <Typography
                    variant="h5"
                    sx={{ fontSize: fontSizes.subheading }}
                  >
                    保護者への通知メール
                  </Typography>
                </Box>
                <Paper
                  elevation={4}
                  sx={{ position: "relative", width: "100%", flex: 1, mt: 1 }}
                >
                  <Image
                    src="/images/gmail-response.png"
                    alt="通知メール"
                    fill
                    style={{ objectFit: "contain", borderRadius: 8 }}
                  />
                </Paper>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* なぜTsunaguを作ったのか */}
        <Paper sx={{ p: 3, mb: 5 }}>
          <Box
            component="section"
            sx={{
              p: 4,

              display: "flex",
              borderRadius: 5,
            }}
          >
            <Box sx={{ flex: 2 }}>
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
                  lineHeight: 2,
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
                調整に追われる時間を減らし、本来の子どもと向き合う時間を確保するために、Tsunaguを開発しました。
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Image
                src="/images/teacher-picture.webp"
                alt="調整に追われる時間から、子どもと向き合う時間へ"
                width={600}
                height={500}
              />
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
