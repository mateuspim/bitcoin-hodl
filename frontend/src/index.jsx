import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // import your custom theme

import "./index.css"; // your global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures background and text colors are set */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);