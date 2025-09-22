"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Link as MUILink, Avatar,
  Menu, MenuItem, ListItemIcon
} from "@mui/material";
import { Person, Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";
// If you want client-side navigation with <Link>, you can:
// import NextLink from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (data?.loggedIn) {
          setFname(data.fname || "");
          setLname(data.lname || "");
          setEmail(data.email || "");
        } else {
          setFname("");
          setLname("");
          setEmail("");
        }
      } catch (e) {
        setFname("");
        setLname("");
        setEmail("");
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    router.push("/profile");
    handleClose();
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        // Optional: show a toast/snackbar here
        console.error("Logout failed");
      }
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      // Clear local UI state no matter what
      setFname("");
      setLname("");
      setEmail("");
      handleClose();
      setLoggingOut(false);
      // Navigate & refresh so anything relying on the session updates
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      px={4}
      py={2}
      bgcolor="#b9c9f2"
    >
      {/* Left: Logo (click → home) */}
      {/* If you want Next.js Link: replace MUILink with <NextLink href="/" passHref> */}
      <MUILink href="/" style={{ textDecoration: "none", color: "inherit" }}>
        <Box display="flex" flexDirection="row" alignItems="center" sx={{ cursor: "pointer" }}>
          <img src="/psu_logo.png" alt="Logo" width={48} height={80} />
          <Box display="flex" flexDirection="column" ml={2} lineHeight={1}>
            <Typography variant="h5" fontWeight="bold" color="primary.dark" sx={{ lineHeight: 1 }}>
              DOC
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.dark" sx={{ lineHeight: 1, mt: -0.5 }}>
              KEEPER
            </Typography>
          </Box>
        </Box>
      </MUILink>

      {/* Center: Menu */}
      <Box display="flex" alignItems="center" gap={4}>
        <MUILink href="/my_publication" underline="hover" color="primary.dark" fontSize={14}>
          My Publications
        </MUILink>
        <MUILink href="/add_publication" underline="hover" color="primary.dark" fontSize={14}>
          Add Publication
        </MUILink>
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          Review Publication
        </MUILink>
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          Confirm Publication
        </MUILink>
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          User Management
        </MUILink>
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          Add User
        </MUILink>
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          Audit Log
        </MUILink>
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          User Manual
        </MUILink>
      </Box>

      {/* Right: User or Login */}
      <Box display="flex" alignItems="center" gap={2}>
        {loadingUser ? null : !email ? (
          <Button
            variant="contained"
            sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
            component={MUILink as any}
            href="/login"
          >
            Log in
          </Button>
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: "#7b9de0", cursor: "pointer" }} onClick={handleOpen}>
              {fname ? fname[0].toUpperCase() : "U"}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <MenuItem
                onClick={handleProfile}
                sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#f0f4ff" } }}
              >
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>

              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#ffe6e6" } }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <Typography variant="body2" color="error">Logout</Typography>
              </MenuItem>
            </Menu>

            <Box display="flex" flexDirection="column" lineHeight={1}>
              <Typography fontWeight="bold" fontSize={16} color="text.primary">
                {fname} {lname}
              </Typography>
              <Typography fontSize={12} color="text.secondary">
                {email}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

