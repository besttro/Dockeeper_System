// app/edit_profile/[id]/page.tsx
"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/Navigator/Navbar";
import AdminEditUserForm from "@/components/Forms/AdminEditUserForm";

export default function EditUserPage() {
  // AdminEditUserForm reads the [id] from the URL via useParams
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <AdminEditUserForm />
      </Box>
    </Box>
  );
}
