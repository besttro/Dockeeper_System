"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Link,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import Slidebar from "@/components/Navigator/Sidebar";

type Publication = {
  id: number;
  title: string;
  authors: string;
  date: string;
  summary: string;
  type: "journal" | "international" | "unknown";
};

type UserInfo = {
  email: string;
  memType: number; // 0=admin, 1=officer, 2=professor
};

export default function HomeContent() {
  const [search, setSearch] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  // const [userEmail, setUserEmail] = useState<string | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterAuthors, setFilterAuthors] = useState("");
  const [filterStartYear, setFilterStartYear] = useState("");
  const [filterEndYear, setFilterEndYear] = useState("");
  const [filterPubType, setFilterPubType] = useState<
    "all" | Publication["type"]
  >("all");

  // session email from cookie-backed API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));

        if (data?.loggedIn && data.email && data.memType !== undefined) {
          setUserInfo({ email: data.email, memType: data.memType });
        } else {
          setUserInfo(null);
        }
      } catch {
        setUserInfo(null);
      }
    })();
  }, []);

  // load publications from backend
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
        if (Array.isArray(data)) {
          // Expecting: [{ id, title, authors, date, summary, type }]
          setPublications(data as Publication[]);
        } else {
          setPublications([]);
        }
      } catch (err) {
        console.error("Error fetching publications", err);
        setPublications([]);
      }
    })();
  }, []);

  const handleFilterToggle = () => setIsFilterOpen((s) => !s);

  const filteredPublications = publications.filter((pub) => {
    const pubYear = parseInt(pub.date);
    const startYear = filterStartYear ? parseInt(filterStartYear) : 0;
    const endYear = filterEndYear ? parseInt(filterEndYear) : 9999;

    const authorsMatch = pub.authors
      .toLowerCase()
      .includes(filterAuthors.toLowerCase());
    const yearMatch = pubYear >= startYear && pubYear <= endYear;

    // If UI filters to a specific type, only match records with a known type.
    const typeMatch =
      filterPubType === "all" ||
      (pub.type !== "unknown" && pub.type === filterPubType);

    const searchNorm = search.toLowerCase();
    const searchMatch =
      pub.title.toLowerCase().includes(searchNorm) ||
      pub.authors.toLowerCase().includes(searchNorm) ||
      pub.summary.toLowerCase().includes(searchNorm);

    return authorsMatch && yearMatch && typeMatch && searchMatch;
  });

  const publicationTypes: Array<{
    value: "all" | Publication["type"];
    label: string;
  }> = [
    { value: "all", label: "All Types" },
    { value: "journal", label: "Journal" },
    { value: "international", label: "International" },
  ];

  let userManualHref = "#";
  const s3BaseUrl = process.env.NEXT_PUBLIC_S3_MANUALS_BASE_URL;

  if (userInfo && s3BaseUrl) {
    switch (userInfo.memType) {
      case 0: // admin
        userManualHref = `${s3BaseUrl}/admin_manual.pdf`;
        break;
      case 1: // officer
        userManualHref = `${s3BaseUrl}/officer_manual.pdf`;
        break;
      case 2: // professor
        userManualHref = `${s3BaseUrl}/professor_manual.pdf`;
        break;
      default:
        userManualHref = "#"; // สำหรับ role อื่นๆ ที่ไม่มี manual
    }
  }

  const filterContent = (
    <Box
      sx={{
        width: 300,
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Filter Options</Typography>
        <IconButton onClick={handleFilterToggle}>
          <CloseIcon />
        </IconButton>
      </Box>

      <TextField
        label="Author Name"
        variant="outlined"
        value={filterAuthors}
        onChange={(e) => setFilterAuthors(e.target.value)}
        size="small"
      />
      <TextField
        label="Start Year"
        variant="outlined"
        type="number"
        value={filterStartYear}
        onChange={(e) => setFilterStartYear(e.target.value)}
        size="small"
      />
      <TextField
        label="End Year"
        variant="outlined"
        type="number"
        value={filterEndYear}
        onChange={(e) => setFilterEndYear(e.target.value)}
        size="small"
      />
      <FormControl sx={{ minWidth: 150 }} size="small">
        <InputLabel id="pub-type-label">Publication Type</InputLabel>
        <Select
          labelId="pub-type-label"
          id="pub-type"
          value={filterPubType}
          label="Publication Type"
          onChange={(e) => setFilterPubType(e.target.value as any)}
        >
          {publicationTypes.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#dce6f7">
      {/* Sidebar */}
      <Slidebar />

      {/* Main Content */}
      <Box flex={1} p={4} position="relative">
        {/* Top Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Link
            href={userManualHref}
            underline="hover"
            color="primary.dark"
            fontSize={14}
            target="_blank"
            rel="noopener noreferrer"
          >
            User Manual
          </Link>
          {userInfo ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" color="primary.dark">
                {userInfo.email}
              </Typography>
              <IconButton href="/profile">
                <Avatar sx={{ bgcolor: "#7b9de0" }}>
                  {userInfo.email[0]?.toUpperCase() ?? "U"}
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
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            sx={{ cursor: "pointer" }}
            onClick={handleFilterToggle}
          >
            <IconButton size="small">
              <FilterListIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="primary.dark">
              Filter Option
            </Typography>
          </Box>
        </Box>

        {/* Publication List */}
        <Box mt={6} ml={5} display="flex" flexDirection="column" gap={3}>
          {filteredPublications.length > 0 ? (
            filteredPublications.map((pub) => (
              <Box key={pub.id} sx={{ p: 2 }}>
                <Typography
                  component={Link}
                  variant="h6"
                  fontWeight="bold"
                  color="primary.dark"
                  href={`/publication/${pub.id}`}
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
                  Publication Year: {pub.date} • Type: {pub.type}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 5 }}>
              No publications found matching your criteria.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isFilterOpen}
        onClose={handleFilterToggle}
        variant="temporary"
      >
        {filterContent}
      </Drawer>
    </Box>
  );
}
