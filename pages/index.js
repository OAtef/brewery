// pages/index.js
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Stack,
} from "@mui/material";
import CoffeeIcon from "@mui/icons-material/Coffee";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function Home() {
  console.log("Component: Home");
  const handleViewMenu = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/menu";
    }
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "primary.main",
        color: "white",
      }}
    >
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: "transparent" }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to The Brewery
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Specialty Coffee Experience
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CoffeeIcon sx={{ fontSize: 40, color: "white", mr: 1 }} />
        </Box>
      </Paper>

      <Grid
        container
        spacing={4}
        sx={{ mt: 2, width: "100%", maxWidth: "900px" }}
      >
        <Grid item xs={12} md={6}>
          <Card
            elevation={3}
            sx={{ bgcolor: "background.paper", color: "text.primary" }}
          >
            <CardMedia
              component="img"
              height="240"
              image="/your_image.jpg"
              alt="Coffee Shop"
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Our Coffee & Bakery
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Experience the finest coffee in a cozy atmosphere. We source our
                beans from sustainable farms and are preparing fresh bakery
                items daily.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LocalCafeIcon />}
                sx={{ mt: 2 }}
                onClick={handleViewMenu}
              >
                View Menu
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={3}
            sx={{ bgcolor: "background.paper", color: "text.primary" }}
          >
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h5" component="div" gutterBottom>
                Our Recommendations
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                    color: "text.primary",
                  }}
                >
                  <Typography variant="h6">Recommended Products</Typography>
                  <Typography variant="body2">
                    Explore our curated selection of coffee beans and brewing
                    equipment.
                  </Typography>
                </Paper>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                    color: "text.primary",
                  }}
                >
                  <Typography variant="h6">Subscription Service</Typography>
                  <Typography variant="body2">
                    Get fresh coffee delivered to your door regularly.
                  </Typography>
                </Paper>
              </Stack>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<MenuBookIcon />}
                sx={{ mt: 3 }}
              >
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
