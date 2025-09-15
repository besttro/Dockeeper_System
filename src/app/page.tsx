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
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function HomePage() {
  const [search, setSearch] = useState("");

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#dce6f7">
      {/* Sidebar */}
      <Box
        width={250}
        bgcolor="#b9c9f2"
        display="flex"
        flexDirection="column"
        alignItems="center"
        py={4}
        gap={3}
      >
        {/* Logo + Title */}
        <Box display="flex" flexDirection="row" alignItems="center">
          <img src="/psulogo.png" alt="Logo" width={60} height={60} />
          <Box display="flex" flexDirection="column">
            <Typography variant="h6" fontWeight="bold" color="primary.dark">
              DOC
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary.dark">
              KEEPER
            </Typography>
          </Box>
        </Box>

        {/* Filter Boxes */}
        <Paper
          sx={{
            width: "80%",
            borderRadius: 2,
            overflow: "hidden",
            textAlign: "center",
          }}
          elevation={2}
        >
          <Box bgcolor="#7b9de0" py={0.5}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="white"
            >
              Publication Date
            </Typography>
          </Box>
          <Box height={80} />
        </Paper>

        <Paper
          sx={{
            width: "80%",
            borderRadius: 2,
            overflow: "hidden",
            textAlign: "center",
          }}
          elevation={2}
        >
          <Box bgcolor="#7b9de0" py={0.5}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="white"
            >
              Descriptor
            </Typography>
          </Box>
          <Box height={100} />
        </Paper>

        <Paper
          sx={{
            width: "80%",
            borderRadius: 2,
            overflow: "hidden",
            textAlign: "center",
          }}
          elevation={2}
        >
          <Box bgcolor="#7b9de0" py={0.5}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="white"
            >
              Source
            </Typography>
          </Box>
          <Box height={100} />
        </Paper>
      </Box>

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
          <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: "pointer" }}>
            <IconButton size="small">
              <FilterListIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="primary.dark">
              Filter Option
            </Typography>
          </Box>
        </Box>
        <h1>Reserach Area</h1>
      </Box>
    </Box>
  );
}