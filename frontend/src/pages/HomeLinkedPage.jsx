import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import FooterSection from "../components/FooterSection.jsx";
import { submitSupportForm } from "../services/supportService.js";

const PAGE_CONTENT = {
  "features": {
    badge: "Product",
    title: "Features Built for Faster Hostel Operations",
    description:
      "Manage room allocation, mess subscriptions, complaints, and notifications in one unified workflow. Each module is optimized for admins, wardens, and students.",
    sections: [
      "Smart room lifecycle: requests, approvals, and occupancy tracking.",
      "Mess module with plans, subscriptions, daily menu control, and billing visibility.",
      "Role-based dashboards that show only what each user needs to act on.",
    ],
  },
  "admin-tools": {
    badge: "Product",
    title: "Admin Tools that Reduce Manual Work",
    description:
      "From report generation to fee tracking, admin workflows are designed to remove repetitive tasks and provide complete visibility across hostels.",
    sections: [
      "Bulk operations for records, status updates, and room movement.",
      "Real-time insights for occupancy, complaints, and revenue collection.",
      "Structured controls with role permissions and secure access boundaries.",
    ],
  },
  "student-mobile-app": {
    badge: "Product",
    title: "Student Experience Designed for Everyday Use",
    description:
      "Students can apply for rooms, view mess menus, raise complaints, and receive updates without standing in queues or waiting for office hours.",
    sections: [
      "Simple self-service actions for room and mess requests.",
      "Live status updates for complaints, approvals, and notifications.",
      "Mobile-friendly UI with fast, clear, and accessible interactions.",
    ],
  },
  pricing: {
    badge: "Product",
    title: "Flexible Pricing for Different Campus Sizes",
    description:
      "Choose a plan based on student strength, operational complexity, and reporting needs. Scale gradually as your institution grows.",
    sections: [
      "Starter setup for small hostels and independent residences.",
      "Growth plans for multi-block campuses with analytics needs.",
      "Enterprise options with advanced workflows and priority support.",
    ],
  },
  "help-center": {
    badge: "Support",
    title: "Help Center",
    description:
      "Find step-by-step guides, frequently asked questions, and troubleshooting instructions for students, wardens, and administrators.",
    sections: [
      "Onboarding walkthroughs for first-time users.",
      "Feature guides with practical how-to explanations.",
      "Resolution paths for common account and billing issues.",
    ],
  },
  "api-docs": {
    badge: "Support",
    title: "API Documentation",
    description:
      "Integrate hostel workflows with your internal systems using a clear and well-structured API surface for user, room, and payment modules.",
    sections: [
      "Authentication and role-aware endpoint access patterns.",
      "Resource references for rooms, subscriptions, and notifications.",
      "Integration notes for webhook-style update pipelines.",
    ],
  },
  "contact-support": {
    badge: "Support",
    title: "Contact Support",
    description:
      "Reach out to our support team for setup guidance, feature assistance, or technical troubleshooting. We prioritize issue clarity and fast resolution.",
    sections: [
      "Guided setup assistance for new institutions.",
      "Ticket-based support with progress communication.",
      "Escalation handling for urgent operational blockers.",
    ],
  },
  security: {
    badge: "Support",
    title: "Security",
    description:
      "Security is built into each workflow with role-based controls, secure authentication, and auditable activity traces to protect institutional data.",
    sections: [
      "Permission boundaries by role and operation scope.",
      "Protected access flows and secure token handling.",
      "Transparent record trails for compliance and governance.",
    ],
  },
  "privacy-policy": {
    badge: "Legal",
    title: "Privacy Policy",
    description:
      "We collect only the data needed to operate hostel and mess workflows while maintaining strict safeguards for user identity and institutional records.",
    sections: [
      "Data collection is limited to operational requirements.",
      "Information is used for service delivery and reliability.",
      "Access controls restrict sensitive data exposure.",
    ],
  },
  "terms-of-service": {
    badge: "Legal",
    title: "Terms of Service",
    description:
      "These terms define acceptable platform usage, operational responsibilities, and baseline service expectations for institutions and users.",
    sections: [
      "Clear responsibilities for platform administrators and end users.",
      "Fair-use and security-aligned account practices.",
      "Service limitations and support boundaries.",
    ],
  },
};

function HomeLinkedPage({ mode, onToggleTheme }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const content = PAGE_CONTENT[slug];
  const isSupportPage = slug === "help-center" || slug === "contact-support";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  if (!content) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFeedback({ type: "", message: "" });

      await submitSupportForm({
        ...formData,
        topic: slug,
      });

      setFeedback({
        type: "success",
        message: "Message sent successfully. Our team will reach out soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const fallbackEmail = "support@hostezy.com";
      const subjectText = encodeURIComponent(
        formData.subject || "Support request",
      );
      const bodyText = encodeURIComponent(
        `${formData.message}\n\nFrom: ${formData.name} <${formData.email}>`,
      );

      setFeedback({
        type: "error",
        message:
          err.response?.data?.message ||
          "Could not send from the app. Use the email button below.",
      });

      window.open(
        `mailto:${fallbackEmail}?subject=${subjectText}&body=${bodyText}`,
        "_self",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header mode={mode} onToggleTheme={onToggleTheme} />

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(15, 23, 42, 0.74)"
                : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(6px)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              top: -150,
              right: -110,
              background: (theme) =>
                `radial-gradient(circle, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.16)} 0%, rgba(0,0,0,0) 72%)`,
            },
          }}
        >
          <Chip
            label={content.badge}
            sx={{
              mb: 2,
              fontWeight: 700,
              color: "primary.main",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 850,
              letterSpacing: -0.6,
              fontSize: { xs: "1.9rem", md: "2.5rem" },
              maxWidth: 760,
              mb: 2,
            }}
          >
            {content.title}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 760, lineHeight: 1.8, mb: 4 }}
          >
            {content.description}
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 4 }}>
            {content.sections.map((section) => (
              <Box
                key={section}
                sx={{
                  p: 1.8,
                  borderRadius: 2.2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.7),
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {section}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => navigate("/register")}
              sx={{ alignSelf: "flex-start", borderRadius: 2.5, fontWeight: 700 }}
            >
              Start with Us
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{ alignSelf: "flex-start", borderRadius: 2.5, fontWeight: 700 }}
            >
              Back to Homepage
            </Button>
          </Stack>

          {isSupportPage ? (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                mt: 4,
                p: { xs: 2.2, md: 3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.72),
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
                Send us a message
              </Typography>

              <Stack spacing={1.5}>
                <TextField
                  label="Full name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                  fullWidth
                />
                <TextField
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange("subject")}
                  required
                  fullWidth
                />
                <TextField
                  label="Message"
                  value={formData.message}
                  onChange={handleChange("message")}
                  required
                  fullWidth
                  multiline
                  minRows={4}
                />
              </Stack>

              {feedback.message ? (
                <Alert severity={feedback.type || "info"} sx={{ mt: 2 }}>
                  {feedback.message}
                </Alert>
              ) : null}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ alignSelf: "flex-start", borderRadius: 2.5, fontWeight: 700 }}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.open("mailto:support@hostezy.com", "_self")}
                  sx={{ alignSelf: "flex-start", borderRadius: 2.5, fontWeight: 700 }}
                >
                  Email Support Directly
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Paper>
      </Container>

      <FooterSection />
    </Box>
  );
}

export default HomeLinkedPage;
