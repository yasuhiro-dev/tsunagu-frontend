"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Container,
  Link,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Mail as MailIcon,
  PlayCircle as PlayCircleIcon,
} from "@mui/icons-material";

import AlertSnackbar from "@/app/components/AlertSnackbar";
import FlowArrowConnector from "@/app/components/lp/FlowArrowConnector";
import {
  demoLogin,
  resetDemo,
  RedirectMap,
  DEMO_ACCOUNTS,
  prepareGuestDemo,
} from "@/utils/demoLogin";

// セクションの枠の共通設定（全セクションで余白と角の丸みを揃える）
// state を使わない固定値なので、コンポーネントの外に置く
const sectionSx = {
  px: { xs: 1, md: 2 },
  py: { xs: 1, md: 2 },
  borderRadius: 5,
  display: "flex",
  flexDirection: "column",
  gap: 3,
} as const;

export default function LandingPage() {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  const handleSubmit = async (
    loginEmail: string, // 1つ目に渡された値を、この名前で使う（文字列）
    loginPassword: string, // ２つ目に渡された値を、この名前で使う（文字列）
    redirectOverride: string | undefined, // 3つ目に渡された値は渡さなくてもいい
    reset: boolean, // 4つ目がtrueのときは、デモ環境を初期状態に戻してから遷移する
    mode: "guided" | "free", //5つ目がguideかfreeで案内を出すかを判定
    roleLoading: string,
  ) => {
    try {
      setIsLoading(roleLoading);
      const role = await demoLogin(loginEmail, loginPassword); //demoLoginに引数を渡し、roleが返ってくる
      //apiが失敗しなければ実行
      if (mode === "free" && role === "teacher") {
        await prepareGuestDemo();
      } else if (reset) {
        await resetDemo();
      } //前の人の操作が残らないよう、STEP 1から始めるときに戻す
      const redirectMap: RedirectMap = {
        //roleによって遷移先を指定する
        teacher: "/teacher_unavailabilities",
        parent: "/family_unavailabilities",
        admin: "/admin",
      };
      sessionStorage.setItem("demoMode", mode);
      // redirectOverride（my_scheduleへの遷移）がなければroleを見て指定されたURLへ遷移
      setRedirectTo(redirectOverride ?? redirectMap[role] ?? "/");
    } catch {
      //api失敗したら表示する
      setIsLoading(null);
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

  //ゲストログインボタン（役割ごと）
  const guestLoginButtons = [
    {
      roleKey: "teacher" as const,
      role: "担任の先生",
      color: "primary.main",
      bgColor: "#e1edf8ff",
      circleColor: "primary.main",
      path: "/meeting_slots",
      button_label: "担任の先生でログイン",
      reset: true,
      image: "/images/teacher.webp",
      items: [
        "未定の児童を手動で配置",
        "面談枠の移動・入れ替え",
        "面談できない日時の登録",
        "面談表のPDF出力",
      ],
    },
    {
      roleKey: "parent" as const,
      role: "保護者",
      color: "#d18a94",
      bgColor: "#fbebec",
      circleColor: "#d18a94",
      path: "/family_unavailabilities",
      image: "/images/parent.webp",
      button_label: "保護者でログイン",
      reset: true,
      items: [
        "来校できる日時の提出",
        "決まった面談日時の確認",
        "カレンダーへの追加",
        "スマホでも操作できる",
      ],
    },
    {
      roleKey: "admin" as const,
      role: "教頭先生",
      color: "success.main",
      bgColor: "#e8f5ee",
      circleColor: "success.main",
      image: "/images/admin.webp",
      path: "/admin?tab=1",
      button_label: "教頭先生でログイン",
      reset: true,
      items: [
        "面談表の自動作成",
        "決定状況をグラフで確認",
        "保護者へメール一括送信",
        "担任・保護者の管理",
      ],
    },
  ];

  // このアプリのワークフロー
  const workflows = [
    {
      number: "1",
      roleKey: "teacher" as const,
      role: "担任",
      color: "primary.main",
      title: "面談できない\n日時を登録",
      image: "/images/workflows/teacher_availability.webp",
      path: "/teacher_unavailabilities",
      button_label: "先生の画面を見る",
    },
    {
      number: "2",
      roleKey: "parent" as const,
      role: "保護者",
      color: "#d18a94",
      title: "来校できる\n日時を提出",
      image: "/images/workflows/family_availability.webp",
      path: "/family_unavailabilities",
      button_label: "保護者の画面を見る",
    },
    {
      number: "3",
      roleKey: "admin" as const,
      role: "教頭先生",
      color: "success.main",
      title: "面談表を\n自動作成",
      image: "/images/workflows/admin_assignment.webp",
      path: "/admin?tab=1",
      button_label: "教頭先生の画面を見る",
    },
    {
      number: "4",
      role: "担任",
      roleKey: "teacher" as const,
      title: "面談表を\n確認・調整",
      color: "primary.main",
      image: "/images/workflows/teacher_manual.webp",
      description: "面談表を確認し、必要なら調整します。",
      path: "/meeting_slots",
      button_label: "先生の画面を見る",
    },
    {
      number: "5",
      roleKey: "admin" as const,
      role: "教頭先生",
      color: "success.main",
      title: "保護者へ\nメールを送信",
      image: "/images/workflows/admin_mailer.webp",
      description: "決まった面談日時をメールで知らせます。",
      path: "/admin?tab=2",
      button_label: "教頭先生の画面を見る",
    },
    {
      number: "6",
      roleKey: "parent" as const,
      role: "保護者",
      title: "決定した\n日時を確認",
      color: "#d18a94",
      image: "/images/workflows/family_schedule.webp",
      description: "決まった面談日時をマイページで確認します。",
      path: "/my_schedule",
      button_label: "保護者の画面を見る",
    },
  ];

  // 学校の悩みの説明
  const teacherProblems = [
    {
      title: "兄弟の調整",
      image: "/images/problems/siblings.webp",
      description: "兄弟が別々な日になると\n何度も来校する必要がある",
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
      description: "仕事や家庭の都合で\n来られない時間がある",
      color: "#fbebec",
    },
    {
      title: "担任の先生の都合",
      image: "/images/problems/teacher.webp",
      description: "出張が入っている日には\n実施できない",
      color: "#d6e4f0",
    },
  ];

  const steps = [
    {
      image: "/images/tsunagu-logic/group-family.webp",
      title: "兄弟を1家庭に\nまとめる",
      description: "来校1回で済むよう\n同日に続けて組みます",
    },
    {
      image: "/images/tsunagu-logic/priority.webp",
      title: "調整困難な\n家庭を優先",
      description: "兄弟が多い・支援学級の\n家庭から決めます",
    },
    {
      image: "/images/tsunagu-logic/reserch.webp",
      title: "条件に合う\n空き枠を探す",
      description: "保護者と先生の都合が\n悪い日時を避けます",
    },
    {
      image: "/images/tsunagu-logic/assignment.webp",
      title: "空き枠に\n自動で配置",
      description: "見つかった枠に\n1家庭ずつ入れます",
    },
    {
      image: "/images/tsunagu-logic/manual-assignment.webp",
      title: "入らなかった\n家庭を確認",
      description: "面談表から\n先生が手で配置します",
    },
  ];

  const fontSizes = {
    title: { xs: "24px", sm: "24px", md: "30px" }, //大きいタイトル　h4
    subheading: { xs: "14px", sm: "18px", md: "20px" }, //ミニタイトル　h6
    caption: { xs: "20px", sm: "20px", md: "24px" }, // サブタイトル・h5
    body: { xs: "11px", sm: "11px", md: "14px" }, // body2
    lead: { xs: "15px", sm: "15px", md: "16px" }, // 指定なし 16px
  };

  const numberCircleSx = {
    width: { xs: 30, md: 30 },
    height: { xs: 30, md: 30 },
    color: "common.white",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    fontWeight: "bold",
  };
  const demoStarttButton = (
    <Button
      size="large"
      variant="contained"
      disabled={isLoading !== null}
      startIcon={
        isLoading === "demo-start" ? (
          <CircularProgress size={20} />
        ) : (
          <PlayCircleIcon />
        )
      }
      sx={{
        bgcolor: "primary.dark",
        "&:hover": { bgcolor: "#1e3f5c" },
        px: { xs: 8, md: 10 },
        py: 2,
        fontSize: { xs: 10, md: 18 },
        fontWeight: "bold",
        minWidth: { xs: 280, md: 400 },
      }}
      onClick={() => {
        handleSubmit(
          "aoki@example.com",
          "password",
          "/teacher_unavailabilities",
          true,
          "guided",
          "demo-start",
        );
      }}
    >
      {isLoading === "demo-start"
        ? "準備しています…"
        : "デモを体験する（約5分）"}
    </Button>
  );

  return (
    <>
      <Container maxWidth="lg">
        <AlertSnackbar
          open={alertOpen}
          severity={alertSeverity}
          message={alertMessage}
          onClose={() => setAlertOpen(false)}
        />
        {/* ヒーロー（枠がないので sectionSx は使わない） */}
        <Box
          sx={{
            px: 3, // 下のセクションの枠の左端（24px）と揃える
            display: "flex",
            minWidth: 0,
            alignItems: { xs: "stretch", md: "center" },
            gap: 6,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* ヒーロー見出し */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: fontSizes.subheading,
              }}
            >
              先生のための面談日程調整サービス
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: "26px", sm: "36px", md: "40px" },
                  fontWeight: 700,
                }}
              >
                保護者面談の日程調整を
                <br />
                先生の代わりに自動で
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.5,
                  fontSize: { xs: "11px", sm: "11px", md: "18px" },
                }}
              >
                保護者の希望を集めて、面談表を自動で作成
                <br />
                兄弟や支援学級の児童がいる家庭も、同じ日にまとめます
              </Typography>
            </Box>
          </Box>

          {/* 兄弟連続画像 */}
          <Box sx={{ flex: 1.2 }}>
            <Image
              src="/images/LP-top.webp"
              alt="兄弟がいる家庭をまとめるイメージ"
              width={1400}
              height={600}
              priority
              style={{ width: "100%", height: 220 }}
            />
          </Box>
        </Box>

        {/* ガイド付きデモ */}
        <Box sx={{ p: 3, mb: 2 }}>
          <Box
            sx={{
              ...sectionSx,
              backgroundColor: "#d6e4f0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontSize: fontSizes.title, fontWeight: "bold" }}
              >
                ガイド付きデモで全体の流れを体験
              </Typography>
              <Typography>
                6ステップに沿って、Tsunaguの使い方を約5分で体験できます。
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {/* Tsunaguで面談日程が決まるまで */}

              <Box
                sx={{
                  gap: 2,
                  display: "flex",
                }}
              >
                {workflows.map((workflow, index) => {
                  const isRowEnd = index === 5;
                  return (
                    <Box
                      key={workflow.number}
                      sx={{
                        position: "relative",
                        display: "flex",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Paper
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          maxWidth: 160,
                          maxHeight: 220,
                          p: 2,
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              ...numberCircleSx,
                              backgroundColor: workflow.color,
                            }}
                          >
                            {workflow.number}
                          </Box>
                          <Chip
                            sx={{
                              minWidth: { xs: 50, md: 80 },
                              backgroundColor: workflow.color,
                              color: "common.white",
                              fontWeight: "bold",
                            }}
                            label={workflow.role}
                          />
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: "bold",
                            fontSize: 17,
                            whiteSpace: "pre-line",
                            textAlign: "center",
                          }}
                        >
                          {workflow.title}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            height: 120,
                            width: "100%",
                            position: "relative",
                          }}
                        >
                          <Image
                            src={workflow.image}
                            alt={workflow.title}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </Box>
                      </Paper>

                      {!isRowEnd && <FlowArrowConnector />}
                    </Box>
                  );
                })}
              </Box>

              {/* デモスタートボタン */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  p: 2,
                  position: "relative",
                  mt: 2,
                }}
              >
                {demoStarttButton}
                <Box
                  sx={{
                    position: "absolute",
                    justifyContent: "center", // ボタンの左外側に出す
                    top: -10,
                    display: { xs: "none", md: "flex" }, // スマホでは非表示
                    bgcolor: "#FFE38A",
                    color: "primary.main",
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    boxShadow: 1,
                  }}
                >
                  はじめての方はこちら
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ゲストログイン */}
        <Box id="guest-login" sx={{ p: 3, mb: 2, scrollMarginTop: "80px" }}>
          <Paper sx={sectionSx}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Chip
                label="ゲストログイン"
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  mb: 1.5,
                  bgcolor: "common.white",
                  color: "text.secondary",
                }}
              />
              <Typography
                variant="h4"
                sx={{ fontSize: fontSizes.title, fontWeight: "bold" }}
              >
                立場を選んで、自由に操作する
              </Typography>
              <Typography>
                会員登録・パスワード不要。立場を選んでワンクリックでログインできます
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* ゲストログインボタン */}
              {guestLoginButtons.map((guest, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: guest.bgColor,
                    flex: 1,
                    minWidth: 0,
                    borderRadius: 5,
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex" }}>
                    <Box
                      sx={{
                        flex: 0.5,
                        flexShrink: 0,
                        alignSelf: "center",
                      }}
                    >
                      <Image
                        src={guest.image}
                        alt={guest.role}
                        width={110}
                        height={150}
                      />
                    </Box>

                    <Box component="ul" sx={{ pl: 2, my: 1, flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: fontSizes.subheading,
                          textAlign: "left",
                        }}
                      >
                        {guest.role}
                      </Typography>
                      {/* map = ではなく map( で呼び出す */}
                      {guest.items.map((item) => (
                        // 1項目ごとに li を作る（「・」は書かない）
                        <Typography
                          key={item}
                          variant="body1"
                          sx={{ color: "text.secondary", textAlign: "left" }}
                        >
                          <CheckCircleIcon
                            sx={{ color: guest.circleColor, fontSize: 15 }}
                          />
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="outlined"
                      disabled={isLoading !== null}
                      sx={{
                        color: guest.color,
                        borderColor: guest.color,
                        fontWeight: "bold",
                        gap: 1,
                        p: 1,
                      }}
                      onClick={() =>
                        handleSubmit(
                          DEMO_ACCOUNTS[guest.roleKey].email,
                          DEMO_ACCOUNTS[guest.roleKey].password,
                          guest.path,
                          guest.reset,
                          "free",
                          guest.roleKey,
                        )
                      }
                    >
                      {isLoading === guest.roleKey ? (
                        <>
                          <CircularProgress size={20} /> 準備しています…
                        </>
                      ) : (
                        guest.button_label
                      )}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* 学校現場では、こんな調整が必要です */}
        <Box sx={{ p: 3, mb: 2 }}>
          <Paper elevation={4} sx={sectionSx}>
            <Typography
              variant="h4"
              sx={{ fontSize: fontSizes.title, fontWeight: "bold" }}
            >
              学校現場では、こんな調整が必要です
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
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
                        aspectRatio: "16 / 10", //幅に対する高さの比率を、どの画像でも 16:9 に固定
                      }}
                    />
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: 200,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {problem.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>

        {/* tsunaguの割り当てロジックフロー */}
        <Box sx={{ p: 3, mb: 2 }}>
          <Box sx={{ ...sectionSx, backgroundColor: "#d6e4f0" }}>
            <Typography
              variant="h4"
              sx={{ fontSize: fontSizes.title, fontWeight: "bold" }}
            >
              Tsunaguが自動で解決します。
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
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
                        position: "relative",
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
                        sx={{
                          fontSize: fontSizes.subheading,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: fontSizes.body,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {step.description}
                      </Typography>
                      {/* 矢印 */}
                      {!isLast && <FlowArrowConnector offset={32} />}
                    </Paper>
                  </Fragment>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* プレビュー */}
        <Box sx={{ p: 3, mb: 2 }}>
          <Paper
            elevation={4}
            id="output"
            sx={{ ...sectionSx, scrollMarginTop: "80px" }}
          >
            {/* 見出しと注記はひとまとめにして、間隔を狭くする */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "20px", sm: "26px", md: "34px" },
                  fontWeight: "bold",
                }}
              >
                実際に出力されるもの
              </Typography>
              <Typography>※表示内容は例です</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Paper
                sx={{
                  flex: 1.8,
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
                  sx={{
                    position: "relative",
                    width: "100%",
                    flex: 1,
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/images/pdf-export.webp"
                    alt="面談表"
                    width={2200}
                    height={1636}
                    style={{
                      objectFit: "contain",
                      borderRadius: 8,
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </Paper>
              </Paper>

              <Paper
                sx={{
                  flex: 1.2,
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 2,
                  }}
                >
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
                  sx={{
                    position: "relative",
                    width: "100%",
                    flex: 1,
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/images/gmail-response.webp"
                    alt="通知メール"
                    width={1200}
                    height={900}
                    style={{
                      objectFit: "contain",
                      borderRadius: 8,
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </Paper>
              </Paper>
            </Box>
          </Paper>
        </Box>

        {/* なぜTsunaguを作ったのか */}
        <Box sx={{ p: 3, mb: 2 }}>
          <Box
            sx={{
              ...sectionSx,
              backgroundColor: "#d6e4f0",
              scrollMarginTop: "80px",
            }}
          >
            <Box
              component="section"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box sx={{ flex: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 2,
                    fontSize: fontSizes.title,
                    fontWeight: "bold",
                  }}
                >
                  なぜTsunaguを作ったのか
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 700,
                    lineHeight: 2,
                    color: "text.secondary",
                    mb: 2,
                    fontSize: fontSizes.lead,
                  }}
                >
                  教員として働く中で、保護者面談の日程調整に多くの時間を取られる場面を見てきました。
                  Googleフォームなどを使う学校もありますが、兄弟の連続配置や特別支援学級への配慮といった
                  学校特有の条件までは対応しきれていないのが実情です。
                  <br />
                  <br />
                  調整に追われる時間を減らし、本来の子どもと向き合う時間を確保するために
                  <br />
                  Tsunaguを開発しました。
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
          </Box>
        </Box>
        <Box sx={{ p: 3, mb: 2 }}>
          <Paper
            elevation={4}
            sx={{
              ...sectionSx,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontSize: fontSizes.title, fontWeight: "bold" }}
                >
                  実際に操作して、確かめてください
                </Typography>
                <Typography>
                  ガイドに沿って、３つの立場の操作を順番に体験できます
                </Typography>
              </Box>

              {demoStarttButton}
              <Typography>
                立場を選んで、自由に操作したい方は{" "}
                <Link sx={{ fontWeight: "bold" }} href="#guest-login">
                  ゲストログインへ
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
}
