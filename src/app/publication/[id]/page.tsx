"use client";

import { useEffect, useState } from "react";
import { Box, Button, Typography, Divider, Link, Chip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Navbar from "@/components/Navigator/Navbar";

type PubResp = {
    id: number;
    title: string;
    description: string;
    year: number;
    type: number; // 0=journal, 1=international
    status: "Public" | "Pending" | "Waiting for Edit";
    authors: string[];
    fileUrl: string | null; // e.g. /uploads/abc.pdf
};

const TYPE_LABEL: Record<number, string> = {
    0: "Journal",
    1: "International",
};

export default function PublicationDetailsPage({ params }: { params: { id: string } }) {
    const pubId = Number(params.id);
    const [data, setData] = useState<PubResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setErrorText(null);
            try {
                const res = await fetch(`/api/publication/${pubId}`, { cache: "no-store", credentials: "include" });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error ?? "Failed to load publication");
                }
                const j: PubResp = await res.json();

                // Only show public items on this public details page
                if (j.status !== "Public") {
                    throw new Error("This publication is not public.");
                }

                setData(j);
            } catch (e: any) {
                setErrorText(e?.message ?? "Failed to load publication");
            } finally {
                setLoading(false);
            }
        })();
    }, [pubId]);

    return (
        <Box>
            <Navbar />
            <Box display="flex" flexDirection="row" minHeight="100vh">
                <Box display="flex" flexDirection="column" bgcolor="#dce6f7" flex={1}>
                    <Box p={4} position="relative">
                        <Box ml={5} mb={2}>
                            <Typography
                                component={Link}
                                href="/"
                                variant="subtitle2"
                                fontWeight="normal"
                                color="#932623"
                                underline="hover"
                            >
                                &lt; Back to results
                            </Typography>
                        </Box>

                        {loading ? (
                            <Typography align="center">Loading…</Typography>
                        ) : errorText ? (
                            <Typography align="center" color="error">{errorText}</Typography>
                        ) : !data ? (
                            <Typography align="center">Not found.</Typography>
                        ) : (
                            <Box ml={5} display="flex" flexDirection="column" gap={3} maxWidth={1000}>
                                <Box sx={{ p: 2 }}>
                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="primary.dark"
                                            fontSize={30}
                                        >
                                            {data.title}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={TYPE_LABEL[data.type] ?? "Unknown"}
                                            sx={{ ml: 1 }}
                                        />
                                        <Chip
                                            size="small"
                                            label={data.year || "—"}
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>

                                    <Typography variant="subtitle2" color="success.main" fontSize={16} mt={1}>
                                        Authors: {data.authors.length ? data.authors.join(", ") : "Unknown"}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" mt={2}>
                                        {data.description || "—"}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 1, borderColor: "#7090D4", mt: -2 }} />

                                {/* Download (no Preview per your request) */}
                                <Box mt={1}>
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        component="a"
                                        href={data.fileUrl ?? undefined}
                                        download // tell browser to download
                                        sx={{ backgroundColor: "#002880" }}
                                        disabled={!data.fileUrl}
                                        target="_blank" // still okay; download behavior depends on browser
                                        rel="noreferrer"
                                    >
                                        Download Full Text
                                    </Button>
                                    {!data.fileUrl && (
                                        <Typography variant="caption" color="text.secondary" ml={2}>
                                            No file attached.
                                        </Typography>
                                    )}
                                </Box>{/* Download button (no auth required) */}
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    component="a"
                                    href={data.fileUrl || undefined}   // e.g. "/uploads/abc123.pdf"
                                    target="_blank"
                                    rel="noreferrer"
                                    download                           // hints browser to download
                                    sx={{ backgroundColor: "#002880" }}
                                    disabled={!data.fileUrl}
                                >
                                    Download Full Text
                                </Button>


                                <Divider sx={{ my: 1, borderColor: "info.main" }} />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
