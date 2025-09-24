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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import { Link as MuiLink } from "@mui/material";
import NextLink from "next/link";

const stats = [
  {
    title: "Total users",
    value: "15,359",
    subtitle: "Total users who have signed up",
  },
  {
    title: "Pending publication",
    value: "13,421",
    subtitle: "Total number of publications pending approval",
  },
  {
    title: "Accepted publication",
    value: "11,192",
    subtitle: "Total number of publication that have been accepted",
  },
];

const usersData = Array.from({ length: 40 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 2 === 0 ? "Professor" : "Officer",
  avatar: "",
}));

export default function UserDashboard() {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<
    "All Roles" | "Professor" | "Officer"
  >("All Roles");

  const rowsPerPage = 15;

  const filteredUsers =
    roleFilter === "All Roles"
      ? usersData
      : usersData.filter((user) => user.role === roleFilter);

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
    setPage(1); // Reset to the first page when the filter changes
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
              <Typography variant="h6">Total users</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                15,396
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
              <Typography variant="h6">Pending Publication</Typography>
              <Typography variant="h5" fontWeight="bold" color="gray">
                15,396
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontSize={12}
              >
                Total number of publications pending approval
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: "1 1 30%", minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6">Accepted Publication</Typography>
              <Typography variant="h5" fontWeight="bold" color="green">
                15,396
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontSize={12}
              >
                Total number of publication that have been accepted
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Table Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <MuiLink component={NextLink} href={"/add_user"}>
            <Button variant="contained" color="success">
              Add user
            </Button>
          </MuiLink>

          <Select
            size="small"
            value={roleFilter}
            onChange={handleRoleFilterChange}
          >
            <MenuItem value="All Roles">All Roles</MenuItem>
            <MenuItem value="Professor">Professor</MenuItem>
            <MenuItem value="Officer">Officer</MenuItem>
          </Select>
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
                        <MuiLink component={NextLink} href={"/profile"} passHref>
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
