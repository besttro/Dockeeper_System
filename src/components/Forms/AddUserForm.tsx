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
  Alert,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function AddUserForm() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // NEW
  const [role, setRole] = useState<"Officer" | "Professor">("Officer");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [okText, setOkText] = useState<string | null>(null);
  const [errText, setErrText] = useState<string | null>(null);

  const validate = () => {
    if (!fname.trim() || !lname.trim())
      return "First and last name are required.";
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Email looks invalid.";
    if (!password) return "Password is required.";
    if (password !== confirm) return "Passwords do not match.";

    // phone: allow empty OR Thai digits (no leading +66 needed in DB, optional here)
    const p = phone.trim();
    if (p && !/^\+?\d{6,15}$/.test(p))
      return "Phone looks invalid. Use digits, optional +, 6–15 chars.";
    return null;
  };

  const handleSubmit = async () => {
    setOkText(null);
    setErrText(null);

    const v = validate();
    if (v) {
      setErrText(v);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fname: fname.trim(),
          lname: lname.trim(),
          email: email.trim(),
          phone: phone.trim() || null, // NEW
          password,
          role, // "Officer" | "Professor"
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to create user");

      setOkText("User created successfully.");
      setFname("");
      setLname("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirm("");
      setRole("Officer");
    } catch (e: any) {
      setErrText(e?.message ?? "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 4, borderRadius: 3, maxWidth: 800, mx: "auto" }}
    >
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Add New User
      </Typography>

      {errText && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errText}
        </Alert>
      )}
      {okText && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {okText}
        </Alert>
      )}

      <Box display="flex" gap={2} flexDirection="column">
        <Box display="flex" flexDirection="row" gap={2}>
          <TextField
            required
            label="First Name"
            fullWidth
            value={fname}
            onChange={(e) => setFname(e.target.value)}
          />
          <TextField
            required
            label="Last Name"
            fullWidth
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
        </Box>

        <TextField
          required
          id="email"
          type="email"
          label="Email Address"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Phone (optional) */}
        <TextField
          id="phone"
          label="Telephone Number"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+66 812345678"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">+ / 0</InputAdornment>
            ),
          }}
        />

        <Box display="flex" flexDirection="row" gap={2}>
          <TextField
            required
            label="Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            required
            label="Confirm Password"
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword((s) => !s)}>
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
            onChange={(e) => setRole(e.target.value as "Officer" | "Professor")}
          >
            <MenuItem value="Officer">Staff</MenuItem>
            <MenuItem value="Professor">Professor</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box textAlign="right" mt={4}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#0d2c6c", borderRadius: 2, px: 4 }}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Adding…" : "Add User"}
        </Button>
      </Box>
    </Paper>
  );
}
