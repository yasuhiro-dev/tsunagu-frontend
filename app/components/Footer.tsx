// app/components/Footer.tsx
"use client";

import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 3,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <MuiLink
            component={Link}
            href="/privacy"
            variant="body2"
            color="text.secondary"
          >
            プライバシーポリシー
          </MuiLink>
          <MuiLink
            component={Link}
            href="/terms"
            variant="body2"
            color="text.secondary"
          >
            利用規約
          </MuiLink>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          © 2026 Tsunagu
        </Typography>
      </Container>
    </Box>
  );
}
