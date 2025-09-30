// src/components/Forms/UpdatePublicationForm.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Box, Button, TextField, Typography, Input, IconButton, Autocomplete
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useRouter } from "next/navigation";

type PubTypeLabel = "journal" | "international";
const typeOptions = ["journal", "international"] as const;
const PUB_TYPE_TO_INT: Record<PubTypeLabel, number> = { journal: 0, international: 1 };
const INT_TO_PUB_TYPE: Record<number, PubTypeLabel> = { 0: "journal", 1: "international" };

export default function UpdatePublicationForm({ pubId }: { pubId: number }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coAuthors, setCoAuthors] = useState<string[]>([""]); // "fname lname"
  const [year, setYear] = useState<string>("");
  const [type, setType] = useState<PubTypeLabel | "">("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);

  const handleAdd = () => setCoAuthors((s) => [...s, ""]);
  const handleRemove = (index: number) =>
    setCoAuthors((s) => (s.length === 1 ? s : s.filter((_, i) => i !== index)));
  const handleChange = (index: number, value: string) =>
    setCoAuthors((s) => s.map((v, i) => (i === index ? value : v)));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Load existing publication
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/publication/${pubId}`, { credentials: "include", cache: "no-store" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? "Failed to load publication");
        }
        const data = await res.json();
        // data shape from your GET /api/publication/[id]
        // { id, title, description, year, type(int), status, authors[], fileUrl }
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setYear(String(data.year ?? ""));
        setType(INT_TO_PUB_TYPE[(data.type as number) ?? 0] ?? "journal");
        // authors[] contains owner's name too; keep coauthors editable separately if you like.
        // For simplicity, use authors[] minus first entry IF you want, but we don't know order.
        // We'll just allow users to re-enter co-authors; fill with authors (excluding owner later if you extend API).
        const authors = Array.isArray(data.authors) ? data.authors : [];
        setCoAuthors(authors.length ? authors : [""]);
      } catch (e: any) {
        alert(e?.message ?? "Failed to load publication");
      } finally {
        setLoading(false);
      }
    })();
  }, [pubId]);

  const handleSubmit = async () => {
    if (!title.trim()) return alert("Please enter a title");
    if (!description.trim()) return alert("Please fill the description");
    if (!year || isNaN(Number(year))) return alert("Please enter a valid year");
    if (!type) return alert("Please choose a publication type");
    if (file && file.type !== "application/pdf") return alert("Only PDF files are allowed");

    const form = new FormData();
    form.append("pub_title", title.trim());
    form.append("pub_description", description.trim());
    form.append("pub_year", String(parseInt(year, 10)));
    form.append("pub_type", String(PUB_TYPE_TO_INT[type as PubTypeLabel]));
    // status: keep as-is on server (don’t send)
    coAuthors
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((v) => form.append("co_authors[]", v));
    if (file) form.append("file", file);

    const res = await fetch(`/api/publication/${pubId}`, {
      method: "PUT",
      body: form, // multipart → edit branch
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return alert(err?.error ?? "Failed to update publication");
    }

    alert("Publication updated!");
    router.push("/my_publication");
  };

  if (loading) return <Typography sx={{ textAlign: "center" }}>Loading…</Typography>;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "8px", boxShadow: 2, maxWidth: 800, mx: "auto" }}>
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "grey.200",
        px: 2, py: 1.5, borderTopLeftRadius: "8px", borderTopRightRadius: "8px"
      }}>
        <Typography variant="subtitle1" fontWeight={500} color="text.primary" ml={2}>
          Update Publication
        </Typography>
        <IconButton size="small" href="/my_publication"><CloseIcon /></IconButton>
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

        {/* Year */}
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
          <Autocomplete<PubTypeLabel, false, false, false>
            options={typeOptions as unknown as PubTypeLabel[]}
            value={(type as PubTypeLabel) || null}
            onChange={(_, v) => setType((v ?? "") as PubTypeLabel | "")}
            renderInput={(params) => (
              <TextField {...params} label="Select Publication Type" placeholder="Choose…" fullWidth />
            )}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* File Upload (optional) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: 160, color: "text.primary" }}>Replace PDF (optional)</Typography>
          <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
            Choose file
            <Input type="file" accept="application/pdf" onChange={handleFileChange} sx={{ display: "none" }} />
          </Button>
          {file && <Typography variant="body2" sx={{ ml: 2 }}>{file.name}</Typography>}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          <Button variant="contained" sx={{ backgroundColor: "#002880" }} onClick={handleSubmit}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
}