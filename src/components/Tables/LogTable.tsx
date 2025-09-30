// src/components/Tables/LogTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, TextField, MenuItem, TableContainer, Table,
  TableHead, TableBody, TableRow, TableCell, Link, Select,
  InputLabel, FormControl, Alert
} from "@mui/material";

type LogRow = {
  name: string;
  email: string;
  role: "Admin" | "Officer" | "Professor";
  action: string;        // "login"
  timeISO: string;       // ISO string from server
};

const LogTable = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errText, setErrText] = useState<string | null>(null);

  // clock (TH locale)
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleString("th-TH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // fetch logs
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrText(null);
      try {
        const res = await fetch("/api/audit-logs", { credentials: "include", cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Failed to load audit logs");
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErrText(e?.message ?? "Failed to load audit logs");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filters
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const nameMatch = r.name.toLowerCase().includes(searchName.toLowerCase());
      const roleMatch = !selectedRole || r.role === selectedRole;
      return nameMatch && roleMatch;
    });
  }, [rows, searchName, selectedRole]);

  // stats
  const professorsCount = useMemo(
    () => new Set(rows.filter(r => r.role === "Professor").map(r => r.email)).size,
    [rows]
  );
  const officersCount = useMemo(
    () => new Set(rows.filter(r => r.role === "Officer").map(r => r.email)).size,
    [rows]
  );
  const todayLoginsCount = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return rows.filter(r => {
      const t = new Date(r.timeISO);
      return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
    }).length;
  }, [rows]);

  const statCardStyle = {
    p: 3,
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    flexGrow: 1,
    minWidth: "200px",
  } as const;

  const allRoles = ["Admin", "Officer", "Professor"];

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("th-TH", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });

  return (
    <Box sx={{ p: 4, backgroundColor: "#dce6f7", minHeight: "100vh", ml: 5, mr: 5 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h5" component="h1" sx={{ color: "text.secondary", fontWeight: "bold" }}>
          {currentDateTime}
        </Typography>
      </Box>

      {errText && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errText}
        </Alert>
      )}

      {/* Stats */}
      <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
        <Box display="flex" sx={statCardStyle} justifyContent="center" alignItems="flex-start" flexDirection="column">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>จำนวนอาจารย์ทั้งหมด</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Total professors</Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1, color: "text.primary" }}>
            {professorsCount} คน
          </Typography>
        </Box>

        <Box display="flex" sx={statCardStyle} justifyContent="center" alignItems="flex-start" flexDirection="column">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>จำนวนเจ้าหน้าที่ทั้งหมด</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Total officers</Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1, color: "#e6bc15ff" }}>
            {officersCount} คน
          </Typography>
        </Box>

        <Box display="flex" sx={statCardStyle} justifyContent="center" alignItems="flex-start" flexDirection="column">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>จำนวนผู้เข้าใช้งานวันนี้</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Total users login today</Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1, color: "green" }}>
            {todayLoginsCount} คน
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          label="ค้นหาชื่อ"
          variant="outlined"
          size="small"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />
        <FormControl sx={{ minWidth: 150, bgcolor: "white", borderRadius: 1 }} size="small">
          <InputLabel>เลือก Role</InputLabel>
          <Select
            value={selectedRole}
            label="เลือก Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>
            {allRoles.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Box} sx={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Name","Email","Role","Action","Time"].map((h) => (
                <TableCell key={h} sx={{ backgroundColor: "#3f51b5", color: "#fff", fontWeight: "bold" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No logs found.</TableCell></TableRow>
            ) : (
              filtered.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.email === "LnwzqbBoss@gmail.com" ? (
                      <Link href="#" underline="always">{row.email}</Link>
                    ) : row.email}
                  </TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.action}</TableCell>
                  <TableCell>{fmt(row.timeISO)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogTable;