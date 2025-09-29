// src/components/Forms/Profile.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Link,
  Select,
  MenuItem,
  FormControl,
  Button,
  Avatar,
  Stack,
  Paper,
  Alert,
} from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import NextLink from "next/link";
import { Link as MuiLink } from "@mui/material";

type PubRow = { id: number; title: string; year: number; link?: string };

export default function ProfileDashboard() {
  // who am I (to know memType/role)
  const [memType, setMemType] = useState<0 | 1 | 2 | null>(null);

  // profile state
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState(""); // mem_phone
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // publications state (only for professors)
  const [publications, setPublications] = useState<PubRow[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(true);
  const [pubsError, setPubsError] = useState<string | null>(null);

  // filters
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");

  const roleLabel =
    memType === 0 ? "Admin" :
      memType === 1 ? "Staff" :
        memType === 2 ? "Professor" : "—";


  // 0) Load /api/me to determine memType
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        const j = await res.json().catch(() => ({}));
        if (j?.loggedIn) {
          // support both memType (camel) and mem_type (snake)
          setMemType((j.memType ?? j.mem_type) ?? null);
        } else {
          setMemType(null);
        }
      } catch {
        setMemType(null);
      }
    })();
  }, []);

  // 1) Load profile (from session)
  useEffect(() => {
    (async () => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (res.status === 401) {
          setProfileError("Please log in to view your profile.");
          return;
        }
        const data = await res.json();
        setEmail(data?.email ?? "");
        setFname(data?.fname ?? "");
        setLname(data?.lname ?? "");
        setTel(data?.phone ?? "");
      } catch {
        setProfileError("Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // 2) Load authored + public publications (ONLY if professor)
  useEffect(() => {
    if (memType !== 2) {
      // not professor → don't fetch / don't show
      setPublications([]);
      setLoadingPubs(false);
      setPubsError(null);
      return;
    }

    (async () => {
      setLoadingPubs(true);
      setPubsError(null);
      try {
        const res = await fetch("/api/profile/publications", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? `Failed: ${res.status}`);
        }
        const data = (await res.json()) as Array<{ id: number; title: string; year: number }>;
        const sorted = [...data].sort((a, b) => b.year - a.year);
        setPublications(sorted);
      } catch (e: any) {
        setPubsError(e?.message ?? "Failed to load publications.");
        setPublications([]);
      } finally {
        setLoadingPubs(false);
      }
    })();
  }, [memType]);

  // unique years for dropdown
  const allYears = useMemo(() => {
    const s = new Set<number>();
    publications.forEach((p) => s.add(p.year));
    return Array.from(s).sort((a, b) => b - a);
  }, [publications]);

  // filter publications by year range
  const filteredPublications = useMemo(() => {
    const startNum = startYear ? parseInt(startYear) : undefined;
    const endNum = endYear ? parseInt(endYear) : undefined;
    return publications.filter((p) => {
      if (startNum !== undefined && p.year < startNum) return false;
      if (endNum !== undefined && p.year > endNum) return false;
      return true;
    });
  }, [publications, startYear, endYear]);

  const displayPublications = filteredPublications.slice(0, 5);

  const fullName = [fname, lname].filter(Boolean).join(" ") || "—";
  const avatarLetter = fullName.trim()[0]?.toUpperCase() ?? "U";
  const isProfessor = memType === 2;

  return (
    <Box>
      <Box
        sx={{
          p: 4,
          background: "#dce6f7",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 2,
            maxWidth: 800,
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: 80,
              background: "linear-gradient(to right, #dbeafe, #fff7ed)",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          />

          <Box sx={{ p: 3 }}>
            {/* Profile */}
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: deepPurple[300], width: 80, height: 80, fontSize: "2rem" }}>
                {avatarLetter}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {fullName}
                </Typography>

                {loadingProfile ? (
                  <Typography color="text.secondary">Loading profile…</Typography>
                ) : profileError ? (
                  <Alert severity="error" sx={{ mt: 0.5, maxWidth: 420 }}>
                    {profileError}
                  </Alert>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", textDecoration: "underline" }}
                    >
                      {email || "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tel : {tel ? `+66 ${tel}` : "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role : {roleLabel}
                    </Typography>

                  </>
                )}
              </Box>
            </Box>

            {/* Publications (only for professors) */}
            {isProfessor && (
              <>
                {/* Year Filter */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Typography color="text.primary">Start :</Typography>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select value={startYear} onChange={(e) => setStartYear(e.target.value)} displayEmpty>
                      <MenuItem value="">Year</MenuItem>
                      {allYears.map((year) => (
                        <MenuItem key={year} value={String(year)}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography>—</Typography>

                  <Typography color="text.primary">End :</Typography>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select value={endYear} onChange={(e) => setEndYear(e.target.value)} displayEmpty>
                      <MenuItem value="">Year</MenuItem>
                      {allYears.map((year) => (
                        <MenuItem key={year} value={String(year)}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {/* Publication List */}
                <Box mb={3}>
                  <Typography color="text.primary" mb={2} variant="h6" fontWeight={"bold"}>
                    Latest Publication
                  </Typography>

                  {loadingPubs ? (
                    <Typography>Loading publications…</Typography>
                  ) : pubsError ? (
                    <Alert severity="error" sx={{ maxWidth: 520 }}>
                      {pubsError}
                    </Alert>
                  ) : displayPublications.length === 0 ? (
                    <Typography color="text.secondary">No public publications found.</Typography>
                  ) : (
                    displayPublications.map((pub) => (
                      <Typography key={pub.id} mb={1} color="text.primary">
                        <Link href={`/pub_details?id=${pub.id}`} underline="hover">
                          {pub.title}
                        </Link>{" "}
                        ({pub.year})
                      </Typography>
                    ))
                  )}
                </Box>
              </>
            )}

            {/* Buttons */}
            <Box textAlign="right" display="flex" flexDirection="row" gap={1} justifyContent="flex-end">
              <MuiLink component={NextLink} href={"/"} underline="none">
                <Button variant="contained" sx={{ bgcolor: "#002776" }}>
                  Back
                </Button>
              </MuiLink>
              <MuiLink component={NextLink} href={"/profile/edit"} underline="none">
                <Button variant="contained" sx={{ bgcolor: "#dc8000ff" }}>
                  Edit Profile
                </Button>
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

