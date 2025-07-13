// pages/_app.js
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "../components/Layout";
import { Provider } from "react-redux";
import { store } from "../lib/redux/store";

import { AuthProvider } from "../lib/auth";

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

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
// This is the custom App component for Next.js, which wraps all pages with a theme and layout.
