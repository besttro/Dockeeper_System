import React from "react";
import { Box, Typography, Button, Link } from "@mui/material";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ListItemIcon } from "@mui/material";
import { Person, Logout } from "@mui/icons-material";
import NextLink from "next/link";
import { Link as MuiLink } from "@mui/material";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    console.log("Go to profile");
    handleClose();
  };

  const handleLogout = () => {
    console.log("Logout");
    handleClose();
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
      {/* ซ้าย: Logo */}
      <NextLink href={"/index"}>
        <Box display="flex" flexDirection="row" alignItems="center">
          <img src="/psu_logo.png" alt="Logo" width={48} height={80} />
          <Box display="flex" flexDirection="column" ml={2} lineHeight={1}>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="primary.dark"
              sx={{ lineHeight: 1 }}
            >
              DOC
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="primary.dark"
              sx={{ lineHeight: 1, mt: -0.5 }}
            >
              KEEPER
            </Typography>
          </Box>
        </Box>
      </NextLink>

      {/* กลาง: เมนู */}
      <Box display="flex" alignItems="center" gap={4}>
        <MuiLink
          component={NextLink}
          href="/my_publication"
          underline="hover"
          color="primary.dark"
          fontSize={14}
        >
          My Publications
        </MuiLink>
        <MuiLink
          component={NextLink}
          href="/add_publication"
          underline="hover"
          color="primary.dark"
          fontSize={14}
        >
          Add Publication
        </MuiLink>
        <MuiLink
          component={NextLink}
          href="/manage_publication"
          underline="hover"
          color="primary.dark"
          fontSize={14}
        >
          Confirm Publication
        </MuiLink>
        <MuiLink
          component={NextLink}
          href="/manage/manage_user"
          underline="hover"
          color="primary.dark"
          fontSize={14}
        >
          User Management
        </MuiLink>
        <MuiLink
          component={NextLink}
          href="/add_user"
          underline="hover"
          color="primary.dark"
          fontSize={14}
        >
          Add User
        </MuiLink>
        <MuiLink
          component={NextLink}
          href="#"
          underline="hover"
          color="primary.dark"
          fontSize={14}
        >
          Audit Log
        </MuiLink>
        <MuiLink
          component={NextLink}
          href="#"
          underline="hover"
          color="primary.dark"
          fontSize={14}
        >
          User Manual
        </MuiLink>
      </Box>

      {/* ขวา: User Manual + Login */}
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
          component={Link}
          href="/login"
        >
          Log in
        </Button>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            alt="Remy Sharp"
            src="/static/images/avatar/1.jpg"
            onClick={handleOpen}
            sx={{ cursor: "pointer" }}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <MuiLink
              component={NextLink}
              href="/edit_profile"
              underline="none"
              color="primary.dark"
              fontSize={14}
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
            </MuiLink>
            <MuiLink
              component={NextLink}
              href="#"
              underline="none"
              color="primary.dark"
              fontSize={14}
            >
              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#ffe6e6" } }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <Typography variant="body2" color="error">
                  Logout
                </Typography>
              </MenuItem>
            </MuiLink>
          </Menu>
          {/* ตัวอย่างชื่อผู้ใช้ เช็ค session */}
          <Box display="flex" flexDirection="column" lineHeight={1}>
            <Typography fontWeight="bold" fontSize={16} color="text.primary">
              Remy Sharp
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              remy.sharp@gmail.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
