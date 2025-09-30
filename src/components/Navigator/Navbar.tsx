// src/components/Navigator/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Box, Typography, Button, Link as MUILink, Avatar,
  Menu, MenuItem, ListItemIcon
} from "@mui/material";
import { Person, Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";

type MemType = 0 | 1 | 2 | null; // 0 admin, 1 staff, 2 professor

export default function Navbar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [memType, setMemType] = useState<MemType>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (data?.loggedIn) {
          setFname(data.fname || "");
          setLname(data.lname || "");
          setEmail(data.email || "");
          setMemType(
            Number.isInteger(data.memType) ? (data.memType as MemType) : null
          );
        } else {
          setFname(""); setLname(""); setEmail(""); setMemType(null);
        }
      } catch {
        setFname(""); setLname(""); setEmail(""); setMemType(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    router.push("/profile");
    handleClose();
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setFname(""); setLname(""); setEmail(""); setMemType(null);
    handleClose();
    setLoggingOut(false);
    router.replace("/");
    router.refresh();
  };

  // Render center links by role
  const renderCenterMenu = () => {
    if (loadingUser) return null;

    // Not logged in → no role links (you can show public links if you want)
    if (!email || memType === null || memType === undefined) {
      return (
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          User Manual
        </MUILink>
      );
    }

    // Admin (0): User Management, Add User, Audit Log
    if (memType === 0) {
      return (
        <>
          <MUILink href="/manage/manage_user" underline="hover" color="primary.dark" fontSize={14}>
            User Management
          </MUILink>
          <MUILink href="/add_user" underline="hover" color="primary.dark" fontSize={14}>
            Add User
          </MUILink>
          <MUILink href="/audit_log" underline="hover" color="primary.dark" fontSize={14}>
            Audit Log
          </MUILink>
        </>
      );
    }

    // Staff (1): Review Publication, Confirm Publication, User Management
    if (memType === 1) {
      return (
        <>
          <MUILink href="/review_publication" underline="hover" color="primary.dark" fontSize={14}>
            Review Publication
          </MUILink>
          <MUILink href="/manage/manage_user" underline="hover" color="primary.dark" fontSize={14}>
            User Management
          </MUILink>
        </>
      );
    }

    // Professor (2): My Publications, Add Publication, User Manual
    return (
      <>
        <MUILink href="/my_publication" underline="hover" color="primary.dark" fontSize={14}>
          My Publications
        </MUILink>
        <MUILink href="/add_publication" underline="hover" color="primary.dark" fontSize={14}>
          Add Publication
        </MUILink>
        <MUILink href="#" underline="hover" color="primary.dark" fontSize={14}>
          User Manual
        </MUILink>
      </>
    );
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        px: 4,
        py: 2,
        bgcolor: "#b9c9f2",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Left: Logo */}
      <MUILink href="/" sx={{ textDecoration: "none", color: "inherit" }}>
        <Box display="flex" flexDirection="row" alignItems="center" sx={{ cursor: "pointer" }}>
          <Image src="/psu_logo.png" alt="Logo" width={48} height={80} />
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

      {/* Center: Role-based links */}
      <Box display="flex" alignItems="center" gap={4}>
        {renderCenterMenu()}
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
              PaperProps={{ sx: { borderRadius: 2, minWidth: 180, boxShadow: "0px 4px 20px rgba(0,0,0,0.1)" } }}
            >
              <MenuItem onClick={handleProfile} sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#f0f4ff" } }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#ffe6e6" } }}>
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
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
