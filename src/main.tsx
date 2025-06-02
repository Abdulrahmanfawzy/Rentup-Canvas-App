import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import "@fontsource/roboto";
import "@fontsource/open-sans";
import "@fontsource/lato";
import "@fontsource/montserrat";
import "@fontsource/poppins";
import "@fontsource/raleway";
import "@fontsource/oswald";
import "@fontsource/merriweather";
import "@fontsource/playfair-display";
import "@fontsource/nunito";
import "@fontsource/ubuntu";
import "@fontsource/pt-sans";
import "@fontsource/inter";
import "@fontsource/quicksand";
import "@fontsource/source-sans-pro";
import "@fontsource/cabin";
import "@fontsource/rubik";
import "@fontsource/fira-sans";
import "@fontsource/inconsolata";
import "@fontsource/manrope";



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="Markom Theme">
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
