import { Box } from "@mui/material";
import Home from "@/components/Home";

// เพิ่มบรรทัดนี้เพื่อแก้ปัญหา Build Error
// export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <Box>
      <Home />
    </Box>
  );
}
