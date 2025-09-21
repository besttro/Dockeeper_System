import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Link, Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { Person, Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) return;

    fetch(`/api/profile?email=${storedEmail}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setFname(data.fname);
          setLname(data.lname);
          setEmail(data.email);
        }
      })
      .catch((err) => console.error("Failed to load profile:", err));
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    router.push("/profile"); // go to profile page
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    handleClose();
    setFname("");
    setLname("");
    setEmail("");
    router.push("/");
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
      

    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
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
    </Link>


      {/* กลาง: เมนู */}
      <Box display="flex" alignItems="center" gap={4}>
        <Link href="my_publication" underline="hover" color="primary.dark" fontSize={14}>My Publications</Link>
        <Link href="add_publication" underline="hover" color="primary.dark" fontSize={14}>Add Publication</Link>
        <Link href="#" underline="hover" color="primary.dark" fontSize={14}>Review Publication</Link>
        <Link href="#" underline="hover" color="primary.dark" fontSize={14}>Confirm Publication</Link>
        <Link href="#" underline="hover" color="primary.dark" fontSize={14}>User Management</Link>
        <Link href="#" underline="hover" color="primary.dark" fontSize={14}>Add User</Link>
        <Link href="#" underline="hover" color="primary.dark" fontSize={14}>Audit Log</Link>
        <Link href="#" underline="hover" color="primary.dark" fontSize={14}>User Manual</Link>
      </Box>

      {/* ขวา: User Info or Login */}
      <Box display="flex" alignItems="center" gap={2}>
        {!email ? (
          <Button
            variant="contained"
            sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
            component={Link}
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
              <MenuItem onClick={handleProfile} sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#f0f4ff" } }}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>

              <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#ffe6e6" } }}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <Typography variant="body2" color="error">Logout</Typography>
              </MenuItem>
            </Menu>

            {/* User Info */}
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
