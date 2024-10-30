import { useEffect, useState } from "react";

export function WelcomeMessage(props: { isMobile: boolean }) {
  const { isMobile } = props;
  const [welcomeMessageVisibility, setWelcomeMessageVisibility] = useState(
    localStorage.getItem("welcomeMessageVisibility") !== "false",
  );

  useEffect(() => {
    localStorage.setItem(
      "welcomeMessageVisibility",
      welcomeMessageVisibility ? "true" : "false",
    );
  }, [welcomeMessageVisibility]);

  return (
    welcomeMessageVisibility && (
      <div
        style={{
          zIndex: 10,
          width: "70vw",
          color: "white",
          cursor: "pointer",
          position: "fixed",
          bottom: isMobile ? "150px" : "30px",
          left: isMobile ? "30px" : "50%",
          transform: isMobile ? "0" : "translateX(-50%)",
        }}
      >
        <div
          className={isMobile ? "dashed-greeting-mobile" : "dashed-greeting"}
          onClick={() => {
            setWelcomeMessageVisibility(false);
          }}
        >
          <p className="content" style={{ fontSize: isMobile ? "15px" : "" }}>
            Welcome to Dungeon Minter! Walk around to discover treasure chests,
            and open them to generate and mint unique collectibles to your
            Embedded Wallet.
          </p>
        </div>
      </div>
    )
  );
}
