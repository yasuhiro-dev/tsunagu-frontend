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
  { label: "保護者・教師の希望", Icon: PersonIcon },
  { label: "自動で割り当て", Icon: SettingsIcon },
  { label: "面談表で確認・調整", Icon: AssignmentTurnedInIcon },
  { label: "保護者へ通知", Icon: SendIcon },
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
          </Step>
        );
      })}
    </Stepper>
  );
}
