import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography,
  Container
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import KitchenIcon from '@mui/icons-material/Kitchen';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';

import DashboardView from '../components/admin/DashboardView';
import CashierView from '../components/admin/CashierView';
import OrderTracker from '../components/admin/OrderTracker';
import ProductManager from '../components/admin/ProductManager';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminConsole() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <LocalCafeIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Coffee Shop Admin
          </Typography>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
            <Tab icon={<PointOfSaleIcon />} label="New Order" iconPosition="start" />
            <Tab icon={<KitchenIcon />} label="Active Orders" iconPosition="start" />
            <Tab icon={<InventoryIcon />} label="Products & Pricing" iconPosition="start" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={value} index={0}>
          <DashboardView />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <CashierView />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <OrderTracker />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ProductManager />
        </TabPanel>
      </Box>
    </Box>
  );
}
