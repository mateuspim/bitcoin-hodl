// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#181818", // solid dark background
      paper: "#232526",   // card background
    },
    primary: {
      main: "#232526",
    },
    warning: {
      main: "#f7931a", // Bitcoin orange accent
    },
    text: {
      primary: "#fff",
      secondary: "#f7931a",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#232526",
          color: "#fff",
          border: "1px solid #181818",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.4)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          color: "#fff",
        },
        notchedOutline: {
          borderColor: "#f7931a",
        },
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#f7931a",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#f7931a",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#f7931a",
          "&.Mui-focused": {
            color: "#f7931a",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
          borderRadius: 8,
          textTransform: "none",
        },
        containedWarning: {
          backgroundColor: "#f7931a",
          color: "#000",
          "&:hover": {
            backgroundColor: "#d67c14",
          },
        },
        outlinedWarning: {
          borderColor: "#f7931a",
          color: "#f7931a",
          "&:hover": {
            backgroundColor: "#232526",
            borderColor: "#f7931a",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#f7931a",
          "&.Mui-checked": {
            color: "#f7931a",
          },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#f7931a",
          },
        },
        track: {
          backgroundColor: "#555",
        },
      },
    },
  },
});

export default theme;