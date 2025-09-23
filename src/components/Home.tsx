"use client";

import { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, IconButton, Link, Avatar,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Slidebar from "@/components/Navigator/Slidebar";

type Publication = {
  id: number;
  title: string;
  authors: string;
  date: string;
  summary: string;
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // fetch session user
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const j = await res.json().catch(() => ({}));
        if (j?.loggedIn) setUserEmail(j.email ?? null);
        else setUserEmail(null);
      } catch {
        setUserEmail(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/publication", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          console.warn("Failed /api/publication", res.status);
          setPublications([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) setPublications(data);
        else setPublications([]);
      } catch (err) {
        console.error("Error fetching publications", err);
        setPublications([]);
      }
    })();
  }, []);


  return (
    <Box display="flex" minHeight="100vh" bgcolor="#dce6f7">
      {/* Sidebar */}
      <Slidebar />

      {/* Main Content */}
      <Box flex={1} p={4} position="relative">
        {/* Top Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Link href="#" underline="hover" color="primary.dark" fontSize={14}>
            User Manual
          </Link>

          {loadingUser ? null : userEmail ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" color="primary.dark">
                {userEmail}
              </Typography>
              <IconButton href="/profile">
                <Avatar sx={{ bgcolor: "#7b9de0" }}>
                  {userEmail[0]?.toUpperCase() ?? "U"}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
              component={Link as any}
              href="/login"
            >
              Log in
            </Button>
          )}
        </Box>

        {/* Search Section */}
        <Box mt={6} display="flex" alignItems="center" marginLeft={5} gap={2}>
          <TextField
            variant="outlined"
            placeholder="Search Education Resources"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 400, bgcolor: "white", borderRadius: 1 }}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
          >
            Search
          </Button>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: "pointer" }}>
            <IconButton size="small">
              <FilterListIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="primary.dark">Filter Option</Typography>
          </Box>
        </Box>

        {/* Publication List */}
        <Box mt={6} ml={5} display="flex" flexDirection="column" gap={3}>
          {publications.map((pub) => (
            <Box key={pub.id} sx={{ p: 2 }}>
              <Typography
                component={Link}
                variant="h6"
                fontWeight="bold"
                color="primary.dark"
                href={`/pub_details?id=${pub.id}`}
                underline="always"
              >
                {pub.title}
              </Typography>
              <Typography variant="subtitle2" color="success.main">
                Authors: {pub.authors}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Summary: {pub.summary}
              </Typography>
              <Typography variant="subtitle2" color="#A5A6A7" mt={1}>
                Publication Year: {pub.date}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
