import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    InputAdornment,
    Alert,
    Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ExtrasDialog({ open, onClose }) {
    const [extras, setExtras] = useState([]);
    const [newExtraName, setNewExtraName] = useState('');
    const [newExtraPrice, setNewExtraPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const fetchExtras = async () => {
        try {
            const response = await fetch('/api/extras');
            if (response.ok) {
                const data = await response.json();
                setExtras(data.extras || []);
            }
        } catch (error) {
            console.error('Error fetching extras:', error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchExtras();
        }
    }, [open]);

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleAddExtra = async () => {
        if (!newExtraName) return;

        try {
            setLoading(true);
            const response = await fetch('/api/extras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newExtraName,
                    price: parseFloat(newExtraPrice || 0)
                })
            });

            if (response.ok) {
                setNewExtraName('');
                setNewExtraPrice('');
                fetchExtras();
                showNotification('Extra added successfully!');
            } else {
                showNotification('Failed to add extra', 'error');
            }
        } catch (error) {
            console.error('Error adding extra:', error);
            showNotification('Error adding extra', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (extra) => {
        setEditingId(extra.id);
        setEditName(extra.name);
        setEditPrice(extra.price.toString());
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditPrice('');
    };

    const handleSaveEdit = async (id) => {
        if (!editName) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/extras/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    price: parseFloat(editPrice || 0)
                })
            });

            if (response.ok) {
                setEditingId(null);
                setEditName('');
                setEditPrice('');
                fetchExtras();
                showNotification('Extra updated successfully!');
            } else {
                showNotification('Failed to update extra', 'error');
            }
        } catch (error) {
            console.error('Error updating extra:', error);
            showNotification('Error updating extra', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExtra = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/extras/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchExtras();
                showNotification('Extra deleted successfully!');
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to delete extra', 'error');
            }
        } catch (error) {
            console.error('Error deleting extra:', error);
            showNotification('Error deleting extra', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Manage Extras</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 1 }}>
                    <TextField
                        label="Extra Name"
                        value={newExtraName}
                        onChange={(e) => setNewExtraName(e.target.value)}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Price"
                        type="number"
                        value={newExtraPrice}
                        onChange={(e) => setNewExtraPrice(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        sx={{ width: 120 }}
                        size="small"
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddExtra}
                        disabled={loading || !newExtraName}
                        startIcon={<AddIcon />}
                    >
                        Add
                    </Button>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                    Existing Extras
                </Typography>
                <List dense>
                    {extras.map((extra) => (
                        <ListItem key={extra.id} divider>
                            {editingId === extra.id ? (
                                <>
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
                                        <TextField
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            size="small"
                                            fullWidth
                                            label="Name"
                                        />
                                        <TextField
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            size="small"
                                            type="number"
                                            label="Price"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                            sx={{ width: 120 }}
                                        />
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleSaveEdit(extra.id)}
                                            disabled={loading}
                                            size="small"
                                        >
                                            <SaveIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleCancelEdit}
                                            disabled={loading}
                                            size="small"
                                        >
                                            <CancelIcon />
                                        </IconButton>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <ListItemText
                                        primary={extra.name}
                                        secondary={`+$${extra.price.toFixed(2)}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleStartEdit(extra)}
                                            disabled={loading}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDeleteExtra(extra.id, extra.name)}
                                            disabled={loading}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </>
                            )}
                        </ListItem>
                    ))}
                    {extras.length === 0 && (
                        <ListItem>
                            <ListItemText primary="No extras defined" />
                        </ListItem>
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
