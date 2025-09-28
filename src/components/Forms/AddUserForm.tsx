// src/components/Forms/AddUserForm.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function AddUserForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("Officer");

  const handleRoleChange = (event: any) => {
    setRole(event.target.value);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        maxWidth: 800,
        mx: "auto",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Add New User
      </Typography>

      {/* ฟอร์ม */}
      <Box display="flex" gap={2} flexDirection={"column"}>
        <Box display={"flex"} flexDirection={"row"} gap={2}>
          <TextField
            required
            id="first-name"
            label="First Name"
            fullWidth
          />
          <TextField
            required
            id="last-name"
            label="Last Name"
            fullWidth
          />
        </Box>

        <TextField
          required
          id="username"
          label="Username"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          required
          id="email"
          label="Email Address"
          type="email"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Box display={"flex"} flexDirection={"row"} gap={2}>
          <TextField
            required
            id="password"
            label="Password"
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
            id="confirm-password"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <FormControl fullWidth required>
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            id="role-select"
            value={role}
            label="Role"
            onChange={handleRoleChange}
          >
            <MenuItem value="Officer">Officer</MenuItem>
            <MenuItem value="Professor">Professor</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ปุ่มยืนยัน */}
      <Box textAlign="right" mt={4}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#0d2c6c", borderRadius: 2, px: 4 }}
        >
          Add User
        </Button>
      </Box>
    </Paper>
  );
}