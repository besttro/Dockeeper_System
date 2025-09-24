"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function EditProfileForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        maxWidth: 800,
        mx: "auto",
        overflow: "hidden", // ให้ gradient ตัดตามโค้ง Paper
      }}
    >
      {/* Gradient Top Bar */}
      <Box
        sx={{
          height: 80,
          background: "linear-gradient(to right, #dbeafe, #fff7ed)", // gradient เหมือนหน้าก่อน
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />

      {/* Content */}
      <Box sx={{ p: 4 }}>
        {/* ส่วน Avatar และ Email */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box position="relative">
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: "#20329cff", fontSize: 32 }}
            >
              T
            </Avatar>
          </Box>
          <Box>
            <Typography fontWeight="bold">Teerasak shadowmaster</Typography>
            <Typography color="text.secondary">
              teerasak.shadowmaster@gmail.com
            </Typography>
          </Box>
        </Box>

        {/* ฟอร์ม */}
        <Box display="flex" gap={2} flexDirection={"row"}>
          <Box display={"flex"} flexDirection={"column"} flex={1} gap={2}>
            <TextField
              required
              id="outlined-required"
              label="Your First Name"
              fullWidth
            />

            <TextField
              required
              id="outlined-required"
              label="Phone number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">+66</InputAdornment>
                ),
              }}
              fullWidth
            />
          </Box>
          <Box display={"flex"} flexDirection={"column"} flex={1} gap={2}>
            <TextField
              required
              id="outlined-required"
              label="Your Last Name"
              fullWidth
            />

            <TextField
              required
              id="outlined-required"
              label="Enter your new password"
              type={showPassword ? "text" : "password"}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              id="outlined-required"
              label="Enter your new password again"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* Email แสดงด้านล่าง */}
        <Box mt={4}>
          <Typography fontWeight="bold" mb={1}>
            My Email Address
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                height={40}
                width={40}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="#d1e3feff"
                borderRadius={100}
              >
                <EmailIcon color="primary" />
              </Box>

              <Box>
                <Typography>teerasak.shadowmaster@gmail.com</Typography>
                <Typography variant="body2" color="text.secondary">
                  click for email
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{ bgcolor: "#0d2c6c", borderRadius: 2, px: 4 }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}