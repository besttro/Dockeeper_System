import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import MyPublicationTable from "@/components/Tables/MyPublicationTable";

export default function MyPublication() {
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <MyPublicationTable />
      </Box>
    </Box>
  );
}

