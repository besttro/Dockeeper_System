// src/app/edit_profile/page.tsx

import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import EditProfileForm from "@/components/Forms/EditProfileForm";

export default function EditProfilePage() {

  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <EditProfileForm />
      </Box>
    </Box>
  );
}