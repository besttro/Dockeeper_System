// src/app/add_user/page.tsx

import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import AddUserForm from "@/components/Forms/AddUserForm";

export default function AddUserPage() {

  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <AddUserForm />
      </Box>
    </Box>
  );
}