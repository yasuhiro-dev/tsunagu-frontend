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
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolIcon from "@mui/icons-material/School";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import SettingsIcon from "@mui/icons-material/Settings";

export default function Home() {
  const generalProblems = [
    {
      icon: <PeopleAltIcon />,
      title: "",
      description: "兄弟が別日にならないよう目視で確認が必要",
    },
    {
      icon: <FamilyRestroomIcon />,
      title: "兄弟が別日になる",
      description: "特別支援学級の枠を手動で調整",
    },
    {
      icon: <SchoolIcon />,
      title: "特別支援学級の制約を考慮できない",
      description: "別枠対応ができず調整が複雑に",
    },
    {
      icon: <EventBusyIcon />,
      stitle: "早い者勝ち",
      description: "配置漏れやダブルブッキングが発生",
    },
  ];
  const tsunaguApp = [
    {
      icon: <SettingsIcon />,
      title: "教師が条件を設定して自動割り当て",
      description: "学校のルールに合わせて最適に配置",
    },
    {
      icon: <FamilyRestroomIcon />,
      title: "兄弟連続配置",
      description: "兄弟関係を自動で識別・連続配置",
    },
    {
      icon: <FavoriteIcon />,
      title: " 特別支援学級の配置を考慮",
      description: "別枠で優先的に面談枠を確保",
    },
    {
      icon: <CheckCircleIcon />,
      title: "全家庭必ず配置",
      description: "配置漏れチェックで、配置漏れゼロ",
    },
  ];
  const teacherExperience = [
    "自動割り当ての実行",
    "面談表の確認",
    "児童のステータスの閲覧",
    "PDF出力・メール送信",
  ];
  const parentExperience = [
    "日程不可のの希望提出",
    "兄弟情報の登録",
    "決定通知の確認",
  ];
  const steps = [
    {
      icon: <PeopleIcon />,
      title: "兄弟家庭を優先",
      description: "兄弟は連続する時間枠に優先的に配置します",
    },
    {
      icon: <FavoriteIcon />,
      title: "特別支援学級を優先",
      description: "特別支援学級の家庭を優先的に配置します",
    },
    {
      icon: <ScheduleIcon />,
      title: "時間指定家庭を優先",
      description: "時間指定のある家庭は希望時間をできるだけ尊重します",
    },
    {
      icon: <GroupIcon />,
      title: "その他の家庭を児童配置",
      description: "残りの家庭を最適な時間に自動で配置します",
    },
    {
      icon: <EditIcon />,
      title: "教師が最終確認",
      description: "配置できなかった家庭は教師が確認・調整して確定します",
    },
  ];

  return (
    <>
      {/* ヘッダー */}
      <Box
        component="header"
        sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
      >
        <Typography variant="h6">Tsunagu</Typography>
        <Button variant="contained">デモログイン</Button>
      </Box>
      {/* ヒーロー */}
      <Box sx={{ display: "flex", gap: 4, p: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">
            学校の個別面談をもっとシンプルに
          </Typography>
          <Typography variant="h3" sx={{ p: 2 }}>
            3時間かかっていた
            <br />
            面談日程調整を
            <br />
            数分で。
          </Typography>
          <Typography>
            兄弟連続・特別支援別枠など
            <br />
            複雑な制約を自動で解決する
            <br />
            学校向け個別面談サービスです。
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained">教師としてのデモを見る</Button>
            <Button variant="outlined">保護者としてのデモを見る</Button>
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
        <Typography variant="h4" align="center">
          なぜ一般的な予約システムではダメなのか
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2, minHeight: 200 }}>
          <Box sx={{ flex: 1, border: "1px dashed grey" }}>
            <Typography>一般的な予約システム</Typography>
            {generalProblems.map((problem) => (
              <Box
                key={problem.title}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CloseIcon sx={{ color: "grey" }} />
                {problem.icon}
                <Box>
                  <Typography>{problem.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {problem.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ flex: 1, border: "1px dashed grey" }}>
            <Typography variant="body1">Tsunaguなら</Typography>
            {tsunaguApp.map((tsunagu) => (
              <Box
                key={tsunagu.title}
                sx={{ display: "flex", alignItem: "center", gap: 1 }}
              >
                <CheckCircleIcon sx={{ color: "blue" }} />
                {tsunagu.icon}
                <Box>
                  <Typography>{tsunagu.title}</Typography>
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
        <Typography variant="h4" align="center">
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
              border: "1px dashed grey",
              display: "flex",
              p: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Image
                src="/images/teacher-icon.png"
                alt="teacher-icon"
                width={200}
                height={100}
              />
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Typography>教師として体験する</Typography>
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
                <Button variant="contained">教師として体験する</Button>
              </Box>
            </Box>
          </Box>
          {/* 保護者側の枠 */}
          <Box
            sx={{
              flex: 1,
              border: "1px dashed grey",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", p: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Image
                  src="/images/parents-icon.png"
                  alt="parent-icon"
                  width={200}
                  height={100}
                />
              </Box>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography>保護者として体験する</Typography>
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
                  <Button variant="contained">保護者として体験する</Button>
                </Box>
              </Box>
            </Box>

            {/* ボタンの処理 */}
          </Box>
        </Box>
      </Box>
      {/* 割り当てロジック・プレビュー */}
      <Box component="section" sx={{ gap: 2, p: 2, display: "flex" }}>
        {/* 割り当てロジック */}
        <Box sx={{ flex: 1 }}>
          <Typography>Tsunagu割り当てロジック</Typography>
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
                      alignItems: "center",
                      textAlign: "center",
                      width: 160,
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
                    <Typography sx={{ mt: 1 }}>{step.title}</Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
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
        <Box sx={{ flex: 1 }}>
          <Typography>出力プレビュー</Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Box sx={{ flex: 1, border: "1px dashed grey", minHeight: 150 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PictureAsPdfIcon sx={{ color: "red" }} />
                <Typography>面談表PDF</Typography>
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
                <Typography>保護者への通知メール</Typography>
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
      </Box>
      {/* なぜTsunaguを作ったのか */}
      <Box component="section" sx={{ gap: 2, p: 2, display: "flex" }}>
        <Box sx={{ flex: 1, border: "1px dashed grey", minHeight: 250 }}>
          <Image
            src="/images/make_reason.png"
            alt="学校"
            width={300}
            height={200}
          />
        </Box>
        <Box sx={{ flex: 2, border: "1px dashed grey", minHeight: 250 }}>
          <Typography variant="h4">なぜTsunaguを作ったのか</Typography>
          <Typography variant="body1">
            私は小学校教員として、個人面談の日程作成に多くの時間がかかる現場を見てきました。
            特に、兄弟家族・特別支援学級・時間の制約を同時に考慮すると、Excelだけでは管理が難しくなります。
            「先生方が本来やるべき子どものための時間を増やすたい」そんな想いから、Tsunaguを開発しました。
          </Typography>
        </Box>
      </Box>
      {/* フッター */}
      <Box component="footer" sx={{ p: 4, textAlign: "center" }}>
        （仮）フッター
      </Box>
    </>
  );
}
