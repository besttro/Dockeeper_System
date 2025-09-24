"use client";

import { useState } from "react";
import { Box, Button, Typography, Divider, Link } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import ProfileDashboard from "../../components/Forms/Profile"

export default function ProfilePage() {

  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <ProfileDashboard/>
      </Box>
    </Box>
  );
}
