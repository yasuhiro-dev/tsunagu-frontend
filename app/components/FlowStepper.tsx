"use client";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SchoolIcon from "@mui/icons-material/School";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

type Props = {
  activeStep: number;
};

const steps = [
  { label: "先生が日時を提出", Icon: SchoolIcon },
  { label: "保護者が日時を提出", Icon: FamilyRestroomIcon },
  { label: "自動で割り当て", Icon: SettingsIcon },
  { label: "先生が確認・調整", Icon: AssignmentTurnedInIcon },
  { label: "保護者へ通知", Icon: SendIcon },
  { label: "保護者が確認", Icon: EventAvailableIcon },
];
export default function FlowStepper({ activeStep }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Stepper
      activeStep={activeStep}
      orientation={isMobile ? "vertical" : "horizontal"}
      alternativeLabel={!isMobile}
    >
      {steps.map((step, index) => {
        const isActive = activeStep === index;
        return (
          <Step key={index} completed={false}>
            <StepLabel>{step.label}</StepLabel>
            <Box
              sx={{
                display: "flex",

                justifyContent: "center",
                mt: 1,
              }}
            >
              <step.Icon
                sx={{
                  fontSize: isMobile ? 22 : 30,
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
