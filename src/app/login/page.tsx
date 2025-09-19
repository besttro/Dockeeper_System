"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, Button } from "@mui/material";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.push("/"); // navigate to home page
      } else {
        setError("Email หรือ Password ไม่ถูกต้อง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "white" }}>
      {/* Left side: login form */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#E4EDFF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ width: "300px", display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Login
          </Button>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right side: branding */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#C3D6FF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/psu_logo.png"
            alt="PSU Logo"
            width={112}
            height={187}
            style={{ objectFit: "cover", marginBottom: "32px" }}
          />
          <Typography variant="h4" color="#2A51A7" fontWeight={"bold"} mb={2}>
            DOCKEEPER
          </Typography>
          <Typography
            variant="subtitle1"
            color="#2A51A7"
            textAlign="center"
            px={4}
          >
            ระบบรวบรวมงานตีพิมพ์ อาจารย์คณะวิทยาศาสตร์ สาขาวิทยาการคอมพิวเตอร์
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

