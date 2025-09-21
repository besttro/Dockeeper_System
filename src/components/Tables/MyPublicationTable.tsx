"use client";

import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

type Publication = {
  id: number;
  name: string;
  status: "Public" | "Pending" | "Waiting for Edit";
};

const publications: Publication[] = [
  { id: 1, name: "Example01document", status: "Public" },
  { id: 2, name: "Example02document", status: "Pending" },
  { id: 3, name: "Example03document", status: "Waiting for Edit" },
];

const getStatusColor = (status: Publication["status"]) => {
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
  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#dce6f7",
        minHeight: "100vh",
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
      >
        My Publications
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, border: "2px solid #3182ce" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#cce0ff" }}>
            <TableRow>
              <TableCell>
                <Typography fontWeight={600}>Publication</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography fontWeight={600}>Status</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography fontWeight={600}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {publications.map((pub) => (
              <TableRow
                key={pub.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{pub.name}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={pub.status}
                    sx={{ ...getStatusColor(pub.status), fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    sx={{ bgcolor: "#f6ad55", mr: 1 }}
                    endIcon={<EditIcon />}
                    href="/update_publication"
                  >
                    Update
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: "#f56565" }}
                    endIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
