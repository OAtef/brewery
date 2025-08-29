// pages/_app.js
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "../components/Layout";
import { Provider } from "react-redux";
import { store } from "../lib/redux/store";

import { AuthProvider } from "../lib/auth";
import { NotificationProvider } from "../components/NotificationProvider";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6c4f3d", // coffee-brown
    },
    secondary: {
      main: "#ff9800", // amber
    },
  },
  typography: {
    fontFamily: `'Roboto', sans-serif`,
  },
});

export default function MyApp({ Component, pageProps, router }) {
  if (router.pathname === "/landing") {
    return (
      <Provider store={store}>
        <AuthProvider>
          <NotificationProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Component {...pageProps} />
            </ThemeProvider>
          </NotificationProvider>
        </AuthProvider>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </Provider>
  );
}
// This is the custom App component for Next.js, which wraps all pages with a theme and layout.
