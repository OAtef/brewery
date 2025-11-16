import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
    title: '',
    autoHideDuration: 6000,
  });

  const showNotification = ({ message, severity = 'info', title = '', autoHideDuration = 6000 }) => {
    setNotification({
      open: true,
      message,
      severity,
      title,
      autoHideDuration,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const showSuccess = (message, title = 'Success') => {
    showNotification({ message, severity: 'success', title });
  };

  const showError = (message, title = 'Error') => {
    showNotification({ message, severity: 'error', title, autoHideDuration: 8000 });
  };

  const showWarning = (message, title = 'Warning') => {
    showNotification({ message, severity: 'warning', title });
  };

  const showInfo = (message, title = 'Info') => {
    showNotification({ message, severity: 'info', title });
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotification, 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo,
        hideNotification 
      }}
    >
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.autoHideDuration}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
