// src/app/page.tsx (HomePage)

import { Box } from "@mui/material";
import HomeContent from "@/components/Forms/HomeContent";

// เพิ่มบรรทัดนี้เพื่อแก้ปัญหา Build Error
// export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <Box>
      <HomeContent />
    </Box>
  );
}