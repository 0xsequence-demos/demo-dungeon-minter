import { Dispatch, SetStateAction, useCallback } from "react";
import PlayImage from "./assets/play.svg?react";
import Footer from "./Footer";

export default function IntroPage(props: {
  setIsLoggingIn: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
}) {
  const { setIsLoggingIn, isMobile } = props;
  const showLoginScreen = useCallback(() => {
    setIsLoggingIn(true);
  }, []);

  return (
    <>
      <div
        style={{
          justifyContent: "center",
          width: "98vw",
        }}
      >
        <div style={{ textAlign: "center", width: "100%", margin: "auto" }}>
          <h1 style={{ margin: "-9px" }}>Dungeon Minter</h1>
          <p className="content">
            DISCOVER TREASURE CHESTS TO MINT A UNIQUE COLLECTIBLE
          </p>
        </div>

        <br />
        <div style={{ textAlign: "center" }}>
          <p className="content" style={{ position: "relative" }}>
            <span className="play-demo" onClick={showLoginScreen}>
              Play demo
            </span>
            <PlayImage className="play-image" />
          </p>
          <p className="content" style={{ position: "relative" }}>
            <span className="read-build-guide">
              <a
                className="no-link"
                href="https://docs.sequence.xyz/guides/treasure-chest-guide"
                target="_blank"
              >
                Read build guide
              </a>
            </span>
            <PlayImage className="play-image-read-build-guide" />
          </p>
        </div>
      </div>
      <Footer isMobile={isMobile} />
    </>
  );
}
