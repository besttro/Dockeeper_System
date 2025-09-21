"use client";

import { useState } from "react";
import { Box, Button, Typography, Divider, Link } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FindInPageIcon from '@mui/icons-material/FindInPage';
import Navbar from "../../components/Navigator/Navbar";

export default function HomePage() {
  const [search, setSearch] = useState("");

  //mock data publication

  return (
    <Box>
      <Navbar />
      <Box display={"flex"} flexDirection="row" minHeight="100vh">
        <Box display="flex" flexDirection="column" bgcolor="#dce6f7">
          {/* Main Content */}
          <Box>
            <Box flex={1} p={4} position="relative">
              <Box ml={5}>
                <Typography
                  component={Link}
                  href="/index"
                  variant="subtitle2"
                  fontWeight="normal"
                  color="#932623"
                >
                  &lt; Back to results
                </Typography>
              </Box>
              {/* Publication List */}
              <Box
                mt={-1}
                ml={5}
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
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.dark"
                    fontSize={30}
                  >
                    Example Education Resource01
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="success.main"
                    fontSize={20}
                  >
                    Author - Title , Year
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    The High-Impact Practices (HIPs) Spectrum is a taxonomy for
                    assessing and categorizing courses along a continuum based
                    on elements of High Impact Practices (Marten et al., in
                    press). This study provides quantitative evidence for the
                    validity and impact of the HIPs Spectrum by analyzing seven
                    years of enrollment data in a Midwestern regional
                    comprehensive university School of Business. Along the HIPs
                    Spectrum, courses are categorized as High Impact Practice
                    (HIP), High Engagement Experience (HEE), or Neither.
                    Labeling the medium-intensity HEE courses allows for a
                    detailed analysis of their effect on students, which is a
                    gap in previous literature. Results show supportive evidence
                    for both HIP and HEE courses significantly increasing
                    student persistence, and HEEs significantly decreasing time
                    to graduation in comparison with Neither courses. Students
                    earned an average of half a letter grade higher in HIP
                    courses than in Neither courses. Surprisingly, HEE courses
                    had a larger positive effect on students than HIP courses
                    for some variables, justifying the importance of researching
                    and implementing HEEs as a pedagogical tool to support
                    student success. Classification of courses along the HIPs
                    Spectrum is now an important step in accurate measurement of
                    how engaged learning affects students. As the HIPs Spectrum
                    grows in use, it has the potential to shift how we classify,
                    measure, and evaluate courses under the umbrella of
                    High-Impact Practices.
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
                  <Typography variant="subtitle2" color="#A5A6A7" mt={1}>
                    Indiana University. 107 South Indiana Avenue, Bryan Hall
                    203B, Bloomington, IN 47405. Tel: 317-274-5647; Fax:
                    317-278-2360; e-mail: josotl@iu.edu; Web site:
                    https://scholarworks.iu.edu/journals/index.php/josotl
                  </Typography>
                </Box>
                <Divider sx={{ my: 1, borderColor: "#7090D4", mt: -2 }} />
                <Box sx={{ width: "420px", height: "185px", p: 2, mt: -3 }}>
                  <Typography variant="subtitle2" color="text.primary" mt={1}>
                    Publication Type: Journal Articles; Reports - Research
                    Education Level: Secondary Education Audience: N/A
                    Language: English Sponsor: N/A Authoring Institution: N/A
                    Identifiers - Location: China Grant or Contract Numbers: N/A
                    Author Affiliations: N/A
                  </Typography>
                </Box>
                <Divider sx={{ my: 1, borderColor: "info.main", mt: -5 }} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display={"flex"} flexDirection="column" bgcolor="#dce6f7" flex={1}>
          <Box
            mt={19}
            color={"info.main"}
            ml={15}
            display={"flex"}
            flexDirection="column"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <FindInPageIcon fontSize="small" />
              <Typography component={Link} href="#">
                Preview
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <DownloadIcon fontSize="small" />
              <Typography component={Link} href="#">
                Download Full Text
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
