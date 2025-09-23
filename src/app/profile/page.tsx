import { Box } from "@mui/material";
import Navbar from "../../components/Navigator/Navbar";
import ProfileForm from "@/components/Forms/ProfileForm";

export default function ProfilePage() {

  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <ProfileForm />
      </Box>
    </Box>
  );
}
