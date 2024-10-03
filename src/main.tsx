import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { useSessionHash } from "./useSessionHash.ts";

import { ThemeProvider } from "@0xsequence/design-system";
import { GoogleOAuthProvider } from "@react-oauth/google";

function Dapp() {
  const { sessionHash } = useSessionHash();
  return (
    <ThemeProvider>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}
        nonce={sessionHash}
        key={sessionHash}
      >
        <App />
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
);
