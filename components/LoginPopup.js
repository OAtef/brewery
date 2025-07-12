// components/LoginPopup.js
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth";

export default function LoginPopup({ open, onClose }) {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BARISTA",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError("Name is required");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess("Login successful!");
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(result.error || "An error occurred");
        }
      } else {
        // Signup logic
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "register",
            email: formData.email,
            password: formData.password, // In a real app, password would be hashed on the server
            role: formData.role,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create account");
        }

        const data = await response.json();
        setSuccess("Account created successfully! You can now login.");
        setIsLogin(true);
        setFormData({
          ...formData,
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isLogin ? "Login to Your Account" : "Create a New Account"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {!isLogin && (
            <TextField
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {!isLogin && (
            <>
              <TextField
                margin="dense"
                label="Confirm Password"
                type="password"
                fullWidth
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleInputChange}
                >
                  <MenuItem value="BARISTA">Barista</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <Button onClick={toggleMode} color="primary" sx={{ ml: 1 }}>
                {isLogin ? "Sign Up" : "Login"}
              </Button>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
