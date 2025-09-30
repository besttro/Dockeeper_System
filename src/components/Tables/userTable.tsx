// src/components/Tables/userTable.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, IconButton, Button,
  Select, MenuItem, Stack, Pagination, Checkbox, TextField, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import { Link as MuiLink } from "@mui/material";
import NextLink from "next/link";

type RoleLabel = "Professor" | "Officer" | "Admin";
type ApiUser = { id: number; fname: string; lname: string; email: string; role: RoleLabel };

export default function UserDashboard() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [roleFilter, setRoleFilter] = useState<"All Roles" | RoleLabel>("All Roles");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");

  const [viewerRole, setViewerRole] = useState<0 | 1 | 2 | null>(null); // 0 admin, 1 staff, 2 professor
  const [loadingMe, setLoadingMe] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const rowsPerPage = 15;

  // Load viewer role
  useEffect(() => {
    (async () => {
      try {
        setLoadingMe(true);
        const res = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        const j = await res.json().catch(() => ({}));
        if (j?.loggedIn) {
          const role = (j.memType ?? j.mem_type) as 0 | 1 | 2 | null;
          setViewerRole(role);
        } else {
          setViewerRole(null);
        }
      } catch {
        setViewerRole(null);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  // Fetch users whenever filters or viewerRole change
  useEffect(() => {
    // staff can only view professors, force role filter to "Professor"
    const effectiveRole = viewerRole === 1 ? ("Professor" as RoleLabel) : roleFilter;

    (async () => {
      try {
        setLoading(true);
        setErrorText(null);

        const params = new URLSearchParams();
        if (effectiveRole !== "All Roles") params.set("role", effectiveRole);
        if (firstNameFilter) params.set("first", firstNameFilter);
        if (lastNameFilter) params.set("last", lastNameFilter);

        const res = await fetch(`/api/users?${params.toString()}`, { credentials: "include" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? "Failed to load users");
        }
        const data: ApiUser[] = await res.json();
        setUsers(data);
        setSelected([]);
      } catch (e: any) {
        setErrorText(e?.message ?? "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, [roleFilter, firstNameFilter, lastNameFilter, viewerRole]);

  const totalUsers = users.length;
  const totalProfessors = users.filter((u) => u.role === "Professor").length;
  const totalOfficers = users.filter((u) => u.role === "Officer").length;

  const pageCount = Math.ceil(users.length / rowsPerPage) || 1;
  const paginatedData = useMemo(
    () => users.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [users, page]
  );

  const allSelected = selected.length === paginatedData.length && paginatedData.length > 0;
  const someSelected = selected.length > 0 && !allSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? paginatedData.map((u) => u.email) : []);
  };
  const handleSelectOne = (email: string) => {
    setSelected((prev) => (prev.includes(email) ? prev.filter((v) => v !== email) : [...prev, email]));
  };
  const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => setPage(value);

  // While we don't know the role yet, avoid flashing wrong UI
  if (loadingMe) {
    return (
      <Box display="flex" justifyContent="center">
        <Box sx={{ p: 3, bgcolor: "#dce6f7", minHeight: "100vh", width: "100%", maxWidth: 1200 }}>
          <Typography>Loading…</Typography>
        </Box>
      </Box>
    );
  }

  const isStaff = viewerRole === 1;
  // If you also want to hide the "Add User" button for staff, gate it by viewerRole here (not shown in your snippet).

  return (
    <Box display={"flex"} justifyContent={"center"}>
      <Box sx={{ p: 3, bgcolor: "#dce6f7", minHeight: "100vh", width: "100%", maxWidth: 1200 }}>
        {/* Stats */}
        <Box display="flex" gap={2} mb={4} flexWrap="wrap">
          <Card sx={{ flex: "1 1 30%", minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {totalUsers}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" fontSize={12}>
                Total users who match your filters
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: "1 1 30%", minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6">Total Professors</Typography>
              <Typography variant="h5" fontWeight="bold" color="gray">
                {totalProfessors}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" fontSize={12}>
                Users with the professor role
              </Typography>
            </CardContent>
          </Card>

          {/* Hide this card for staff */}
          {!isStaff && (
            <Card sx={{ flex: "1 1 30%", minWidth: 250 }}>
              <CardContent>
                <Typography variant="h6">Total Staff</Typography>
                <Typography variant="h5" fontWeight="bold" color="green">
                  {totalOfficers}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" fontSize={12}>
                  Users with the officer role
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Filters */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              label="First Name"
              variant="outlined"
              size="small"
              value={firstNameFilter}
              onChange={(e) => { setFirstNameFilter(e.target.value); setPage(1); }}
              sx={{ bgcolor: "white", borderRadius: 1 }}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              size="small"
              value={lastNameFilter}
              onChange={(e) => { setLastNameFilter(e.target.value); setPage(1); }}
              sx={{ bgcolor: "white", borderRadius: 1 }}
            />

            {/* Hide the Role Select for staff; force role=Professor in effect above */}
            {!isStaff && (
              <Select
                size="small"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value as any); setPage(1); }}
                sx={{ bgcolor: "white", borderRadius: 1, minWidth: 160 }}
              >
                <MenuItem value="All Roles">All Roles</MenuItem>
                <MenuItem value="Professor">Professor</MenuItem>
                <MenuItem value="Officer">Staff</MenuItem>
                {/* Add Admin if you want to filter admins too:
                <MenuItem value="Admin">Admin</MenuItem> */}
              </Select>
            )}
          </Box>
        </Box>

        {errorText && <Alert severity="error" sx={{ mb: 2 }}>{errorText}</Alert>}

        {/* Users Table */}
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow><TableCell colSpan={5}>No users</TableCell></TableRow>
                  ) : (
                    paginatedData.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(u.email)}
                            onChange={() => handleSelectOne(u.email)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 1, bgcolor: "primary.main" }}>
                              {(u.fname || u.lname ? (u.fname || u.lname)[0] : u.email[0]).toUpperCase()}
                            </Avatar>
                            {u.fname} {u.lname}
                          </Box>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell align="center">
                          <IconButton><EmailIcon /></IconButton>
                          <MuiLink component={NextLink} href={`/profile/${u.id}`} passHref>
                            <Button variant="contained" size="small" sx={{ mx: 1 }} color="primary">
                              View
                            </Button>
                          </MuiLink>
                          <MuiLink component={NextLink} href={`/edit_profile/${u.id}`} passHref>
                            <Button variant="contained" size="small" sx={{ mx: 1 }} color="warning">
                              Edit
                            </Button>
                          </MuiLink>
                          <IconButton color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <Stack spacing={2}>
                <Pagination count={pageCount} page={page} color="primary" onChange={handleChangePage} />
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
