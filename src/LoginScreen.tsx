import { useState, Dispatch, SetStateAction } from "react";
import "./App.css";
import "./lootExpanse/styles.css";
import PlayImage from "./assets/play.svg?react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";

import sequence from "./SequenceEmbeddedWallet";
import { useSessionHash } from "./useSessionHash";

export default function LoginScreen(props: {
  setAddress: Dispatch<SetStateAction<string>>;
}) {
  const { setAddress } = props;
  const { sessionHash } = useSessionHash();

  const handleGoogleLogin = async (tokenResponse: CredentialResponse) => {
    const res = await sequence.signIn(
      {
        idToken: tokenResponse.credential!,
      },
      "Dungeon Minter",
    );
    setAddress(res.wallet);
  };

  const [googleHover, setGoogleHover] = useState(false);
  const [appleHover, setAppleHover] = useState(false);

  const handleAppleLogin = async (response: {
    authorization: { id_token: string };
  }) => {
    const res = await sequence.signIn(
      {
        idToken: response.authorization.id_token!,
      },
      "Dungeon Minter",
    );

    setAddress(res.wallet);
  };
  return (
    <>
      <div className="login-container">
        <div style={{ textAlign: "center", width: "98vw", margin: "auto" }}>
          <h1 style={{ marginTop: "-70px" }}>Dungeon Minter</h1>
          <p className="content" style={{ opacity: 0 }}>
            DISCOVER TREASURE CHESTS TO MINT A UNIQUE COLLECTIBLE
          </p>
        </div>
        <br />
        <span
          style={{ color: "grey", position: "absolute", marginTop: "-30px" }}
        >
          SIGN IN VIA
        </span>
        <br />
        <br />
        <br />
      </div>
      <div className="login-container" style={{ marginTop: "-100px" }}>
        <div className="dashed-box-google">
          <div className="content" style={{ position: "relative" }}>
            <div
              className="gmail-login"
              onMouseLeave={() => setGoogleHover(false)}
              onMouseEnter={() => {
                setGoogleHover(true);
              }}
              style={{
                overflow: "hidden",
                opacity: "0",
                width: "90px",
                position: "absolute",
                zIndex: 1,
                height: "100px",
              }}
            >
              {googleHover && (
                <GoogleLogin
                  nonce={sessionHash}
                  key={sessionHash}
                  onSuccess={handleGoogleLogin}
                  shape="circle"
                  width={230}
                />
              )}
            </div>

            <span className="gmail-login">Gmail</span>
            {googleHover && <PlayImage className="play-image-gmail" />}
          </div>
        </div>
        <div className="dashed-box-apple">
          <div
            className="content"
            onMouseLeave={() => setAppleHover(false)}
            onMouseEnter={() => {
              setAppleHover(true);
            }}
            style={{ position: "relative" }}
          >
            <span className="apple-login">
              <AppleSignin
                key={sessionHash}
                authOptions={{
                  clientId: "com.sequence.dungeon-minter",
                  scope: "openid email",
                  redirectURI: window.location.href,
                  usePopup: true,
                  nonce: sessionHash,
                }}
                onError={(error: unknown) => console.error(error)}
                onSuccess={handleAppleLogin}
                uiType={"dark"}
              />
              Apple
            </span>

            {appleHover && <PlayImage className="play-image-apple" />}
          </div>
        </div>
      </div>
    </>
  );
}
