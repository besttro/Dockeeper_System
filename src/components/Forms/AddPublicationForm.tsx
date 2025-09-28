// src/components/Forms/AddPublicationForm.tsx
"use client";

import { useState } from "react";
import {
  Box, Button, TextField, Typography, Input, IconButton, Autocomplete
} from "@mui/material";
import { useRouter } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FileUploadIcon from "@mui/icons-material/FileUpload";

export default function AddPublicationForm({ currentUserId }: { currentUserId?: number }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coAuthors, setCoAuthors] = useState<string[]>([""]); // each item "fname lname"
  const [year, setYear] = useState<string>("");
  const [type, setType] = useState(""); // "journal" | "international"
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  const typeOptions = ["journal", "international"] as const;
  type PubType = (typeof typeOptions)[number];

  const handleAdd = () => setCoAuthors((s) => [...s, ""]);
  const handleRemove = (index: number) =>
    setCoAuthors((s) => (s.length === 1 ? s : s.filter((_, i) => i !== index)));
  const handleChange = (index: number, value: string) =>
    setCoAuthors((s) => s.map((v, i) => (i === index ? value : v)));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    const uid = currentUserId ?? 1;

    if (!title.trim()) return alert("Please enter a title");
    if (!description.trim()) return alert("Please fill the description"); // <— ensure not empty
    if (!year || isNaN(Number(year))) return alert("Please enter a valid year");
    if (!type) return alert("Please choose a publication type");
    if (!file) return alert("Please select a PDF");
    if (file.type !== "application/pdf") return alert("Only PDF files are allowed");

    const PUB_TYPE: Record<string, number> = { journal: 0, international: 1 };
    const pubTypeInt = PUB_TYPE[type];

    const form = new FormData();
    form.append("pub_title", title.trim());
    form.append("pub_description", description.trim()); // <— NEW
    form.append("pub_year", String(parseInt(year, 10)));
    form.append("pub_type", String(pubTypeInt));
    form.append("pub_status", "0");
    form.append("current_user_id", String(uid));

    coAuthors
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((v) => form.append("co_authors[]", v));

    form.append("file", file);

    const res = await fetch("/api/publication", { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(err);
      return alert(err?.error ?? "Failed to create publication");
    }
    alert("Publication created!");
    router.push("/my_publication");
  };


  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "8px", boxShadow: 2, maxWidth: 800, mx: "auto" }}>
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "grey.200",
        px: 2, py: 1.5, borderTopLeftRadius: "8px", borderTopRightRadius: "8px"
      }}>
        <Typography variant="subtitle1" fontWeight={500} color="text.primary" ml={2}>
          Upload New Publication
        </Typography>
        <IconButton size="small" href="/index"><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>Title</Typography>
          <TextField size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter publication title" />
        </Box>

        {/* Description */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary", pt: 1 }}>
            Description
          </Typography>
          <TextField
            size="small"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter publication description"
            multiline
            minRows={3}
          />
        </Box>


        {/* Co-Authors */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary", pt: 1 }}>Co-Authors</Typography>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            {coAuthors.map((value, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                <TextField fullWidth size="small" value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`e.g. "Somchai Jaidee"`} />
                <IconButton sx={{ ml: 1 }} onClick={() => handleRemove(index)} disabled={coAuthors.length === 1}>
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd} size="small"
              sx={{ alignSelf: "flex-start", mt: 1 }}>
              Add Co-Author
            </Button>
          </Box>
        </Box>

        {/* Year (int) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>Year</Typography>
          <TextField
            type="number"
            inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
            size="small" fullWidth value={year}
            onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2025"
          />
        </Box>

        {/* Publication Type */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>Publication Type</Typography>
          <Autocomplete<PubType, false, false, false>
            options={typeOptions as unknown as PubType[]}
            value={(type as PubType) || null}
            onChange={(_, v) => setType(v ?? "")}
            renderInput={(params) => (
              <TextField {...params} label="Select Publication Type" placeholder="Choose…" fullWidth />
            )}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* File Upload */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>File to Upload</Typography>
          <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
            Add file
            <Input type="file" inputProps={{ accept: "application/pdf" }} onChange={handleFileChange} sx={{ display: "none" }} />
          </Button>
          {file && <Typography variant="body2" sx={{ ml: 2 }}>{file.name}</Typography>}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          <Button variant="contained" sx={{ backgroundColor: "#002880" }} onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

