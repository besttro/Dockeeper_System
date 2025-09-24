"use client";

import React, { useState } from "react";
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
  Stack,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

type Publication = {
  id: number;
  name: string;
  status: "Public" | "Pending" | "Waiting for Edit";
  professor: string;
};

const allPublications: Publication[] = [
  { id: 1, name: "Example01document", status: "Public", professor: "Dr. Smith" },
  { id: 2, name: "Example02document", status: "Pending", professor: "Dr. Jones" },
  { id: 3, name: "Example03document", status: "Waiting for Edit", professor: "Dr. Brown" },
  { id: 4, name: "Example04document", status: "Public", professor: "Dr. Smith" },
  { id: 5, name: "Example05document", status: "Pending", professor: "Dr. Davis" },
  { id: 6, name: "Example06document", status: "Public", professor: "Dr. Miller" },
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

export default function ManagePublicationTable() {
  const [filter, setFilter] = useState<"All" | Publication["status"]>("All");
  const [publicationNameFilter, setPublicationNameFilter] = useState("");
  const [professorNameFilter, setProfessorNameFilter] = useState("");

  const filteredPublications = allPublications.filter((pub) => {
    const statusMatch = filter === "All" || pub.status === filter;
    const nameMatch = pub.name
      .toLowerCase()
      .includes(publicationNameFilter.toLowerCase());
    const professorMatch = pub.professor
      .toLowerCase()
      .includes(professorNameFilter.toLowerCase());

    return statusMatch && nameMatch && professorMatch;
  });

  const getButtonColor = (buttonFilter: "All" | Publication["status"]) => {
    if (filter === buttonFilter) {
      switch (buttonFilter) {
        case "Public":
          return {
            bgcolor: "#276749",
            color: "#fff",
            "&:hover": { bgcolor: "#276749" },
          };
        case "Pending":
          return {
            bgcolor: "#4a5568",
            color: "#fff",
            "&:hover": { bgcolor: "#4a5568" },
          };
        case "Waiting for Edit":
          return {
            bgcolor: "#c53030",
            color: "#fff",
            "&:hover": { bgcolor: "#c53030" },
          };
        case "All":
        default:
          return {
            bgcolor: "#3182ce",
            color: "#fff",
            "&:hover": { bgcolor: "#3182ce" },
          };
      }
    } else {
      return {
        bgcolor: "#f0f4f7",
        color: "#4a5568",
        "&:hover": { bgcolor: "#e2e8f0" },
      };
    }
  };

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
        Manage Publications
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setFilter("All")}
          sx={getButtonColor("All")}
        >
          All
        </Button>
        <Button
          variant="contained"
          onClick={() => setFilter("Public")}
          sx={getButtonColor("Public")}
        >
          Public
        </Button>
        <Button
          variant="contained"
          onClick={() => setFilter("Pending")}
          sx={getButtonColor("Pending")}
        >
          Pending
        </Button>
        <Button
          variant="contained"
          onClick={() => setFilter("Waiting for Edit")}
          sx={getButtonColor("Waiting for Edit")}
        >
          Waiting for Edit
        </Button>
      </Stack>

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
              <TableCell>
                <Typography fontWeight={600}>Professor</Typography>
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
            {filteredPublications.map((pub) => (
              <TableRow
                key={pub.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{pub.name}</TableCell>
                <TableCell>{pub.professor}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={pub.status}
                    sx={{ ...getStatusColor(pub.status), fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    sx={{ bgcolor: "#556bf6ff", mr: 1 }}
                    endIcon={<VisibilityIcon />}
                    href="/review_publication"
                  >
                    review
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