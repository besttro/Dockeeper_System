// src/app/add_publication/page.tsx

import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import AddPublicationForm from "@/components/Forms/AddPublicationForm";

export default function AddPublicationPage() {
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <AddPublicationForm />
      </Box>
    </Box>
  );
}


