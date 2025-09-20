"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Save email for later use
        localStorage.setItem("userEmail", email);
        router.push("/"); // go to home
      } else {
        setError("Email หรือ Password ไม่ถูกต้อง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 360,
        p: 4,
        borderRadius: 2,
        bgcolor: "background.paper",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
        Login
      </Typography>

      <Box component="form" onSubmit={handleLogin}>
        {/* Email */}
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Log in
        </Button>
      </Box>
    </Paper>
  );
}
