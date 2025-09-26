// src/components/Tables/userTable.tsx

"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Button,
  Select,
  MenuItem,
  Stack,
  Pagination,
  Checkbox,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import { Link as MuiLink } from "@mui/material";
import NextLink from "next/link";

// --- Sample Data ---
const usersData = Array.from({ length: 40 }, (_, i) => ({
  firstName: `UserFirstName${i + 1}`,
  lastName: `UserLastName${i + 1}`,
  name: `UserFirstName${i + 1} UserLastName${i + 1}`,
  email: `user${i + 1}@example.com`,
  // Use a simplified role assignment
  role: i % 2 === 0 ? "Professor" : "Officer",
  avatar: "",
}));

export default function UserDashboard() {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<
    "All Roles" | "Professor" | "Officer"
  >("All Roles");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");

  const rowsPerPage = 15;

  // Calculate stats dynamically from usersData
  const totalUsers = usersData.length;
  const totalProfessors = usersData.filter(
    (user) => user.role === "Professor"
  ).length;
  const totalOfficers = usersData.filter(
    (user) => user.role === "Officer"
  ).length;

  const filteredUsers = usersData.filter((user) => {
    const roleMatch = roleFilter === "All Roles" || user.role === roleFilter;
    const firstNameMatch = user.firstName
      .toLowerCase()
      .includes(firstNameFilter.toLowerCase());
    const lastNameMatch = user.lastName
      .toLowerCase()
      .includes(lastNameFilter.toLowerCase());

    return roleMatch && firstNameMatch && lastNameMatch;
  });

  const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);

  const allSelected = selected.length === filteredUsers.length;
  const someSelected = selected.length > 0 && !allSelected;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(filteredUsers.map((u) => u.email));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (email: string) => {
    if (selected.includes(email)) {
      setSelected(selected.filter((e) => e !== email));
    } else {
      setSelected([...selected, email]);
    }
  };

  const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value);
    setPage(1);
  };

  const handleFirstNameFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFirstNameFilter(event.target.value);
    setPage(1);
  };

  const handleLastNameFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLastNameFilter(event.target.value);
    setPage(1);
  };

  const paginatedData = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box display={"flex"} justifyContent={"center"}>
      <Box sx={{ p: 3, bgcolor: "#dce6f7", minHeight: "100vh" }}>
        {/* Stats */}
        <Box display="flex" gap={2} mb={4} flexWrap="wrap">
          <Card sx={{ flex: "1 1 30%", minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {totalUsers}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontSize={12}
              >
                Total users who have signed up
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: "1 1 30%", minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6">Total Professors</Typography>
              <Typography variant="h5" fontWeight="bold" color="gray">
                {totalProfessors}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontSize={12}
              >
                Total number of users with the professor role
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: "1 1 30%", minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6">Total Officers</Typography>
              <Typography variant="h5" fontWeight="bold" color="green">
                {totalOfficers}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontSize={12}
              >
                Total number of users with the officer role
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Table Header with Filters */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <MuiLink component={NextLink} href={"/add_user"}>
            <Button variant="contained" color="success">
              Add user
            </Button>
          </MuiLink>

          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              label="First Name"
              variant="outlined"
              size="small"
              value={firstNameFilter}
              onChange={handleFirstNameFilterChange}
              sx={{ bgcolor: "white", borderRadius: 1 }}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              size="small"
              value={lastNameFilter}
              onChange={handleLastNameFilterChange}
              sx={{ bgcolor: "white", borderRadius: 1 }}
            />
            <Select
              size="small"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              sx={{ bgcolor: "white", borderRadius: 1 }}
            >
              <MenuItem value="All Roles">All Roles</MenuItem>
              <MenuItem value="Professor">Professor</MenuItem>
              <MenuItem value="Officer">Officer</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Users Table */}
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((u) => (
                    <TableRow key={u.email} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(u.email)}
                          onChange={() => handleSelectOne(u.email)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 1, bgcolor: "primary.main" }}>
                            {u.name.charAt(0)}
                          </Avatar>
                          {u.name}
                        </Box>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell align="center">
                        <IconButton>
                          <EmailIcon />
                        </IconButton>
                        <MuiLink
                          component={NextLink}
                          href={"/profile"}
                          passHref
                        >
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ mx: 1 }}
                            color="primary"
                          >
                            View
                          </Button>
                        </MuiLink>
                        <MuiLink
                          component={NextLink}
                          href={"/edit_profile"}
                          passHref
                        >
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ mx: 1 }}
                            color="warning"
                          >
                            Edit
                          </Button>
                        </MuiLink>
                        <IconButton color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
            >
              <Stack spacing={2}>
                <Pagination
                  count={pageCount}
                  page={page}
                  color="primary"
                  onChange={handleChangePage}
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}