"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import PeopleIcon from "@mui/icons-material/People";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ScheduleIcon from "@mui/icons-material/Schedule";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MailIcon from "@mui/icons-material/Mail";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import GroupsIcon from "@mui/icons-material/Groups";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BalanceIcon from "@mui/icons-material/Balance";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import useMediaQuery from "@mui/material/useMediaQuery";

type RedirectMap = {
  teacher: string;
  parent: string;
  admin: string;
};

export default function Home() {
  const handleSubmit = async (loginEmail: string, loginPassword: string) => {
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
      window.location.href = redirectMap[data.role] ?? "/";
    } else {
      alert("デモログインに失敗しました");
    }
  };

  const generalProblems = [
    {
      icon: <CallSplitIcon />,
      title: "兄弟の面談がバラバラの日に",
      description: "個別予約で時間が揃わない",
    },
    {
      icon: <PersonOffIcon />,
      title: "先生の都合しか見えない",
      description: "保護者側の都合は考慮外",
    },
    {
      icon: <GroupsIcon />,
      title: "複数の先生との調整が大変",
      description: "担任＋特別支援の先生で対応",
    },
    {
      icon: <DirectionsRunIcon />,
      title: "早い者勝ちで不公平に",
      description: "予約が早い家庭だけ有利",
    },
  ];
  const tsunaguApp = [
    {
      icon: <CallMergeIcon />,
      title: "兄弟をまとめて配置",
      description: "自動で識別し、時間を連続で配置",
    },
    {
      icon: <HandshakeIcon />,
      title: "両方の都合を見て自動調整",
      description: "保護者・先生、双方の予定を考慮",
    },
    {
      icon: <AssignmentTurnedInIcon />,
      title: " 複数の先生の面談も自動調整",
      description: "担任＋特別支援の先生、両方をまとめて割り当てを確保",
    },
    {
      icon: <BalanceIcon />,
      title: "家庭ごとに公平に配置",
      description: "漏れゼロで、全員に枠を確保",
    },
  ];
  const teacherExperience = [
    "割り当て結果の確認",
    "手動調整（兄弟・特別支援学級の面談表を参照しながら）",
    "児童一覧・未提出者の確認",
    "面談表の印刷",
  ];
  const parentExperience = [
    "面談不可日時の登録",
    "面談予定をGoogleカレンダーに追加",
    "決定した面談日時の確認",
  ];
  const steps = [
    {
      icon: <PeopleIcon />,
      title: "家庭をグループ化",
      description: "兄弟のいる児童はグループ化、いない児童は単独で処理します",
    },
    {
      icon: <FavoriteIcon />,
      title: "優先順位を決定",
      description:
        "兄弟・特別支援・時間を考慮し、対応が難しい家庭ほど優先度を高くします",
    },
    {
      icon: <ScheduleIcon />,
      title: "空き枠から条件に合う候補を探す",
      description: "時間・兄弟・特別支援の条件を順に確認します",
    },
    {
      icon: <GroupIcon />,
      title: "優先度の高い順に自動配置",
      description: "絞り込んだ候補の中から、優先度の高い家庭から順に配置します",
    },
    {
      icon: <EditIcon />,
      title: "配置できなかった家庭を確認",
      description: "条件に合う枠がなかった家庭は、教師が調整します",
    },
  ];
  // モバイルの時（widthが600px以下の場合trueを返す）
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <>
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
                fontSize: { xs: "9px", sm: "12px", md: "16px" },
              }}
            >
              学校向け 面談日程調整サービス
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h3"
                sx={{ fontSize: { xs: "28px", sm: "36px", md: "48px" } }}
              >
                兄弟の面談を、
                <br />
                自動で連続配置。
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "10px", sm: "13.5px", md: "18px" },
                  lineHeight: 1.8,
                  color: "text.secondary",
                }}
              >
                兄弟も、特別支援学級も、保護者の都合も。
                <br />
                すべて考慮した面談表が、自動で出来上がります。
              </Typography>
            </Box>
          </Box>
          {/* 兄弟連続画像 */}
          <Box
            sx={{
              flex: 1,
              m: 2,
            }}
          >
            <Image
              src="/images/meeting-slot-siblings.png"
              alt="兄弟連続割り当て"
              width={600}
              height={200}
              style={{ width: "100%", height: "auto", borderRadius: 8 }}
            />
          </Box>
        </Box>
        {/* デモボタン */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          <Button
            sx={{ minWidth: 120 }}
            variant="contained"
            onClick={() => handleSubmit("aoki@example.com", "password")}
          >
            教師デモ
          </Button>
          <Button
            sx={{ minWidth: 120 }}
            variant="contained"
            onClick={() => handleSubmit("parent@example.com", "password")}
          >
            保護者(提出済み)デモ
          </Button>
          <Button
            sx={{ minWidth: 120 }}
            variant="contained"
            onClick={() =>
              handleSubmit("parent-nonsubmit@example.com", "password")
            }
          >
            保護者(提出前)デモ
          </Button>
          <Button
            sx={{ minWidth: 120 }}
            variant="contained"
            onClick={() => handleSubmit("admin@example.com", "password")}
          >
            管理者デモ
          </Button>
        </Box>
      </Box>
      {/* before-after */}
      <Box component="section" sx={{ p: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
        >
          なぜ一般的な予約システムではダメなのか
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 6,
            maxWidth: 1000,
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          {/* 左：一般的な予約システム */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 1, fontSize: { xs: "13.5px", sm: "18px", md: "24px" } }}
            >
              一般的な予約システム
            </Typography>
            {generalProblems.map((problem) => (
              <Box
                key={problem.title}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <CloseIcon sx={{ color: "grey.500" }} />

                <Box sx={{ color: "grey.600", display: "flex" }}>
                  {problem.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontSize: { xs: "9px", sm: "12px", md: "16px" } }}
                  >
                    {problem.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "8px", sm: "11px", md: "14px" },
                    }}
                  >
                    {problem.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 1, fontSize: { xs: "13.5px", sm: "18px", md: "24px" } }}
            >
              Tsunaguなら
            </Typography>
            {tsunaguApp.map((tsunagu) => (
              <Box
                key={tsunagu.title}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <CheckCircleIcon sx={{ color: "primary.main" }} />
                <Box sx={{ color: "primary.main", display: "flex" }}>
                  {tsunagu.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontSize: { xs: "9px", sm: "12px", md: "16px" } }}
                  >
                    {tsunagu.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "8px", sm: "11px", md: "14px" },
                    }}
                  >
                    {tsunagu.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/*デモ導線 */}

      <Box component="section" sx={{ p: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
        >
          立場に応じて実際の操作を体験できます
        </Typography>
        {/* 一番外の枠 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
            gap: 6,
            minHeight: 200,
            mt: 2,
          }}
        >
          {/* 教師側の枠 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: { xs: "column", sm: "column", md: "row" },
              p: 2,
            }}
          >
            <Box sx={{ flex: 2, mr: 3 }}>
              <video
                src="/videos/meeting-slot-demo1.mp4"
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: "100%",
                  borderRadius: 8,
                  height: 350,
                }}
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontSize: { xs: "13.5px", sm: "18px", md: "24px" } }}
              >
                教師として体験
              </Typography>
              {teacherExperience.map((teacherExperience) => (
                <Typography
                  key={teacherExperience}
                  sx={{ fontSize: { xs: "9px", sm: "12px", md: "16px" } }}
                >
                  <CheckIcon
                    sx={{
                      color: "blue",
                      fontSize: { xs: "9px", sm: "12px", md: "16px" },
                    }}
                  />
                  {teacherExperience}
                </Typography>
              ))}

              {/* ボタンの処理 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  flex: 1,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => handleSubmit("aoki@example.com", "password")}
                >
                  教師として体験する
                </Button>
              </Box>
            </Box>
          </Box>
          {/* 保護者側の枠 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                p: 2,
                flexDirection: { xs: "column", sm: "column", md: "row" },
              }}
            >
              <Box sx={{ flex: 2, mr: 3 }}>
                <video
                  src="/videos/unavailability-demo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    height: 350,
                  }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontSize: { xs: "13.5px", sm: "18px", md: "24px" } }}
                >
                  保護者として体験
                </Typography>
                {parentExperience.map((parentExperience) => (
                  <Typography
                    key={parentExperience}
                    sx={{ fontSize: { xs: "9px", sm: "12px", md: "16px" } }}
                  >
                    <CheckIcon
                      sx={{
                        fontSize: { xs: "9px", sm: "12px", md: "16px" },
                        color: "blue",
                      }}
                    />
                    {parentExperience}
                  </Typography>
                ))}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    flex: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleSubmit("parent@example.com", "password")
                    }
                  >
                    保護者として体験する
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* ボタンの処理 */}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          textAlign: "center",
          p: 3,
          bgcolor: "grey.50",
          borderRadius: 2,
          maxWidth: 700,
          mx: "auto",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 3, fontSize: { xs: "13.5px", sm: "18px", md: "24px" } }}
        >
          管理者として体験
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: "8px", sm: "10.5px", md: "14px" },
            color: "text.secondary",
            mb: 2,
          }}
        >
          教師・保護者情報の登録・編集 ／ 面談の一括自動割り当て ／
          提出締切日の設定 ／ 割り当て率の参照
        </Typography>
        <Button
          onClick={() => handleSubmit("admin@example.com", "password")}
          variant="outlined"
          size="small"
        >
          管理者として体験する
        </Button>
      </Box>

      {/* 割り当てロジック */}
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: "20px", sm: "26px", md: "34px" } }}
          >
            Tsunagu割り当てロジック
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
                  alignItems: "center",
                  mt: 2,
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
                    width: 250,
                  }}
                >
                  {/* アイコン１つだけを囲んでいる */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "1px dashed grey",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {step.icon}
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
          <Box sx={{ flex: 1, minHeight: 150 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PictureAsPdfIcon sx={{ color: "red" }} />
              <Typography
                variant="h5"
                sx={{ fontSize: { xs: "13.5px", sm: "18px", md: "24px" } }}
              >
                面談表PDF
              </Typography>
            </Box>
            <Image
              src="/images/meeting-slots.png"
              alt="面談表"
              width={600}
              height={200}
              style={{ width: "100%", height: "auto", borderRadius: 8 }}
            />
          </Box>
          <Box sx={{ flex: 1, minHeight: 150 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MailIcon sx={{ color: "blue" }} />
              <Typography
                variant="h5"
                sx={{ fontSize: { xs: "13.5px", sm: "18px", md: "24px" } }}
              >
                保護者への通知メール
              </Typography>
            </Box>
            <Image
              src="/images/gmail-response.png"
              alt="面談表"
              width={600}
              height={200}
              style={{ width: "100%", height: "auto", borderRadius: 8 }}
            />
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
            fontSize: { xs: "8px", sm: "11px", md: "14px" },
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
          src="/images/teacher-picture.jpg"
          alt="調整に追われる時間から、子どもと向き合う時間へ"
          width={1200}
          height={800}
          style={{ width: "100%", height: "auto", borderRadius: 8 }}
        />
      </Box>
    </>
  );
}
