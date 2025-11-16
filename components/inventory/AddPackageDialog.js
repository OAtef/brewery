import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import PropTypes from "prop-types";

export default function AddPackageDialog({ open, onClose, refreshPackaging }) {
  const [type, setType] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");
    try {
      const response = await fetch("/api/packaging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          costPerUnit: parseFloat(costPerUnit),
          currentStock: parseFloat(currentStock),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to create package");
        return;
      }

      setSuccessMessage("Package added successfully!");
      if (refreshPackaging) {
        refreshPackaging();
      }
      // Clear form for next entry
      setType("");
      setCostPerUnit("");
      setCurrentStock("");
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  const handleClose = () => {
    // Reset form state on close
    setType("");
    setCostPerUnit("");
    setCurrentStock("");
    setError("");
    setSuccessMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Package</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Package Type"
          type="text"
          fullWidth
          variant="outlined"
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Cost Per Unit"
          type="number"
          fullWidth
          variant="outlined"
          value={costPerUnit}
          onChange={(e) => setCostPerUnit(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Current Stock"
          type="number"
          fullWidth
          variant="outlined"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddPackageDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refreshPackaging: PropTypes.func,
};
