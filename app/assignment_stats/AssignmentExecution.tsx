"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { BarChart } from "@mui/x-charts/BarChart";
import Button from "@mui/material/Button";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import "dayjs/locale/ja";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { stepIconClasses } from "@mui/material/StepIcon";
import { stepLabelClasses } from "@mui/material/StepLabel";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import DemoGuide from "@/app/components/DemoGuide";

type Props = {
  scheduleId: number | null;
};
type UnassignedChild = {
  id: number;
  name: string;
  name_kana: string;
  class_rooms: {
    id: number;
    classname: string;
  }[];
};

const steps = [
  {
    label: "保護者・教師が日時を入力",
    description: "教師は不在日、保護者は来校できる日時を入力します。",
    icon: <PersonIcon sx={{ fontSize: 40, color: "primary.main" }} />,
  },
  {
    label: "自動で割り当て",
    description: "条件をもとに、面談日を自動で決めます。",
    icon: <SettingsIcon sx={{ fontSize: 40, color: "primary.main" }} />,
  },
  {
    label: "面談表に反映",
    description: "決まった日時が面談表に表示されます。",
    icon: (
      <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "primary.main" }} />
    ),
  },
];

export default function AssignmentExecution({ scheduleId }: Props) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [classRates, setClassRates] = useState([]);
  const [assignCount, setAssignCount] = useState<number>(0);
  const [unAssignCount, setUnAssignCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [allRates, setAllRates] = useState<number>(0);
  const [isAssigning, setIsAssigning] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [unassignedChildren, setUnassignedChildren] = useState<
    UnassignedChild[]
  >([]);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  //棒グラフの見た目
  const chartSetting = {
    height: 300,
    width: isMobile ? 230 : 300,
    margin: { left: 0 },
  };
  //円グラフの見た目
  const settings = {
    width: isMobile ? 200 : 250,
    height: isMobile ? 200 : 300,
    value: allRates,
    // valueはオブジェクトで受け取るため分割代入(少数を切り捨て)
    text: ({ value }: { value: null | number }) =>
      `${value !== null ? Math.floor(value) : 0}%`,
  };

  // 統計情報を取得する処理を、1箇所にまとめる
  const fetchAssignmentStats = async () => {
    // 割り当て結果を反映した後、最新の統計情報を改めて取得する
    const statsRes = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignment_stats`,
    );
    const stateData = await statsRes.json();
    setClassRates(stateData.class_rates);
    setAllRates(stateData.all_rates);
    setAssignCount(stateData.assign_count);
    setUnAssignCount(stateData.unassign_count);
    setTotalCount(stateData.total_count);
    setUnassignedChildren(stateData.unassigned_children);
  };
  // 割り当てボタンを押した時、schedulesにAPIを送る
  const handleClick = async () => {
    setIsAssigning(true);
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${scheduleId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();
    await fetchAssignmentStats();
    setIsAssigning(false);

    if (res.ok === true && data.unassigned_children.length === 0) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("全員の割り当てが成功しました");
      setShowAssignmentDialog(true);
    } else if (res.ok === true && data.unassigned_children.length > 0) {
      setUnassignedChildren(data.unassigned_children);
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("割り当て失敗した児童がいます");
      setShowAssignmentDialog(true);
    } else {
      setAlertMessage(data.error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignmentStats();
  }, []);

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        maxWidth: isMobile ? "265px" : "100",
        backgroundColor: "#ecf1f4ff",
      }}
    >
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      {showAssignmentDialog && <DemoGuide page="assignment_button" />}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
            >
              <Typography variant="h6">面談の一括割り当て</Typography>
              <Typography variant="body2">
                保護者の希望日時・兄弟関係・支援学級などの条件を考慮して、教師の空き枠に面談を自動で割り当てます。
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* 割り当ての手順 */}
              <Box
                sx={{
                  flex: 2,
                  minWidth: 0,
                  backgroundColor: "#ecf1f4ff",
                  p: 2,
                  borderRadius: 3,
                }}
              >
                <Stepper
                  alternativeLabel
                  activeStep={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    [`& .${stepIconClasses.root}`]: {
                      color: "primary.main",
                    },
                    [`& .${stepIconClasses.active}`]: {
                      color: "primary.main",
                    },
                    [`& .${stepIconClasses.completed}`]: {
                      color: "primary.main",
                    },
                    [`& .${stepLabelClasses.label}`]: {
                      color: "text.primary",
                    },
                    [`& .${stepLabelClasses.active}`]: {
                      color: "text.primary",
                    },
                  }}
                >
                  {steps.map((step) => (
                    <Step key={step.label}>
                      <StepLabel>{step.label}</StepLabel>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {step.icon}
                      </Box>
                      <Typography
                        sx={{ maxWidth: 200, mx: "auto", minHeight: 70 }}
                      >
                        {step.description}
                      </Typography>
                    </Step>
                  ))}
                </Stepper>
              </Box>
              {/* ボタン操作群 */}
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                {/*割り当て完了ボタン */}
                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                  onClick={handleClick}
                  disabled={isAssigning}
                  sx={{
                    height: 50,
                  }}
                >
                  {isAssigning ? "割り当て中" : "▶ 割り当てを実行する"}
                </Button>
                <Typography>(約10秒ほどかかります)</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* 全体割り当て進捗状況 */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ width: 300 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <DonutLargeIcon sx={{ color: "primary.main" }} />
                全体割り当て率
              </Typography>

              {/* ここから、円グラフと3項目を横並びにする */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* 円グラフ本体 */}
                <Gauge
                  {...settings}
                  cornerRadius="50%"
                  sx={(theme) => ({
                    [`& .${gaugeClasses.valueText}`]: { fontSize: 40 },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: theme.palette.success.main,
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: theme.palette.text.disabled,
                    },
                  })}
                />
                {/* 3項目、円グラフの横に */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {/* 割り当て済み */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "success.main",
                      }}
                    />
                    <Box>
                      <Typography variant="body2">割り当て済み</Typography>
                      <Typography variant="h6">{assignCount}件</Typography>
                    </Box>
                  </Box>

                  {/* 未割り当て */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "text.disabled",
                      }}
                    />
                    <Box>
                      <Typography variant="body2">未割り当て</Typography>
                      <Typography variant="h6">{unAssignCount}件</Typography>
                    </Box>
                  </Box>

                  {/* 対象児童数 */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "text.disabled",
                      }}
                    />
                    <Box>
                      <Typography variant="body2">対象児童数</Typography>
                      <Typography variant="h6">{totalCount}件</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
          {/* 学年割り当て進捗状況 */}
          <Paper sx={{ p: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <BarChartIcon sx={{ color: "primary.main" }} />
                学年別割り当て率
              </Typography>
              <Box>
                {classRates && (
                  <BarChart
                    dataset={classRates}
                    // 棒グラフの縦の読みの所
                    yAxis={[
                      {
                        scaleType: "band",
                        dataKey: "class_name",
                        width: isMobile ? 60 : 80,
                      },
                    ]}
                    series={[
                      {
                        color: "#409563",
                        dataKey: "rate",
                        valueFormatter: (value) =>
                          `${value !== null ? Math.floor(value) : 0}%`,
                      },
                    ]}
                    layout="horizontal"
                    {...chartSetting}
                  />
                )}
              </Box>
            </Box>
          </Paper>
          {/* 未割り当て一覧 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              <PersonSearchIcon sx={{ color: "primary.main" }} />
              未割り当ての児童
            </Typography>
            <Box
              sx={{
                mt: 4,
                p: 2,
                backgroundColor: "grey.100",
                borderRadius: 2,
                flex: 1,
                minWidth: 300,
                maxHeight: 250,
                overflowY: "scroll",
              }}
            >
              {unassignedChildren.length === 0 ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  全員の割り当てが完了しています。
                </Typography>
              ) : (
                unassignedChildren.map((child, index) => (
                  <Typography key={index} variant="body2">
                    {child.name}（{child.class_rooms[0]?.classname}）
                  </Typography>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
}
