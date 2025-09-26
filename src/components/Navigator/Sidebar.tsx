// src/components/Navigator/Sidebar.tsx

import React from "react";
import { Box, Typography, Paper, Link } from "@mui/material";
import Image from "next/image";

export default function Sidebar() {
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
        <Image src="/psu_logo.png" alt="Logo" width={60} height={60} />
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
      <Paper
        sx={{
          width: "80%",
          borderRadius: 2,
          overflow: "hidden",
          textAlign: "center",
        }}
        elevation={2}
      >
        <Box bgcolor="#7b9de0" py={0.5}>
          <Typography variant="subtitle2" fontWeight="bold" color="white">
            Publication Date
          </Typography>
        </Box>
        <Box height={100} px={1}>
          {/* รายการงานตีพิมพ์ */}
          <Box display="flex" alignItems="flex-start" mt={0.5}>
            {/* ข้อความ */}
            <Typography
              sx={{ textAlign: "left", color: "primary.main", fontSize: 12 }}
              component={Link}
              href="#"
              underline="always"
            >
              งานตีพิมพ์ครั้งที่ 1
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        sx={{
          width: "80%",
          borderRadius: 2,
          overflow: "hidden",
          textAlign: "center",
        }}
        elevation={2}
      >
        <Box bgcolor="#7b9de0" py={0.5}>
          <Typography variant="subtitle2" fontWeight="bold" color="white">
            Descriptor
          </Typography>
        </Box>
        <Box height={100} px={1}>
          <Box display="flex" alignItems="flex-start" mt={0.5}>
            {/* ข้อความ */}
            <Typography
              sx={{ textAlign: "left", color: "primary.main", fontSize: 12 }}
              component={Link}
              href="#"
              underline="always"
            >
              งานตีพิมพ์ครั้งที่ 1
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        sx={{
          width: "80%",
          borderRadius: 2,
          overflow: "hidden",
          textAlign: "center",
        }}
        elevation={2}
      >
        <Box bgcolor="#7b9de0" py={0.5}>
          <Typography variant="subtitle2" fontWeight="bold" color="white">
            Source
          </Typography>
        </Box>
        <Box height={100} px={1}>
          <Box display="flex" alignItems="flex-start" mt={0.5}>
            {/* ข้อความ */}
            <Typography
              sx={{ textAlign: "left", color: "primary.main", fontSize: 12 }}
              component={Link}
              href="#"
              underline="always"
            >
              งานตีพิมพ์ครั้งที่ 1
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
