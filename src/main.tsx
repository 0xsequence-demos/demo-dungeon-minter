import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useSessionHash } from "./useSessionHash.ts";

import { ThemeProvider } from '@0xsequence/design-system'
import { GoogleOAuthProvider } from '@react-oauth/google'


function Dapp() {
  const { sessionHash } = useSessionHash()

  return (
	<ThemeProvider>
		<GoogleOAuthProvider clientId="976261990624-00hh7e04rulj5hpp90df6obe9stgvdcj.apps.googleusercontent.com" nonce={sessionHash} key={sessionHash}>
			<App />
		</GoogleOAuthProvider>
	</ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>
)
