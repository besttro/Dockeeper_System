// src/components/Tables/ManagePublicationTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Chip, Typography, Stack, TextField
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

type Status = "Public" | "Pending" | "Waiting for Edit";
type Publication = { id: number; name: string; status: Status; professor: string };

const getStatusColor = (status: Status) => {
  switch (status) {
    case "Public": return { bgcolor: "#c6f6d5", color: "#276749" };
    case "Pending": return { bgcolor: "#e2e8f0", color: "#4a5568" };
    case "Waiting for Edit": return { bgcolor: "#fed7d7", color: "#c53030" };
    default: return { bgcolor: "#e2e8f0", color: "#4a5568" };
  }
};

export default function ManagePublicationTable() {
  const [rows, setRows] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [publicationNameFilter, setPublicationNameFilter] = useState("");
  const [professorNameFilter, setProfessorNameFilter] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/staff/publications", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json().catch(() => []);
        if (Array.isArray(data)) setRows(data);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPublications = useMemo(() => {
    const nameQ = publicationNameFilter.trim().toLowerCase();
    const profQ = professorNameFilter.trim().toLowerCase();

    return rows.filter((pub) => {
      const statusMatch = filter === "All" || pub.status === filter;
      const nameMatch = !nameQ || pub.name.toLowerCase().includes(nameQ);
      const professorMatch = !profQ || pub.professor.toLowerCase().includes(profQ);
      return statusMatch && nameMatch && professorMatch;
    });
  }, [rows, filter, publicationNameFilter, professorNameFilter]);

  const getButtonColor = (buttonFilter: "All" | Status) => {
    if (filter === buttonFilter) {
      switch (buttonFilter) {
        case "Public": return { bgcolor: "#276749", color: "#fff", "&:hover": { bgcolor: "#276749" } };
        case "Pending": return { bgcolor: "#4a5568", color: "#fff", "&:hover": { bgcolor: "#4a5568" } };
        case "Waiting for Edit": return { bgcolor: "#c53030", color: "#fff", "&:hover": { bgcolor: "#c53030" } };
        case "All":
        default: return { bgcolor: "#3182ce", color: "#fff", "&:hover": { bgcolor: "#3182ce" } };
      }
    }
    return { bgcolor: "#f0f4f7", color: "#4a5568", "&:hover": { bgcolor: "#e2e8f0" } };
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#dce6f7", minHeight: "100vh", maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
        Manage Publications
      </Typography>

      {/* Status filter buttons */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setFilter("All")} sx={getButtonColor("All")}>All</Button>
        <Button variant="contained" onClick={() => setFilter("Public")} sx={getButtonColor("Public")}>Public</Button>
        <Button variant="contained" onClick={() => setFilter("Pending")} sx={getButtonColor("Pending")}>Pending</Button>
        <Button variant="contained" onClick={() => setFilter("Waiting for Edit")} sx={getButtonColor("Waiting for Edit")}>
          Waiting for Edit
        </Button>
      </Stack>

      {/* Text filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Filter by Publication Name"
          variant="outlined"
          size="small"
          value={publicationNameFilter}
          onChange={(e) => setPublicationNameFilter(e.target.value)}
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />
        <TextField
          label="Filter by Professor Name"
          variant="outlined"
          size="small"
          value={professorNameFilter}
          onChange={(e) => setProfessorNameFilter(e.target.value)}
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, border: "2px solid #3182ce" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#cce0ff" }}>
            <TableRow>
              <TableCell><Typography fontWeight={600}>Publication</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Professor</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight={600}>Status</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight={600}>Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center">Loading…</TableCell></TableRow>
            ) : filteredPublications.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No publications found.</TableCell></TableRow>
            ) : (
              filteredPublications.map((pub) => (
                <TableRow key={pub.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{pub.name}</TableCell>
                  <TableCell>{pub.professor}</TableCell>
                  <TableCell align="center">
                    <Chip label={pub.status} sx={{ ...getStatusColor(pub.status), fontWeight: 500 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      sx={{ bgcolor: "#556bf6ff", mr: 1 }}
                      endIcon={<VisibilityIcon />}
                      href={`/confirm_publication/${pub.id}`}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
