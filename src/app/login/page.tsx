import LoginForm from "@/components/Forms/LoginForm";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div>
      <Box
        sx={{
          display: "flex", // เปิด flex
          minHeight: "100vh",
          backgroundColor: "white",
        }}
      >
        {/* ฝั่งซ้าย */}
        <Box
          sx={{
            flex: 1, // ครึ่งหน้าจอ
            backgroundColor: "#E4EDFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoginForm />
        </Box>

        {/* ฝั่งขวา */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#C3D6FF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/psu_logo.png"
              alt="PSU Logo"
              width={112}
              height={187}
              style={{ objectFit: "cover", marginBottom: "32px" }}
            />
            <Typography variant="h4" color="#2A51A7" fontWeight={"bold"} mb={2}>
              DOCKEEPER
            </Typography>
            <Typography
              variant="subtitle1"
              color="#2A51A7"
              textAlign="center"
              px={4}
            >
              ระบบรวบรวมงานตีพิมพ์ อาจารย์คณะวิทยาศาสตร์ สาขาวิทยาการคอมพิวเตอร์
            </Typography>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
