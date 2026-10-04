"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

type Props = {
  activeStep: number;
};

const steps = [
  {
    label: "面談日程を設定",
    description: "保護者・教師の条件を入力します。",
    Icon: PersonIcon,
  },
  {
    label: "自動で割り当て",
    description: "条件に基づき日程を自動で決定します。",
    Icon: SettingsIcon,
  },
  {
    label: "面談表を確認・調整",
    description: "必要に応じて手動で調整します。",
    Icon: AssignmentTurnedInIcon,
  },
  {
    label: "保護者へ通知",
    description: "確定した内容をメールで送信します。",
    Icon: SendIcon,
  },
];

export default function FlowStepper({ activeStep }: Props) {
  return (
    <Stepper alternativeLabel activeStep={activeStep}>
      {steps.map((step, index) => {
        const isActive = activeStep === index;
        return (
          <Step key={index} completed={false}>
            <StepLabel>{step.label}</StepLabel>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <step.Icon
                sx={{
                  fontSize: 40,
                  color: isActive ? "primary.main" : "text.disabled",
                }}
              />
            </Box>
            <Typography sx={{ maxWidth: 200, mx: "auto", minHeight: 70 }}>
              {step.description}
            </Typography>
          </Step>
        );
      })}
    </Stepper>
  );
}
