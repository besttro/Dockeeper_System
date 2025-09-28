// src/app/audit_log/page.tsx

import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import LogTable from "@/components/Tables/LogTable";

export default function MyPublication() {
  
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <LogTable />
      </Box>
    </Box>
  );
}