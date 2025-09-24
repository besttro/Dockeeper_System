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
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slide,
  Drawer,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close"; // Icon สำหรับปิด Drawer
import Slidebar from "@/components/Navigator/Slidebar";

// Mockup Data
const MOCK_PUBLICATIONS = [
  {
    id: 1,
    title: "A New Approach to Quantum Computing",
    authors: "Alice Johnson, Bob Williams",
    date: "2023",
    summary:
      "This paper explores novel algorithms for quantum computing, focusing on efficiency and error correction.",
    type: "journal",
  },
  {
    id: 2,
    title: "The Impact of AI on Modern Education",
    authors: "Charlie Davis",
    date: "2022",
    summary:
      "A comprehensive study on how artificial intelligence is shaping pedagogical methods and learning outcomes.",
    type: "conference",
  },
  {
    id: 3,
    title: "Sustainable Urban Planning for Smart Cities",
    authors: "Diana Evans, Frank Green",
    date: "2023",
    summary:
      "Investigating the role of technology in creating more sustainable and livable urban environments.",
    type: "journal",
  },
  {
    id: 4,
    title: "Deep Learning for Medical Diagnosis",
    authors: "George Harris",
    date: "2021",
    summary:
      "This thesis presents a deep neural network model for early detection of specific medical conditions.",
    type: "thesis",
  },
  {
    id: 5,
    title: "Blockchain Technology in Supply Chain Management",
    authors: "Irene King",
    date: "2024",
    summary:
      "An analysis of how blockchain can enhance transparency and security in global supply chains.",
    type: "conference",
  },
];

type Publication = {
  id: number;
  title: string;
  authors: string;
  date: string;
  summary: string;
  type: string;
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterAuthors, setFilterAuthors] = useState("");
  const [filterStartYear, setFilterStartYear] = useState("");
  const [filterEndYear, setFilterEndYear] = useState("");
  const [filterPubType, setFilterPubType] = useState("all");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
    setPublications(MOCK_PUBLICATIONS);
  }, []);

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const filteredPublications = publications.filter((pub) => {
    const pubYear = parseInt(pub.date);
    const startYear = filterStartYear ? parseInt(filterStartYear) : 0;
    const endYear = filterEndYear ? parseInt(filterEndYear) : 9999;

    const authorsMatch = pub.authors
      .toLowerCase()
      .includes(filterAuthors.toLowerCase());
    const yearMatch = pubYear >= startYear && pubYear <= endYear;
    const typeMatch = filterPubType === "all" || pub.type === filterPubType;
    const searchMatch =
      pub.title.toLowerCase().includes(search.toLowerCase()) ||
      pub.authors.toLowerCase().includes(search.toLowerCase()) ||
      pub.summary.toLowerCase().includes(search.toLowerCase());

    return authorsMatch && yearMatch && typeMatch && searchMatch;
  });

  const publicationTypes = [
    { value: "all", label: "All Types" },
    { value: "journal", label: "Journal" },
    { value: "conference", label: "Conference" },
    { value: "thesis", label: "Thesis" },
  ];

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
          onChange={(e) => setFilterPubType(e.target.value as string)}
        >
          {publicationTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
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
          <Link href="#" underline="hover" color="primary.dark" fontSize={14}>
            User Manual
          </Link>
          {userEmail ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" color="primary.dark">
                {userEmail}
              </Typography>
              <IconButton href="/profile">
                <Avatar sx={{ bgcolor: "#7b9de0" }}>
                  {userEmail[0].toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
              component={Link}
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