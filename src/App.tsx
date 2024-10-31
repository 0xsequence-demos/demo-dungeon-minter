import { useState, useEffect, useCallback } from "react";
import Grids from "./Grids";
import "./App.css";
import "./lootExpanse/styles.css";

import sequence from "./SequenceEmbeddedWallet";
import DungeonGameComponent from "./DungeonGameComponent";
import LoginScreen from "./LoginScreen";
import Footer from "./Footer";
import isMobileDevice from "./isMobileDevice";
import IntroPage from "./IntroPage";
import { WelcomeMessage } from "./WelcomeMessage";
import SignOutButton from "./SignOutButton";
import ItemsAndInventory from "./ItemsAndInventory";
import { useSessionHash } from "./useSessionHash";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App() {
  const { sessionHash } = useSessionHash();

  const [address, setAddress] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    console.log(`logged in as ${address}`);
  }, [address]);

  useEffect(() => {
    sequence.isSignedIn().then(async (signedIn) => {
      if (signedIn) {
        console.log("logged in");
        setAddress(await sequence.getAddress());
      }
    });
  }, []);

  const signOutConfiguration = useCallback(() => {
    localStorage.clear();
    setIsLoggingIn(false);
    setAddress("");
    location.reload(); // requirement to reload because 'loadingTreasure' & 'exploring' is not reactive
  }, []);

  return (
    <>
      {!address ? (
        <>
          <Grids />
          {isLoggingIn ? (
            <div
              style={{
                justifyContent: "center",
                width: "98vw",
              }}
            >
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}
                nonce={sessionHash}
                key={sessionHash}
              >
                <LoginScreen setAddress={setAddress} />
              </GoogleOAuthProvider>
              <Footer isMobile={isMobile} />
            </div>
          ) : (
            <IntroPage setIsLoggingIn={setIsLoggingIn} isMobile={isMobile} />
          )}
        </>
      ) : (
        <div>
          <SignOutButton signOutConfiguration={signOutConfiguration} />
          <DungeonGameComponent />
          <WelcomeMessage isMobile={isMobile} />
          {address && (
            <ItemsAndInventory address={address} isMobile={isMobile} />
          )}
        </div>
      )}
    </>
  );
}
