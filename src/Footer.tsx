export default function Footer(props: { isMobile: boolean }) {
  const { isMobile } = props;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "22px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "63%",
      }}
    >
      {!isMobile ? (
        <p style={{ fontSize: "15px", color: "#555555ba" }} className="content">
          NETWORK POWERED BY{" "}
          <span style={{ color: "white", opacity: 0.7 }}>ARBITRUM NOVA</span> /
          EMBEDDED WALLET POWERED BY{" "}
          <span style={{ color: "white", opacity: 0.7 }}>SEQUENCE</span> /
          ARTWORK GENERATION WITH{" "}
          <span style={{ color: "white", opacity: 0.7 }}>SCENARIO.GG</span>
        </p>
      ) : (
        <p style={{ fontSize: "15px", color: "#555555ba" }} className="content">
          NETWORK POWERED BY{" "}
          <span style={{ color: "white", opacity: 0.7 }}>ARBITRUM NOVA</span> /{" "}
          <br />
          EMBEDDED WALLET POWERED BY{" "}
          <span style={{ color: "white", opacity: 0.7 }}>SEQUENCE</span> /{" "}
          <br /> ARTWORK GENERATION WITH{" "}
          <span style={{ color: "white", opacity: 0.7 }}>SCENARIO.GG</span>
        </p>
      )}
    </div>
  );
}
