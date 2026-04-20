import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToUpdates } from "../services/supportService.js";
import LogoMark from "./LogoMark.jsx";
import BrandImage from "./BrandImage.jsx";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", path: "/info/features" },
      { label: "Admin Tools", path: "/info/admin-tools" },
      { label: "Student Mobile App (Upcoming)", path: "/info/student-mobile-app" },
      { label: "Pricing", path: "/info/pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", path: "/info/help-center" },
      { label: "API Docs", path: "/info/api-docs" },
      { label: "Contact Support", path: "/info/contact-support" },
      { label: "Security", path: "/info/security" },
    ],
  },
];

function FooterSection() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const currentYear = new Date().getFullYear();

  const handleNavigate = (path) => {
    navigate(path);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setFeedback({ type: "error", message: "Please enter an email." });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: "", message: "" });
      await subscribeToUpdates(email.trim());
      setFeedback({ type: "success", message: "Subscribed successfully." });
      setEmail("");
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to subscribe.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#0b1224" : "#0f172a",
        backgroundImage: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(11, 18, 36, 1) 100%)"
            : "linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.9) 60%, rgba(15, 23, 42, 1) 100%)",
        color: "#fff",
        pt: 8,
        pb: 4,
        borderTop: (theme) =>
          theme.palette.mode === "dark"
            ? "1px solid rgba(148, 163, 184, 0.2)"
            : "none",
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={6}>
          <Box sx={{ flex: 1 }}>
            <LogoMark />
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "rgba(255,255,255,0.7)" }}
            >
              The smarter way to manage your residential facilities. Built for
              speed, transparency, and ease of use.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <IconButton
                sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={6}
            sx={{ flex: 1.2 }}
          >
            {columns.map((column) => (
              <Box key={column.title}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                  {column.title}
                </Typography>
                <Stack spacing={1.2}>
                  {column.links.map((link) => (
                    <Button
                      key={link.label}
                      color="inherit"
                      onClick={() => handleNavigate(link.path)}
                      sx={{
                        justifyContent: "flex-start",
                        px: 0,
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
              Subscribe to Updates
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}
            >
              Get the latest news on product updates and new features.
            </Typography>
            <TextField
              fullWidth
              placeholder="Email address"
              variant="outlined"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubscribe();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{ color: "#fff" }}
                      onClick={handleSubscribe}
                      disabled={submitting}
                      aria-label="Subscribe to updates"
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "rgba(255,255,255,0.12)",
                  borderRadius: 2,
                  color: "#fff",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.25)",
                },
                "& input": {
                  color: "#fff",
                },
              }}
            />
            {feedback.message ? (
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  display: "block",
                  color:
                    feedback.type === "success"
                      ? "#86efac"
                      : "rgba(255,255,255,0.75)",
                }}
              >
                {feedback.message}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              © {currentYear}
            </Typography>
            <BrandImage width={125} sx={{ opacity: 0.9 }} />
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              Systems Inc. All rights reserved.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              color="inherit"
              onClick={() => handleNavigate("/info/privacy-policy")}
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              Privacy Policy
            </Button>
            <Button
              color="inherit"
              onClick={() => handleNavigate("/info/terms-of-service")}
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              Terms of Service
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default FooterSection;
