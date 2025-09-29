// components/Forms/AdminEditUserForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box, Paper, Avatar, Typography, TextField, Button,
  IconButton, InputAdornment, Alert
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";

type LoadedUser = {
  id: number;
  email: string;
  fname: string;
  lname: string;
  phone: string;
  memType: number | null; // 0 admin, 1 staff, 2 professor
};

export default function AdminEditUserForm() {
  const params = useParams<{ id: string }>();
  const userId = Number(params?.id);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [okText, setOkText] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(userId)) {
      setErrorText("Invalid user id in URL.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const res = await fetch(`/api/users/${userId}`, { credentials: "include" });
        if (res.status === 401) {
          setErrorText("Please log in.");
          return;
        }
        if (res.status === 403) {
          setErrorText("You don’t have permission to view this user.");
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? "Failed to load user");
        }
        const data: LoadedUser = await res.json();
        setEmail(data.email ?? "");
        setFname(data.fname ?? "");
        setLname(data.lname ?? "");
        setPhone(data.phone ?? "");
      } catch (e: any) {
        setErrorText(e?.message ?? "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleSubmit = async () => {
    setErrorText(null);
    setOkText(null);

    if (!fname.trim() || !lname.trim()) {
      setErrorText("First and last name are required.");
      return;
    }
    if (password && password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fname: fname.trim(),
          lname: lname.trim(),
          phone: phone.trim(),
          password: password.trim() || null, // plain text per your setup
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error ?? "Error updating user");
      }
      setOkText("User updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setErrorText(e?.message ?? "Error updating user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
      {/* Avatar and header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ width: 80, height: 80 }}>
          {fname ? fname[0].toUpperCase() : "U"}
        </Avatar>
        <Box>
          <Typography fontWeight="bold">
            {fname || "—"} {lname || ""}
          </Typography>
          <Typography color="text.secondary">{email || "—"}</Typography>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading…</Typography>
      ) : (
        <>
          {errorText && <Alert severity="error" sx={{ mb: 2 }}>{errorText}</Alert>}
          {okText && <Alert severity="success" sx={{ mb: 2 }}>{okText}</Alert>}

          {/* Form fields */}
          <Box display="flex" gap={2} flexDirection="row">
            <Box display="flex" flexDirection="column" flex={1} gap={2}>
              <TextField
                required
                label="First Name"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                fullWidth
              />
              <TextField
                label="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+66</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Box>

            <Box display="flex" flexDirection="column" flex={1} gap={2}>
              <TextField
                required
                label="Last Name"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                fullWidth
              />

              <TextField
                label="New password (optional)"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
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
                label="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
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
          </Box>

          {/* Email (read-only) */}
          <Box mt={4}>
            <Typography fontWeight="bold" mb={1}>Email</Typography>
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
                <Typography>{email || "—"}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Save */}
          <Box textAlign="right" mt={4}>
            <Button
              variant="contained"
              sx={{ bgcolor: "#0d2c6c", borderRadius: 2, px: 4 }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving…" : "Confirm"}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}
