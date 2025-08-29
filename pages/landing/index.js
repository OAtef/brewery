import { Container, Typography, Box, Button, Stack } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";

export default function LandingPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Stack spacing={4} alignItems="center" textAlign="center">
        <Box
          component="img"
          src="/logo.png" // Assuming the logo is in the public folder
          alt="The Breezy Logo"
          sx={{ width: 150, height: "auto", mb: 2 }}
        />
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Welcome to The Breezy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your specialty coffee destination
          </Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <Typography
            variant="h6"
            component="h2"
            fontWeight="medium"
            sx={{ mb: 3 }}
          >
            Follow Us & Order
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<InstagramIcon />}
              fullWidth
              href="https://www.instagram.com" // Placeholder link
              target="_blank"
              sx={{
                justifyContent: "center",
                textTransform: "none",
                borderColor: "#3f51b5",
                color: "#3f51b5",
              }}
            >
              Follow us on Instagram
            </Button>
            <Button
              variant="outlined"
              startIcon={<MusicNoteIcon />}
              fullWidth
              href="https://www.tiktok.com" // Placeholder link
              target="_blank"
              sx={{
                justifyContent: "center",
                textTransform: "none",
                borderColor: "#3f51b5",
                color: "#3f51b5",
              }}
            >
              Watch us on TikTok
            </Button>
            <Button
              variant="contained"
              startIcon={<DeliveryDiningIcon />}
              fullWidth
              href="https://www.talabat.com" // Placeholder link
              target="_blank"
              sx={{
                justifyContent: "center",
                textTransform: "none",
                bgcolor: "#303f9f",
                "&:hover": { bgcolor: "#3f51b5" },
              }}
            >
              Order on Talabaat
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
