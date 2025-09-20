"use client";

import { useState } from "react";
import { Box, Button, Typography, Divider, Link } from "@mui/material";
import Navbar from "../../components/Navbar";
import ProfileForm from "@/components/Forms/ProfileForm";

export default function HomePage() {
  const [search, setSearch] = useState("");

  //mock data publication

  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <ProfileForm />
      </Box>
    </Box>
  );
}
