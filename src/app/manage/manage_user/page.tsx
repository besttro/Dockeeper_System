"use client";

import { useState } from "react";
import { Box, Button, Typography, Divider, Link } from "@mui/material";
import Navbar from "../../../components/Navigator/Navbar";
import UserDashboard from "@/components/Tables/userTable";

export default function ProfilePage() {

  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <UserDashboard />
      </Box>
    </Box>
  );
}