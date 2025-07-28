// components/Layout.js
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import Link from "next/link";
import { useState, useEffect } from "react";
import LoginPopup from "./LoginPopup";
import { useAuth } from "../lib/auth"; // Assuming auth context is in lib/auth.js

export default function Layout({ children }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, logout } = useAuth(); // Get user and logout function from auth context

  const handleLoginOpen = () => {
    setLoginOpen(true);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: "none", color: "white" }}>
              The Brewery
            </Link>
          </Typography>

          {/* Always visible links for everyone */}
          <Button color="inherit" component={Link} href="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} href="/menu">
            Menu
          </Button>

          {/* Links only visible when logged in */}
          {user && (
            <>
              <Button color="inherit" component={Link} href="/scene">
                3D Scene
              </Button>

              {/* Admin/Manager Only Features */}
              {(user.role === "ADMIN" || user.role === "MANAGER") && (
                <>
                  <Button color="inherit" component={Link} href="/inventory">
                    Inventory
                  </Button>
                  <Button color="inherit" component={Link} href="/recipes">
                    Recipes
                  </Button>
                </>
              )}
              
              {/* Staff Features */}
              {(user.role === "ADMIN" || user.role === "MANAGER" || user.role === "BARISTA") && (
                <Button color="inherit" component={Link} href="/orders">
                  Orders
                </Button>
              )}
              
              <Button color="inherit" component={Link} href="/orders/new">
                Create Order
              </Button>
            </>
          )}

          {/* Authentication section */}
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "white", mr: 1 }}>
                Welcome, {user.name}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Button color="inherit" onClick={handleLoginOpen}>
              Login
            </Button>
          )}

          <LoginPopup open={loginOpen} onClose={handleLoginClose} />
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>{children}</Container>
    </>
  );
}
