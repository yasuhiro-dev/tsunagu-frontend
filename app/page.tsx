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
    "面談の自動割り当て・手動調整",
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
      description: "兄弟がいる児童を、1つのグループにまとめます",
    },
    {
      icon: <FavoriteIcon />,
      title: "優先順位を決定",
      description:
        "兄弟・特別支援・時間を考慮し、対応が難しい家庭ほど優先度を高くします",
    },
    {
      icon: <ScheduleIcon />,
      title: "候補時間を段階的に絞り込み",
      description: "兄弟・特別支援・時間の条件を順に確認します",
    },
    {
      icon: <GroupIcon />,
      title: "優先度順に自動配置",
      description: "絞り込んだ候補の中から、優先度の高い家庭から順に配置します",
    },
    {
      icon: <EditIcon />,
      title: "配置できなかった家庭を確認",
      description:
        "候補が見つからなかった家庭は、教師が確認・調整して確定します",
    },
  ];

  return (
    <>
      {/* ヒーロー */}
      <Box sx={{ display: "flex", p: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h3">
              学校とご家庭をつなぐ
              <br />
              面談日程調整サービス
              <br />
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 2 }}>
            <Typography>兄弟の面談時間を連続配置</Typography>
            <Typography>特別支援学級も連続配置</Typography>
            <Typography>時間の制約も自動で埋める</Typography>
            <Typography>独自のスケジューリングアルゴリズム</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleSubmit("aoki@example.com", "password")}
            >
              教師としてのデモを見る
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit("parent@example.com", "password")}
            >
              保護者としてのデモを見る
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit("admin@example.com", "password")}
            >
              管理者としてのデモを見る
            </Button>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Image
            src="/images/tsunagu.png"
            alt="面談表"
            width={600}
            height={200}
          />
        </Box>
      </Box>
      {/* before-after */}
      <Box component="section" sx={{ p: 4 }}>
        <Typography variant="h4">
          なぜ一般的な予約システムではダメなのか
        </Typography>
        <Box
          sx={{
            display: "flex",
            p: 2,
            minHeight: 200,
            justifyContent: "center",
          }}
        >
          <Box
            sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}
          >
            <Typography variant="h5">一般的な予約システム</Typography>
            {generalProblems.map((problem) => (
              <Box
                key={problem.title}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CloseIcon sx={{ color: "grey" }} />
                {problem.icon}
                <Box>
                  <Typography variant="subtitle1">{problem.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {problem.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box
            sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}
          >
            <Typography variant="h5">Tsunaguなら</Typography>
            {tsunaguApp.map((tsunagu) => (
              <Box
                key={tsunagu.title}
                sx={{ display: "flex", alignItem: "center", gap: 1 }}
              >
                <CheckCircleIcon sx={{ color: "blue" }} />
                {tsunagu.icon}
                <Box>
                  <Typography variant="subtitle1">{tsunagu.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
        <Typography variant="h4">
          立場に応じて実際の操作を体験できます
        </Typography>
        {/* 一番外の枠 */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            minHeight: 200,
            mt: 2,
          }}
        >
          {/* 教師側の枠 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              p: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Image
                src="/images/teacher.png"
                alt="teacher-icon"
                width={300}
                height={100}
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
              <Typography variant="h5">教師として体験する</Typography>
              {teacherExperience.map((teacherExperience) => (
                <Typography key={teacherExperience}>
                  <CheckIcon sx={{ color: "blue", fontSize: "small" }} />
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
            <Box sx={{ display: "flex", p: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Image
                  src="/images/parent.png"
                  alt="parent-icon"
                  width={300}
                  height={100}
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
                <Typography variant="h5">保護者として体験する</Typography>
                {parentExperience.map((parentExperience) => (
                  <Typography key={parentExperience}>
                    <CheckIcon sx={{ color: "blue", fontSize: "small" }} />
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

      <Box sx={{ textAlign: "center", mt: 4, p: 4 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
          学校全体の管理を行う、管理者向けの機能もあります
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
          <Typography variant="h4">Tsunagu割り当てロジック</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              // ロジックの大外
              <Box
                key={step.title}
                sx={{ display: "flex", alignItems: "center", mt: 2 }}
              >
                {/* 「アイコンの円」「タイトル」「説明文」を囲んでいる */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
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
                {!isLast && <span>→</span>}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* プレビュー */}
      <Box sx={{ display: "flex", p: 4, flexDirection: "column" }}>
        <Typography variant="h4">出力プレビュー</Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box sx={{ flex: 1, border: "1px dashed grey", minHeight: 150 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PictureAsPdfIcon sx={{ color: "red" }} />
              <Typography variant="h5">面談表PDF</Typography>
            </Box>
            <Image
              src="/images/tsunagu.png"
              alt="面談表"
              width={600}
              height={200}
            />
          </Box>
          <Box sx={{ flex: 1, border: "1px dashed grey", minHeight: 150 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MailIcon sx={{ color: "blue" }} />
              <Typography variant="h5">保護者への通知メール</Typography>
            </Box>
            <Image
              src="/images/tsunagu.png"
              alt="面談表"
              width={600}
              height={200}
            />
          </Box>
        </Box>
      </Box>

      {/* なぜTsunaguを作ったのか */}
      <Box component="section" sx={{ gap: 2, p: 4, display: "flex" }}>
        <Box sx={{ flex: 1 }}>
          <Image
            src="/images/make_reason.png"
            alt="学校"
            width={200}
            height={200}
          />
        </Box>
        <Box sx={{ flex: 2, minHeight: 250 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            なぜTsunaguを作ったのか
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              sx={{ maxWidth: 700, lineHeight: 1.8, color: "text.secondary" }}
            >
              教員として働く中で、保護者面談の日程調整に多くの時間を取られる場面を見てきました。紙での希望収集は紛失や連絡漏れが起きやすく、兄弟の連続配置や特別支援学級への配慮も、手作業では確認漏れが起きがちでした。Googleフォームや一般的な予約システムも試みましたが、学校特有の条件までは対応できません。
            </Typography>
            <Typography
              sx={{ maxWidth: 700, lineHeight: 1.8, color: "text.secondary" }}
            >
              そこで、学校現場の運用に合わせた面談日程調整システム「Tsunagu」を開発しました。調整業務を減らし、先生方が子どもと向き合う時間を増やすことを目指しています。
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
