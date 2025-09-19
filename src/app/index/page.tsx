"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Slidebar from "@/components/Slidebar";

export default function HomePage() {
  const [search, setSearch] = useState("");

  //mock data publication
  const publications = [
    {
      id: 1,
      title: "Research on AI in Education",
      authors: "John Doe, Jane Smith",
      date: "2023-08-15",
      summary:
        "This paper explores the applications of artificial intelligence in enhancing learning experiences and personalized education.",
    },
    {
      id: 2,
      title: "Advances in Online Learning Platforms",
      authors: "Alice Johnson, Bob Lee",
      date: "2023-06-30",
      summary:
        "The study discusses the latest technologies improving online learning platforms and their impact on student engagement.",
    },
  ];

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
          <Button
            variant="contained"
            sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
            component={Link}
            href="/login"
          >
            Log in
          </Button>
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
          {publications.map((pub) => (
            <Box
              key={pub.id}
              sx={{
                p: 2,
              }}
            >
              <Typography
                component={Link}
                variant="h6"
                fontWeight="bold"
                color="primary.dark"
                href="/pub_details?id='#'"
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
                Publication Date: {pub.date}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
