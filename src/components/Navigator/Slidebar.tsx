import React, { useState } from "react";
import { Box, Typography, Paper, Link } from "@mui/material";

export default function Slidebar() {
  return (
    <Box
      width={250}
      bgcolor="#b9c9f2"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={4}
      gap={3}
    >
      {/* Logo + Title */}
      <Box display="flex" flexDirection="row" alignItems="center">
        <img src="/psu_logo.png" alt="Logo" width={60} height={60} />
        <Box display="flex" flexDirection="column" ml={1} lineHeight={1}>
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

      {/* Filter Boxes */}

    </Box>
  );
}
