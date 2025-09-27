// app/profile/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Box, Typography, Avatar, Stack, FormControl, Select, MenuItem, Button, Link as MuiLink, Alert,
} from "@mui/material";
import NextLink from "next/link";
import Navbar from "@/components/Navigator/Navbar";
import { deepPurple } from "@mui/material/colors";

type Pub = { id: number; title: string; year: number; link: string };
type ProfileRes = {
  id: number; email: string; fname: string; lname: string; phone: string;
  memType: 0|1|2|null;
  publications: Pub[];
};

export default function ProfileOtherPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ProfileRes | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");

  useEffect(() => {
    (async () => {
      setErrorText(null);
      try {
        const res = await fetch(`/api/users/${params.id}`, { credentials: "include", cache: "no-store" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? `Failed (${res.status})`);
        }
        const j: ProfileRes = await res.json();
        setData(j);
      } catch (e: any) {
        setErrorText(e?.message ?? "Failed to load user profile");
      }
    })();
  }, [params.id]);

  const pubs = (data?.publications ?? []).sort((a, b) => b.year - a.year);
  const years = Array.from(new Set(pubs.map(p => p.year))).sort((a, b) => b - a);
  const filtered = pubs.filter(p => {
    const s = startYear ? parseInt(startYear) : -Infinity;
    const e = endYear ? parseInt(endYear) : Infinity;
    return p.year >= s && p.year <= e;
  });

  const fullName = [data?.fname, data?.lname].filter(Boolean).join(" ") || "—";

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 4, background: "#dce6f7", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
        <Box sx={{ backgroundColor: "white", borderRadius: 2, boxShadow: 2, maxWidth: 800, width: "100%", overflow: "hidden" }}>
          <Box sx={{ height: 80, background: "linear-gradient(to right, #dbeafe, #fff7ed)" }} />

          <Box sx={{ p: 3 }}>
            {errorText && <Alert severity="error" sx={{ mb: 2 }}>{errorText}</Alert>}

            {/* Profile header */}
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: deepPurple[300], width: 80, height: 80, fontSize: "2rem" }}>
                {(fullName[0] || "U").toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", textDecoration: "underline" }}>
                  {data?.email || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {data?.memType === 0 ? "Admin" : data?.memType === 1 ? "Officer" : "Professor"} &nbsp; Tel: {data?.phone || "—"}
                </Typography>
              </Box>
            </Box>

            {/* Year filter */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Typography color="text.primary">Start :</Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select value={startYear} onChange={(e) => setStartYear(e.target.value)} displayEmpty>
                  <MenuItem value="">Year</MenuItem>
                  {years.map(y => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
                </Select>
              </FormControl>

              <Typography>—</Typography>

              <Typography color="text.primary">End :</Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select value={endYear} onChange={(e) => setEndYear(e.target.value)} displayEmpty>
                  <MenuItem value="">Year</MenuItem>
                  {years.map(y => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>

            {/* Publications */}
            <Box mb={3}>
              <Typography color="text.primary" mb={2} variant="h6" fontWeight="bold">
                Latest Publication
              </Typography>
              {filtered.map((p) => (
                <Typography key={p.id} mb={1} color="text.primary">
                  <MuiLink component={NextLink} href={p.link} underline="hover">
                    {p.title}
                  </MuiLink>{" "}
                  ({p.year})
                </Typography>
              ))}
              {filtered.length === 0 && <Typography color="text.secondary">No publications in the selected range.</Typography>}
            </Box>

            {/* Back / Edit (only show Edit if you want; usually only admins) */}
            <Box textAlign="right" display="flex" flexDirection="row" gap={1} justifyContent="flex-end">
              <MuiLink component={NextLink} href={"/manage/manage_user"}>
                <Button variant="contained" sx={{ bgcolor: "#002776" }}>Back</Button>
              </MuiLink>
              {/* Optional: show Edit only to admins */}
              {/* <MuiLink component={NextLink} href={`/edit_profile/${params.id}`}>
                <Button variant="contained" sx={{ bgcolor: "#dc8000ff" }}>Edit Profile</Button>
              </MuiLink> */}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
