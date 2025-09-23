import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import UpdatePublicationForm from "@/components/Forms/UpdatePublicationForm";

export default function UpdatePublicationPage() {
  
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <UpdatePublicationForm />
      </Box>
    </Box>
  );
}
