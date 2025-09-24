"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Link,
  Select,
  MenuItem,
  FormControl,
  Button,
  Avatar,
  Stack,
} from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import NextLink from "next/link";
import { Link as MuiLink } from "@mui/material";

// --- Sample Data ---
const userData = {
  name: "Teerasak shadowmaster",
  email: "teerasak.shadowmaster@gmail.com",
  role: "Professer",
  tel: "+66 88 666 6666",
};

const publicationData = [
  { title: "Example Education Resource01", year: 2024, link: "#" },
  { title: "Example Education Resource02", year: 2023, link: "#" },
  { title: "Example Education Resource03", year: 2023, link: "#" },
  { title: "Example Education Resource04", year: 2022, link: "#" },
  { title: "Example Education Resource05", year: 2022, link: "#" },
  { title: "Example Education Resource06", year: 2021, link: "#" },
  { title: "Example Education Resource07", year: 2020, link: "#" },
];

const sortedPublications = [...publicationData].sort((a, b) => b.year - a.year);

const ProfileDashboard = () => {
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [filteredPublications, setFilteredPublications] = useState<
    typeof publicationData
  >([]);

  const allYears = [...new Set(publicationData.map((p) => p.year))].sort(
    (a, b) => b - a
  );

  useEffect(() => {
    let result = sortedPublications;
    const startNum = parseInt(startYear);
    const endNum = parseInt(endYear);

    if (startYear && endYear) {
      result = result.filter((p) => p.year >= startNum && p.year <= endNum);
    } else if (startYear) {
      result = result.filter((p) => p.year >= startNum);
    } else if (endYear) {
      result = result.filter((p) => p.year <= endNum);
    }

    setFilteredPublications(result);
  }, [startYear, endYear]);

  useEffect(() => {
    setFilteredPublications(sortedPublications.slice(0, 5));
  }, []);

  return (
    <Box
      sx={{
        p: 4,
        background: "#dce6f7",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 2,
          maxWidth: 800,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Gradient Top Bar */}
        <Box
          sx={{
            height: 80,
            background: "linear-gradient(to right, #dbeafe, #fff7ed)", // ปรับสี gradient ตามรูป
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Profile */}
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: deepPurple[300],
                width: 80,
                height: 80,
                fontSize: "2rem",
              }}
            >
              {userData.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {userData.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", textDecoration: "underline" }}
              >
                {userData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role : {userData.role} &nbsp; Tel : {userData.tel}
              </Typography>
            </Box>
          </Box>

          {/* Year Filter */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Typography color="text.primary">Start :</Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Year</MenuItem>
                {allYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography>—</Typography>

            <Typography color="text.primary">End :</Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Year</MenuItem>
                {allYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Publications */}
          <Box mb={3}>
            <Typography
              color="text.primary"
              mb={2}
              variant="h6"
              fontWeight={"bold"}
            >
              Latest Publication
            </Typography>
            {filteredPublications.map((pub, i) => (
              <Typography key={i} mb={1} color="text.primary">
                <Link href={pub.link} underline="hover">
                  {pub.title}
                </Link>{" "}
                ({pub.year})
              </Typography>
            ))}
          </Box>

          {/* Back Button ถ้าเป็นเจ้าหน้าที่ให้ back to manage_user ถ้าเป็น professor ให้ back to main page */}
          <Box
            textAlign="right"
            display={"flex"}
            flexDirection={"row"}
            gap={1}
            justifyContent={"flex-end"}
          >
            <MuiLink component={NextLink} href={"/manage/manage_user"}>
              <Button
                variant="contained"
                sx={{ bgcolor: "#002776" }}
                onClick={() => console.log("Back clicked")}
              >
                Back
              </Button>
            </MuiLink>
            <MuiLink component={NextLink} href={"/edit_profile"}>
              <Button
                variant="contained"
                sx={{ bgcolor: "#dc8000ff" }}
                onClick={() => console.log("Back clicked")}
              >
                Edit Profile
              </Button>
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileDashboard;
