import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: "var(--font-m-plus-rounded)",
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  palette: {
    primary: {
      main: "#4a7ba7",
      light: "#7ba3c7ff",
      dark: "#2d5a80",
    },
    error: {
      main: "#b5535b",
    },
    success: {
      main: "#5b8f6b",
    },
    warning: {
      main: "#c08b4a",
    },
    background: {
      default: "#f0f5fa",
      paper: "#ffffff",
    },
  },
});
