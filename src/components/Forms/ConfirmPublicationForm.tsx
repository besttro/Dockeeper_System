// src/components/Forms/ConfirmPublicationForm.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box, Paper, Typography, IconButton, Button, Select, MenuItem,
  FormControl, InputLabel, Link as MUILink, Alert
} from "@mui/material";
import NextLink from "next/link";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useParams, useRouter } from "next/navigation";

type Status = "Public" | "Pending" | "Waiting for Edit";

export default function ConfirmPublicationForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("Pending");
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null); // 👈

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setErrorText(null);
      try {
        const res = await fetch(`/api/publication/${id}`, { credentials: "include" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? "Failed to load publication");
        }
        const j = await res.json();
        setTitle(j.title ?? "");
        setAuthors(Array.isArray(j.authors) ? j.authors : []);
        setDescription(j.description ?? "");
        setStatus((j.status as Status) ?? "Pending");
        setFileUrl(j.fileUrl ?? null);
        setOwnerEmail(j.ownerEmail ?? null); // 👈
      } catch (e: any) {
        setErrorText(e?.message ?? "Failed to load publication");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/publication/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Update failed");
      }
      router.push("/review_publication");
    } catch (e: any) {
      setErrorText(e?.message ?? "Update failed");
    }
  };

  // Build mailto link (only if we have ownerEmail)
  const mailtoHref = useMemo(() => {
    if (!ownerEmail) return null;
    const subject = encodeURIComponent(`Regarding your publication: ${title || ""}`);
    const lines = [
      `Hello,`,
      ``,
      `We are reviewing your submission${title ? `: "${title}"` : ""}.`,
      `Status: ${status}`,
      ``,
      `Please reply if any changes are required.`,
      ``,
      `Open details: ${typeof window !== "undefined" ? window.location.origin + `/confirm/${id}` : ""}`,
    ];
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
  }, [ownerEmail, title, status, id]);

  // inside your component (after you have `ownerEmail`, `title`, `status`)
  const handleEmailGmail = () => {
    if (!ownerEmail) return;
    const subject = `Regarding your publication: ${title}`;
    const body =
      `Hello,\n\n` +
      `We are reviewing your submission: "${title}".\n` +
      `Status: ${status}\n\n`

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(ownerEmail)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };


  return (
    <Box sx={{ p: 4, bgcolor: "#dce6f7", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ borderRadius: 3, maxWidth: 900, width: "100%", boxShadow: 3, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#f0f0f0", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold">Review Publication</Typography>
          <MUILink component={NextLink} href="/review_publication"><IconButton><CloseIcon /></IconButton></MUILink>
        </Box>

        <Box sx={{ p: 2 }}>
          {errorText && <Alert severity="error" sx={{ mb: 2 }}>{errorText}</Alert>}
          {loading ? (
            <Typography>Loading…</Typography>
          ) : (
            <>
              <Box mt={-1} ml={5} mr={5} mb={5} display="flex" flexDirection="column" gap={3}>
                <Box sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold" color="primary.dark" fontSize={30}>
                      {title || "—"}
                    </Typography>
                    {fileUrl && (
                      <MUILink href={fileUrl} underline="none" target="_blank" rel="noopener">
                        <Box display="flex" alignItems="center" gap={0.5} sx={{ color: "primary.main" }} ml={3}>
                          <FindInPageIcon fontSize="small" />
                          <Typography variant="body2">Preview</Typography>
                        </Box>
                      </MUILink>
                    )}
                  </Box>
                  <Typography variant="subtitle2" color="success.main" fontSize={18}>
                    {authors.length ? authors.join(", ") : "Unknown Author"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {description || "—"}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel size="small">Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as Status)}
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
                    onClick={handleEmailGmail}
                    disabled={!ownerEmail}
                  >
                    Email
                  </Button>

                  <Button variant="contained" sx={{ bgcolor: "#2c5282" }} onClick={handleSubmit}>
                    Submit
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}