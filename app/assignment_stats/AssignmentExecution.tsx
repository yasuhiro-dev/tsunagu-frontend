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
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import DemoGuide from "@/app/components/DemoGuide";
import FlowStepper from "@/app/components/FlowStepper";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GuideHelp from "@/app/components/GuideHelp";
import CircularProgress from "@mui/material/CircularProgress";
import NextStepButton from "@/app/components/NextStepButton";
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
type SiblingAssignment = {
  total: number;
  success: number;
};
const EmptyResult = () => (
  <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
    割り当て実行後に表示されます。
  </Typography>
);

export default function AssignmentExecution({ scheduleId }: Props) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [classRates, setClassRates] = useState([]);
  const [assignCount, setAssignCount] = useState<number>(0);
  const [unAssignCount, setUnAssignCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [allRates, setAllRates] = useState<number>(0);
  const [siblingAssignment, setSiblingAssignment] =
    useState<SiblingAssignment | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [alertDuration, setAlertDuration] = useState(4000);
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
    setSiblingAssignment(stateData.siblings_stats);
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
      setAlertDuration(4000);
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("全員の割り当てが成功しました");
      setShowAssignmentDialog(true);
    } else if (res.ok === true && data.unassigned_children.length > 0) {
      setAlertDuration(5000);
      setUnassignedChildren(data.unassigned_children);
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage(
        `割り当てが完了しました。条件に合う枠がなかった${data.unassigned_children.length}人は、担任が面談表で割り当てます`,
      );
      setTimeout(() => {
        setShowAssignmentDialog(true);
      }, 1000);
    } else {
      setAlertMessage(data.error);
      setAlertDuration(5000);
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
  const hasResult = assignCount > 0;

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        maxWidth: isMobile ? "265px" : "100%",
        backgroundColor: "#ecf1f4ff",
        width: "100%",
      }}
    >
      <AlertSnackbar
        autoHideDuration={alertDuration}
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      <DemoGuide
        page="assignment_button"
        open={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6">面談の一括割り当て</Typography>
                <GuideHelp page="admin_assignment" />
              </Box>
              {hasResult && <NextStepButton page={"assignment_button"} />}
            </Box>

            <Typography>
              保護者の希望日時・兄弟関係・支援学級などの条件を考慮して、担任の先生の空き枠に面談を自動で割り当てます。
            </Typography>
          </Box>

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
            <FlowStepper activeStep={2} />
          </Box>
        </Paper>
        <Paper sx={{ display: "flex", p: 2 }}>
          {/* ボタン操作群 */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: "column",
              p: 2,
              mr: 2,
              flex: 2,
            }}
          >
            <Typography variant="h6">割り当てを実行</Typography>
            <Typography>
              希望日時が未提出でも割り当て対象になります。
            </Typography>
            {hasResult
              ? `再実行すると、今の割り当て${assignCount}件はリセットされます。`
              : "結果を見てから、やり直すこともできます。"}
          </Box>
          <Box
            sx={{
              display: "flex",
              minWidth: 320,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {/*割り当て完了ボタン */}
            <Button
              variant={hasResult ? "outlined" : "contained"}
              fullWidth
              color="primary"
              onClick={handleClick}
              disabled={isAssigning}
              startIcon={isAssigning ? <CircularProgress size={20} /> : null}
              sx={{
                p: 2,
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              {isAssigning
                ? "割り当て中"
                : hasResult
                  ? "もう一度割り当てる"
                  : "▶ 割り当てを実行する"}
            </Button>
            <Typography>(５秒ほどかかります)</Typography>
          </Box>
        </Paper>
        <Paper sx={{ borderRadius: 2, p: 4 }}>
          {siblingAssignment && siblingAssignment.total > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <FamilyRestroomIcon sx={{ color: "primary.main" }} />
                きょうだいの連続面談
              </Typography>
              {hasResult ? (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography>きょうだいがいる</Typography>
                  <Box
                    component="span"
                    sx={{
                      color: "primary.main",
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    {siblingAssignment.total}家庭
                  </Box>
                  のうち、
                  <Box
                    component="span"
                    sx={{
                      color: "primary.main",
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    {siblingAssignment.success}家庭
                  </Box>
                  の面談を同じ日に続けて組みました。
                </Box>
              ) : (
                <EmptyResult />
              )}
            </>
          )}
        </Paper>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* 全体割り当て進捗状況 */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <DonutLargeIcon sx={{ color: "primary.main" }} />
              全体割り当て率
            </Typography>

            {hasResult ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {" "}
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
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      {" "}
                      {/* 割り当て済み */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                          <Typography variant="h6">
                            {unAssignCount}件
                          </Typography>
                        </Box>
                      </Box>
                      {/* 対象児童数 */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
              </>
            ) : (
              <EmptyResult />
            )}
          </Paper>
          <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
            {/* 学年割り当て進捗状況 */}
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <BarChartIcon sx={{ color: "primary.main" }} />
                学年別割り当て率
              </Typography>

              {hasResult && classRates ? (
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
              ) : (
                <EmptyResult />
              )}
            </Box>
          </Paper>
          {/* 未割り当て一覧 */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
            <Box>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <PersonSearchIcon sx={{ color: "primary.main" }} />
                未割り当ての児童
              </Typography>

              {hasResult ? (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "grey.100",
                    borderRadius: 2,

                    maxHeight: 250,
                    overflowY: "auto",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    参加できる日時が少ないなど、条件に合う枠がなかった児童です。担任が保護者と相談し、面談表から手動で割り当てます。
                  </Typography>
                  {unassignedChildren.length === 0 ? (
                    <Typography variant="body2">
                      全員の割り当てが完了しています。
                    </Typography>
                  ) : (
                    unassignedChildren.map((child) => (
                      <Typography key={child.id} variant="body2">
                        {child.name}（{child.class_rooms[0]?.classname}）
                      </Typography>
                    ))
                  )}
                </Box>
              ) : (
                <EmptyResult />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
}
