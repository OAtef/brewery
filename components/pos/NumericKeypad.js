import React from 'react';
import { Box, Button, Grid } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';

/**
 * NumericKeypad - Large touch-friendly numeric keypad for POS
 * @param {Function} onNumberClick - Callback when number is clicked
 * @param {Function} onClear - Callback to clear input
 * @param {Function} onBackspace - Callback to delete last character
 */
export default function NumericKeypad({ onNumberClick, onClear, onBackspace }) {
  // Quick amount buttons (in dollars)
  const quickAmounts = [5, 10, 20, 50, 100];

  // Number pad layout
  const numberButtons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', '00'],
  ];

  return (
    <Box>
      {/* Quick Amount Buttons */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {quickAmounts.map((amount) => (
          <Grid item xs key={amount}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onNumberClick(amount.toString())}
              sx={{
                minHeight: '50px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              ${amount}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Number Pad */}
      <Grid container spacing={1}>
        {numberButtons.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((button) => (
              <Grid item xs={4} key={button}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => onNumberClick(button)}
                  sx={{
                    minHeight: '70px',
                    fontSize: '28px',
                    fontWeight: 600,
                    backgroundColor: 'grey.100',
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'grey.200',
                    },
                  }}
                >
                  {button}
                </Button>
              </Grid>
            ))}
          </React.Fragment>
        ))}

        {/* Control Buttons */}
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={onClear}
            sx={{
              minHeight: '70px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            CLEAR
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={onBackspace}
            startIcon={<BackspaceIcon />}
            sx={{
              minHeight: '70px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            DELETE
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
