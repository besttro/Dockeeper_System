// src/app/manage/mange_user/page.tsx

import { Box } from "@mui/material";
import Navbar from "../../../components/Navigator/Navbar";
import UserDashboard from "@/components/Tables/userTable";

export default function ManageUserPage() {

  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <UserDashboard />
      </Box>
    </Box>
  );
}