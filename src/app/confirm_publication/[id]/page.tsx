// src/app/confirm_publication/[id]/page.tsx

import { Box } from "@mui/material";
import Navbar from "../../../components/Navigator/Navbar";
import ConfirmPublicationForm from "@/components/Forms/ConfirmPublicationForm";

export default function ConfirmPage() {
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <ConfirmPublicationForm />
      </Box>
    </Box>
  );
}
