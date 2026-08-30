"use client";

import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { BarChart } from "@mui/x-charts/BarChart";
import Button from "@mui/material/Button";
import AlertSnackbar from "@/app/components/AlertSnackbar";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function AssignmentState() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [classRates, setClassRates] = useState([]);
  const [allRates, setAllRates] = useState<number>(0);
  const [isAssigning, setIsAssigning] = useState(false);
  const [currentSchedules, setCurrentSchedules] = useState<null | number>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [editDeadLine, setEditDeadLine] = useState<null | string>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  //棒グラフの見た目
  const chartSetting = {
    height: 400,
    width: isMobile ? 230 : 300,
    margin: { left: 0 },
  };
  //円グラフの見た目
  const settings = {
    width: isMobile ? 200 : 250,
    height: isMobile ? 200 : 400,
    value: allRates,
    // valueはオブジェクトで受け取るため分割代入(少数を切り捨て)
    text: ({ value }: { value: null | number }) =>
      `${value !== null ? Math.floor(value) : 0}%`,
  };

  // 今年度のschedule_idを取得する
  const fetchCurrentSchedule = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/current`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    setCurrentSchedules(data.id);
    return data.id;
  };

  // 割り当てボタンを押した時、schedulesにAPIを送る
  const handleClick = async () => {
    setIsAssigning(true);
    const schedule = currentSchedules;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${schedule}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await res.json();

    if (res.ok === true && data.unassigned_children.length === 0) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("全員の割り当てが成功しました");
    } else if (res.ok === true && data.unassigned_children.length > 0) {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("割り当て失敗した児童がいます");
    } else {
      setAlertMessage(data.error);
    }

    // 割り当て結果を反映した後、最新の統計情報を改めて取得する
    const statsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignment_stats`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    const stateData = await statsRes.json();
    setClassRates(stateData.class_rates);
    setAllRates(stateData.all_rates);
    setIsAssigning(false);
  };

  // 締め切り日の変更を表示する
  const fetchEditDeadLine = async (scheduleId: number) => {
    const token = localStorage.getItem("token");
    const schedule = scheduleId;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${schedule}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    setEditDeadLine(data.deadline_at);
  };

  // 提出締切日の変更の関数
  const updateEditDeadLine = async () => {
    const token = localStorage.getItem("token");
    const schedule = currentSchedules;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedules/${schedule}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // フロントで設定した締切日（editDeadLine）をRailsに送る
        body: JSON.stringify({ deadline_at: editDeadLine }),
      },
    );
    // 更新された締め切り日が返ってくる
    const data = await res.json();
    if (res.ok) {
      setAlertOpen(true);
      setAlertSeverity("success");
      setAlertMessage("変更しました");
      setEditDeadLine(data.deadline_at);
    } else {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertMessage("変更に失敗しました");
    }
  };

  useEffect(() => {
    const fetchAssignmentStats = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignment_stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setClassRates(data.class_rates);
      setAllRates(data.all_rates);
    };
    // fetchCurrentScheduleで今年度のscheduleIdを取得してからfetchEditDeadLineを実行
    const loadSchedule = async () => {
      const scheduleId = await fetchCurrentSchedule();
      await fetchEditDeadLine(scheduleId);
      fetchAssignmentStats();
    };
    loadSchedule();
  }, []);

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        maxWidth: isMobile ? "265px" : "100",
      }}
    >
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box>
          <Box
            sx={{
              display: "flex",
              gap: 10,
              flexDirection: { xs: "column", sm: "column", md: "row" },
              maxHeight: "calc(100vh - 400px)",
              minHeight: "calc(100vh - 400px)",
              overflow: "auto",
            }}
          >
            {/* 締め切りカレンダー（保護者の都合の悪い日） */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                締切日の設定
              </Typography>
              {/* DatePickerの動作に必要な設定（dayjsを使うと指定） */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* 締切日入力用のカレンダー */}
                <DatePicker
                  //今どんな値を選んでいるか
                  value={editDeadLine !== null ? dayjs(editDeadLine) : null}
                  // カレンダーをクリックして変化したら処理される
                  onChange={(newValue) =>
                    // nullじゃなければ、選ばれた日付を文字列(.format)に変換してstateを更新する
                    setEditDeadLine(
                      newValue !== null ? newValue.format("YYYY-MM-DD") : null,
                    )
                  }
                />
              </LocalizationProvider>
            </Box>
            {/* 全体割り当て進捗状況 */}
            <Box sx={{ width: 300 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                全体割り当て率
              </Typography>
              <Gauge
                {...settings}
                cornerRadius="50%"
                sx={(theme) => ({
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 40,
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: theme.palette.success.main,
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: theme.palette.text.disabled,
                  },
                })}
              />
            </Box>

            {/* 学年割り当て進捗状況 */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
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
                        width: isMobile ? 50 : 80,
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
          </Box>
        </Box>

        {/* ボタン操作群 */}
        <Box
          sx={{
            display: "flex",
            gap: isMobile ? 3 : 20,
            flexDirection: { xs: "column", sm: "column", md: "row" },
          }}
        >
          {/* 保存ボタンを押すと編集更新の関数が呼ばれる */}
          <Button
            onClick={updateEditDeadLine}
            variant="contained"
            color="primary"
            disabled={isAssigning}
            sx={{ minWidth: 160 }}
          >
            締切日を更新する
          </Button>
          {/*割り当て完了ボタン */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleClick}
            disabled={isAssigning}
            sx={{ minWidth: 160 }}
          >
            {isAssigning ? "割り当て中" : "割り当てを実行する"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
