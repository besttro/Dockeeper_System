// src/app/review_publication/page.tsx

import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import ManagePublicationTable from "@/components/Tables/ManagePublicationTable";

export default function ReviewPublication() {
  
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <ManagePublicationTable />
      </Box>
    </Box>
  );
}