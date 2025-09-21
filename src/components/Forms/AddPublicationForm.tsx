"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Input,
  IconButton,
  Autocomplete,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FileUploadIcon from '@mui/icons-material/FileUpload';


export default function AddPublicationForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coAuthor, setCoAuthor] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coAuthors, setCoAuthors] = useState<string[]>([""]);
  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleAdd = () => {
    setCoAuthors([...coAuthors, ""]);
  };

  const handleRemove = (index: number) => {
    const newCoAuthors = [...coAuthors];
    newCoAuthors.splice(index, 1);
    setCoAuthors(newCoAuthors);
  };

  const handleChange = (index: number, value: string) => {
    const newCoAuthors = [...coAuthors];
    newCoAuthors[index] = value;
    setCoAuthors(newCoAuthors);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    console.log({
      title,
      author,
      coAuthor,
      date,
      description,
      type,
      file,
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "8px",
        boxShadow: 2,
        maxWidth: 800,
        mx: "auto",
      }}
    >
      {/* Header bar (gray) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "grey.200",
          px: 2,
          py: 1.5,
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={500}
          color="text.primary"
          ml={2}
        >
          Upload New Publication
        </Typography>
        <IconButton size="small" href="/index">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form content */}
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>
            Title
          </Typography>
          <TextField
            size="small"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter publication title"
          />
        </Box>

        {/* Author + Co-authors */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Label ด้านซ้าย */}
          <Typography sx={{ minWidth: 160, color: "text.primary", pt: 1 }}>
            Name
          </Typography>

          {/* ช่องกรอก + ปุ่มต่างๆ */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}
          >
            {/* Author */}
            <TextField
              size="small"
              fullWidth
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />

            {/* Co-Authors */}
            {coAuthors.map((coAuthor, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  size="small"
                  value={coAuthor}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`Co-Author ${index + 1}`}
                />
                <IconButton
                  sx={{ ml: 1 }}
                  onClick={() => handleRemove(index)}
                  disabled={coAuthors.length === 1}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}

            {/* ปุ่ม Add Co-Author */}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              size="small"
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              Add Co-Author
            </Button>
          </Box>
        </Box>

        {/* Date */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>
            Date of Publication
          </Typography>
          <TextField
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Box>

        {/* Description */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Typography sx={{ minWidth: 160, pt: 1, color: "text.primary" }}>
            Description
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description of the publication"
          />
        </Box>

        {/* Publication Type */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ minWidth: 160, color: "text.primary" }}>
                    Publication Type
                  </Typography>
                  <Autocomplete
                    multiple
                    options={options}
                    value={selectedOptions}
                    onChange={(event, newValue) => setSelectedOptions(newValue)}
                    renderTags={(value: string[], getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          {...getTagProps({ index })}
                          color="primary"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Publication Type (Multiple)"
                        placeholder="Choose..."
                        fullWidth // <-- เพิ่มตรงนี้
                      />
                    )}
                    sx={{ flex: 1 }} // <-- เพิ่มตรงนี้ให้เต็ม container
                  />
                </Box>

        {/* File Upload */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>
            File to Upload
          </Typography>
          <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
            Add file
            <Input
              type="file"
              onChange={handleFileChange}
              sx={{ display: "none" }}
            />
          </Button>
          {file && (
            <Typography variant="body2" sx={{ ml: 2 }}>
              {file.name}
            </Typography>
          )}
        </Box>

        {/* Buttons */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
        >
          <Button variant="contained"  sx={{backgroundColor:"#7090D4"}}>
            Save Draft
          </Button>
          <Button variant="contained" sx={{backgroundColor:"#002880"}} onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
