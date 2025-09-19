import React from "react";
import { Box, Typography, Button, Link } from "@mui/material";

export default function Navbar() {
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
            sx={{ lineHeight: 1, mt: -0.5 }} // ลบ margin บนให้ชิดขึ้น
          >
            KEEPER
          </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Link href="#" underline="hover" color="primary.dark" fontSize={14}>
          User Manual
        </Link>
        <Button
          variant="contained"
          sx={{ bgcolor: "#7b9de0", textTransform: "none" }}
          component={Link}
          href="/login"
        >
          Log in
        </Button>
      </Box>
    </Box>
  );
}
