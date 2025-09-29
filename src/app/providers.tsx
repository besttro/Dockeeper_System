// src/app/providers.tsx
"use client";

import { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // ฟ้า MUI
    },
    secondary: {
      main: "#f50057", // ชมพู
    },
    success: {
      main: "#028443", // เขียว
    },
    info: { 
      main: "#0051FF" 
    }
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
