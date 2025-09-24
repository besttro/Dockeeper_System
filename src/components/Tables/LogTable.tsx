// LogTable.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Link,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

// --- ข้อมูลสำหรับตาราง ---
const tableData = [
  {
    name: "DR.Charte Push",
    email: "charlie.singasong@gmail.com",
    role: "Officer",
    action: "login",
    time: "22/09/2025 12:50 PM",
  },
  {
    name: "DR.Becky Christiansen",
    email: "becky69@gmail.com",
    role: "Professer",
    action: "login",
    time: "22/09/2025 01:50 PM",
  },
  {
    name: "Luca Modric",
    email: "MOdric@gmail.com",
    role: "Officer",
    action: "login",
    time: "22/09/2025 06:50 PM",
  },
  {
    name: "DR.Fermin Gijo",
    email: "firmin4389@gmail.com",
    role: "Professer",
    action: "login",
    time: "22/09/2025 09:06 PM",
  },
  {
    name: "DR.Becky Christiansen",
    email: "becky69@gmail.com",
    role: "Professer",
    action: "login",
    time: "23/09/2025 00:03 AM",
  },
  {
    name: "Nakarin iBoss",
    email: "LnwzqbBoss@gmail.com",
    role: "Officer",
    action: "login",
    time: "23/09/2025 08:50 AM",
  },
  {
    name: "Arm Roarmama",
    email: "mamahitarim@gmail.com",
    role: "Professer",
    action: "login",
    time: "23/09/2025 09:30 AM",
  },
];

const LogTable = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [filteredData, setFilteredData] = useState(tableData);

  const [professorsCount, setProfessorsCount] = useState(0);
  const [officersCount, setOfficersCount] = useState(0);
  const [todayLoginsCount, setTodayLoginsCount] = useState(0);

  useEffect(() => {
    // แก้ไขโค้ดส่วนนี้ให้แสดงวันที่และเวลาปัจจุบันแบบง่ายๆ
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString("th-TH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const profCount = tableData.filter(
      (item) => item.role === "Professer"
    ).length;
    const offCount = tableData.filter((item) => item.role === "Officer").length;

    const now = new Date();
    const today = now.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const loginsToday = tableData.filter((item) => {
      const itemDate = new Date(item.time).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return itemDate === today;
    }).length;

    setProfessorsCount(profCount);
    setOfficersCount(offCount);
    setTodayLoginsCount(loginsToday);
  }, []);

  useEffect(() => {
    let result = tableData;

    if (searchName) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (selectedRole) {
      result = result.filter((item) => item.role === selectedRole);
    }

    setFilteredData(result);
  }, [searchName, selectedRole]);

  const statCardStyle = {
    p: 3,
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    flexGrow: 1,
    minWidth: "200px",
  };

  const allRoles = [...new Set(tableData.map((item) => item.role))];

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "#dce6f7",
        minHeight: "100vh",
        ml: 5,
        mr: 5,
      }}
    >
      {/* ส่วนแสดงวันที่และเวลาปัจจุบัน */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ color: "text.secondary", fontWeight: "bold" }}
        >
          {currentDateTime}
        </Typography>
      </Box>

      {/* ส่วนแสดงสถิติ (Stats Section) */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {/* Card 1: จำนวนอาจารย์ทั้งหมด */}
        <Box
          display={"flex"}
          sx={statCardStyle}
          justifyContent={"center"}
          alignItems={"flex-start"}
          flexDirection={"column"}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            จำนวนอาจารย์ทั้งหมด
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Total professors
          </Typography>
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: "bold", mt: 1, color: "text.primary" }}
          >
            {professorsCount} คน
          </Typography>
        </Box>

        {/* Card 2: จำนวนเจ้าหน้าที่ทั้งหมด */}
        <Box
          display={"flex"}
          sx={statCardStyle}
          justifyContent={"center"}
          alignItems={"flex-start"}
          flexDirection={"column"}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            จำนวนเจ้าหน้าที่ทั้งหมด
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Total officers
          </Typography>
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: "bold", mt: 1, color: "#e6bc15ff" }}
          >
            {officersCount} คน
          </Typography>
        </Box>

        {/* Card 3: จำนวนผู้เข้าใช้งานวันนี้ */}
        <Box
          display={"flex"}
          sx={statCardStyle}
          justifyContent={"center"}
          alignItems={"flex-start"}
          flexDirection={"column"}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            จำนวนผู้เข้าใช้งานวันนี้
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Total users login today
          </Typography>
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: "bold", mt: 1, color: "green" }}
          >
            {todayLoginsCount} คน
          </Typography>
        </Box>
      </Box>

      {/* ส่วน Filter และ Search */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search by Name */}
        <TextField
          label="ค้นหาชื่อ"
          variant="outlined"
          size="small"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        {/* Filter by Role */}
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>เลือก Role</InputLabel>
          <Select
            value={selectedRole}
            label="เลือก Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>
            {allRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ส่วนตาราง (Table Section) */}
      <TableContainer
        component={Box}
        sx={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#3f51b5",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#3f51b5",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#3f51b5",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Role
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#3f51b5",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Action
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#3f51b5",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Time
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {row.email === "LnwzqbBoss@gmail.com" ? (
                    <Link href="#" underline="always">
                      {row.email}
                    </Link>
                  ) : (
                    row.email
                  )}
                </TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogTable;