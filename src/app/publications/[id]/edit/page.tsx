// app/publications/[id]/edit/page.tsx
"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/Navigator/Navbar";
import UpdatePublicationForm from "@/components/Forms/UpdatePublicationForm";

export default function EditPublicationPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return (
    <Box>
      <Navbar />
      <Box bgcolor="#dce6f7" minHeight="100vh" py={4}>
        <UpdatePublicationForm pubId={id} />
      </Box>
    </Box>
  );
}
