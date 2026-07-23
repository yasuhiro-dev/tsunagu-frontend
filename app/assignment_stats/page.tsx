"use client";

import { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { BarChart } from "@mui/x-charts/BarChart";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const chartSetting = {
  xAxis: [
    {
      label: "進捗状況",
    },
  ],
  height: 500,
  margin: { left: 0 },
};

export default function AssignmentState() {
  const [classRates, setClassRates] = useState();
  const [allRates, setAllRates] = useState();
  const [value, setValue] = useState(0);
  const settings = {
    width: 200,
    height: 200,
    value: allRates,
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
    fetchAssignmentStats();
  }, []);

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 3,
        flexGrow: 1,
        margin: "auto",
        width: 400,
      }}
    >
      <Typography variant="h5">割合</Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="全学年の割合" {...a11yProps(0)} />
          <Tab label="学年ごとの割合" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Typography variant="h5">全体割当率</Typography>
        <Gauge
          {...settings}
          cornerRadius="50%"
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 40,
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: "#52b202",
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: theme.palette.text.disabled,
            },
          })}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Typography variant="h5">学年別進捗</Typography>
        {classRates && (
          <BarChart
            dataset={classRates}
            yAxis={[{ scaleType: "band", dataKey: "class_name" }]}
            series={[{ dataKey: "rate", label: "割り当て進捗状況" }]}
            layout="horizontal"
            {...chartSetting}
          />
        )}
      </CustomTabPanel>
    </Paper>
  );
}
