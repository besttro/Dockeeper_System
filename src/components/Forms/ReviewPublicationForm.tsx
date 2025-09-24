"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FindInPageIcon from '@mui/icons-material/FindInPage';
import EmailIcon from "@mui/icons-material/Email";

export default function ReviewPublicationForm() {
  const [status, setStatus] = useState<
    "Public" | "Pending" | "Waiting for Edit"
  >("Pending");

  const getStatusColor = (
    status: "Public" | "Pending" | "Waiting for Edit"
  ) => {
    switch (status) {
      case "Public":
        return { bgcolor: "#c6f6d5", color: "#276749" };
      case "Pending":
        return { bgcolor: "#e2e8f0", color: "#4a5568" };
      case "Waiting for Edit":
        return { bgcolor: "#fed7d7", color: "#c53030" };
      default:
        return { bgcolor: "#e2e8f0", color: "#4a5568" };
    }
  };

  const handleChangeStatus = (event: any) => {
    setStatus(event.target.value);
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#dce6f7",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        sx={{
          borderRadius: 3,
          maxWidth: 900,
          width: "100%",
          boxShadow: 3,
          overflow: "hidden", // Ensures inner border-radius is respected
        }}
      >
        <Box
          sx={{
            bgcolor: "#f0f0f0", // สีเทาสำหรับแถบ Review Publication
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Review Publication
          </Typography>
          <IconButton>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          {/* เพิ่ม padding ที่นี่เพื่อให้เนื้อหาไม่ติดขอบบน */}
          {/* Publication details */}
          <Box
            mt={-1}
            ml={5}
            mr={5}
            mb={5}
            display="flex"
            flexDirection="column"
            gap={3}
            maxWidth={1000}
          >
            <Box
              sx={{
                p: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary.dark"
                  fontSize={30}
                >
                  Example Education Resource01
                </Typography>
                <Link href="#" underline="none">
                  <Box display="flex" alignItems="center" gap={0.5} sx={{ color: "primary.main" }} ml={3}>
                    <FindInPageIcon fontSize="small" />
                    <Typography variant="body2">Preview</Typography>
                  </Box>
                </Link>
              </Box>
              <Typography
                variant="subtitle2"
                color="success.main"
                fontSize={20}
              >
                Author - Title , Year
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                The High-Impact Practices (HIPs) Spectrum is a taxonomy for
                assessing and categorizing courses along a continuum based on
                elements of High Impact Practices (Marten et al., in press).
                This study provides quantitative evidence for the validity and
                impact of the HIPs Spectrum by analyzing seven years of
                enrollment data in a Midwestern regional comprehensive
                university School of Business. Along the HIPs Spectrum, courses
                are categorized as High Impact Practice (HIP), High Engagement
                Experience (HEE), or Neither. Labeling the medium-intensity HEE
                courses allows for a detailed analysis of their effect on
                students, which is a gap in previous literature. Results show
                supportive evidence for both HIP and HEE courses significantly
                increasing student persistence, and HEEs significantly
                decreasing time to graduation in comparison with Neither
                courses. Students earned an average of half a letter grade
                higher in HIP courses than in Neither courses. Surprisingly, HEE
                courses had a larger positive effect on students than HIP
                courses for some variables, justifying the importance of
                researching and implementing HEEs as a pedagogical tool to
                support student success. Classification of courses along the
                HIPs Spectrum is now an important step in accurate measurement
                of how engaged learning affects students. As the HIPs Spectrum
                grows in use, it has the potential to shift how we classify,
                measure, and evaluate courses under the umbrella of High-Impact
                Practices.
              </Typography>
              <Box display={"flex"} flexDirection="row" mt={2}>
                <Typography variant="subtitle2" color="#A5A6A7" mt={1}>
                  Descriptors:
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#0051FF"
                  mt={1}
                  component={Link}
                  href="#"
                  ml={1}
                >
                  Numbers, Number Systems, Cultural Differences, Adults
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* Actions */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel size="small">Status</InputLabel>
              <Select
                value={status}
                onChange={handleChangeStatus}
                size="medium"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Public">Public</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Waiting for Edit">Waiting for Edit</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Button
                variant="contained"
                sx={{ mr: 1, bgcolor: "#f56565" }}
                startIcon={<EmailIcon />}
              >
                Email
              </Button>
              <Button variant="contained" sx={{ bgcolor: "#2c5282" }}>
                Submit
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}