"use client";

import React, { useEffect, useState } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

type Status = "Public" | "Pending" | "Waiting for Edit";
type Row = { id: number; name: string; status: Status; year: number };

const getStatusColor = (status: Status) => {
  switch (status) {
    case "Public":
      return { bgcolor: "#c6f6d5", color: "#276749" };
    case "Pending":
      return { bgcolor: "#e2e8f0", color: "#4a5568" };
    case "Waiting for Edit":
      return { bgcolor: "#fed7d7", color: "#c53030" };
    default:
      return { bgcolor: "#e2e8f0", color: "#4a5568" };
  }
};

export default function MyPublicationTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const res = await fetch("/api/my-publications", {
          // ensures cookies (session) are sent in some environments
          credentials: "include",
        });

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
  }, []); // ← no dependency on userId anymore

  return (
    <Box sx={{ p: 4, bgcolor: "#dce6f7", minHeight: "100vh", maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
        My Publications
      </Typography>

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
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No publications yet.</TableCell></TableRow>
            ) : (
              rows.map((pub) => (
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
                      // onClick={() => handleDelete(pub.id)}
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


