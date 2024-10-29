import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { useSessionHash } from "./useSessionHash.ts";

import { ThemeProvider } from "@0xsequence/design-system";
import { GoogleOAuthProvider } from "@react-oauth/google";

function Dapp() {
  const { sessionHash } = useSessionHash();
  useEffect(()=> {
    console.log('VITE_BUILDER_PROJECT_ACCESS_KEY', import.meta.env.VITE_BUILDER_PROJECT_ACCESS_KEY!)
    console.log('VITE_WAAS_CONFIG_KEY', import.meta.env.VITE_WAAS_CONFIG_KEY!)
    console.log('VITE_GOOGLE_CLIENT_ID', import.meta.env.VITE_GOOGLE_CLIENT_ID!)
  })
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
