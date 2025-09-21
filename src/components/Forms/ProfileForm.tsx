"use client";

import { useEffect, useState } from "react";
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
import { Visibility, VisibilityOff, Edit } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";

export default function ProfileForm() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load current profile
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      fetch(`/api/profile?email=${storedEmail}`)
        .then((res) => res.json())
        .then((data) => {
          setFname(data.fname || "");
          setLname(data.lname || "");
          setPhone(data.phone || "");
        });
    }
  }, []);

  const handleSubmit = async () => {
    if (password && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        fname,
        lname,
        phone,
        password: password || null,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Profile updated successfully");
      setPassword("");
      setConfirmPassword("");
    } else {
      alert("Error updating profile");
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
      {/* Avatar and Info */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ width: 80, height: 80 }}>
          {fname ? fname[0].toUpperCase() : "U"}
        </Avatar>
        <Box>
          <Typography fontWeight="bold">{fname} {lname}</Typography>
          <Typography color="text.secondary">{email}</Typography>
        </Box>
      </Box>

      {/* Form */}
      <Box display="flex" gap={2} flexDirection="row">
        <Box display="flex" flexDirection="column" flex={1} gap={2}>
          <TextField
            required
            label="Your First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            fullWidth
          />
          <TextField
            required
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">+66</InputAdornment> }}
            fullWidth
          />
        </Box>

        <Box display="flex" flexDirection="column" flex={1} gap={2}>
          <TextField
            required
            label="Your Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            fullWidth
          />
          <TextField
            label="Enter your new password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            label="Enter your new password again"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Email Info */}
      <Box mt={4}>
        <Typography fontWeight="bold" mb={1}>My Email Address</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box height={40} width={40} display="flex" alignItems="center" justifyContent="center" bgcolor="#d1e3feff" borderRadius={100}>
            <EmailIcon color="primary" />
          </Box>
          <Box>
            <Typography>{email}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Confirm Button */}
      <Box textAlign="right" mt={4}>
        <Button variant="contained" sx={{ bgcolor: "#0d2c6c", borderRadius: 2, px: 4 }} onClick={handleSubmit}>
          Confirm
        </Button>
      </Box>
    </Paper>
  );
}
