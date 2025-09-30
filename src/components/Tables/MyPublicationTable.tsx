// src/components/Tables/MyPublicationTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, Typography, Stack, TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

type Status = "Public" | "Pending" | "Waiting for Edit";
type Row = { id: number; name: string; status: Status; year: number };

const getStatusColor = (status: Status) => {
  switch (status) {
    case "Public": return { bgcolor: "#c6f6d5", color: "#276749" };
    case "Pending": return { bgcolor: "#e2e8f0", color: "#4a5568" };
    case "Waiting for Edit": return { bgcolor: "#fed7d7", color: "#c53030" };
    default: return { bgcolor: "#e2e8f0", color: "#4a5568" };
  }
};

export default function MyPublicationTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // filters
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [titleQuery, setTitleQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const res = await fetch("/api/my-publications", { credentials: "include" });
        if (res.status === 401) {
          setRows([]);
          setErrorText("Please log in to view your publications.");
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? "Failed to load publications");
        }
        const data: Row[] = await res.json();
        setRows(data);
      } catch (e: any) {
        console.error(e);
        setErrorText(e?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredRows = useMemo(() => {
    const q = titleQuery.trim().toLowerCase();
    return rows.filter((r) => {
      const statusOk = filter === "All" || r.status === filter;
      const titleOk = !q || r.name.toLowerCase().includes(q);
      return statusOk && titleOk;
    });
  }, [rows, filter, titleQuery]);

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

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Delete this publication? This cannot be undone.");
    if (!ok) return;
    try {
      const res = await fetch(`/api/publication/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Delete failed");
      setRows((prev) => prev.filter((r) => r.id !== id));
      alert("Deleted.");
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#dce6f7", minHeight: "100vh", maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
        My Publications
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setFilter("All")} sx={getButtonColor("All")}>All</Button>
          <Button variant="contained" onClick={() => setFilter("Public")} sx={getButtonColor("Public")}>Public</Button>
          <Button variant="contained" onClick={() => setFilter("Pending")} sx={getButtonColor("Pending")}>Pending</Button>
          <Button variant="contained" onClick={() => setFilter("Waiting for Edit")} sx={getButtonColor("Waiting for Edit")}>
            Waiting for Edit
          </Button>
        </Stack>
        <TextField
          size="small"
          placeholder="Filter by title…"
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
          sx={{ bgcolor: "white", borderRadius: 1, minWidth: 220 }}
        />
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, border: "2px solid #3182ce" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#cce0ff" }}>
            <TableRow>
              <TableCell><Typography fontWeight={600}>Publication</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight={600}>Year</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight={600}>Status</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight={600}>Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center">Loading…</TableCell></TableRow>
            ) : errorText ? (
              <TableRow><TableCell colSpan={4} align="center">{errorText}</TableCell></TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No publications found.</TableCell></TableRow>
            ) : (
              filteredRows.map((pub) => (
                <TableRow key={pub.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{pub.name}</TableCell>
                  <TableCell align="center">{pub.year}</TableCell>
                  <TableCell align="center">
                    <Chip label={pub.status} sx={{ ...getStatusColor(pub.status), fontWeight: 500 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      sx={{ bgcolor: "#f6ad55", mr: 1 }}
                      endIcon={<EditIcon />}
                      href={`/publications/${pub.id}/edit`}
                    >
                      Update
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ bgcolor: "#f56565" }}
                      endIcon={<DeleteIcon />}
                      onClick={() => handleDelete(pub.id)}
                    >
                      Delete
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




