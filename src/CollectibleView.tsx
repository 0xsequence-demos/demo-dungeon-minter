import "./App.css";
import { Collectible } from "./Collectible";
import "./lootExpanse/styles.css";

export default function CollectibleView(props: {
  collectibleViewable: Collectible;
}) {
  const { collectibleViewable } = props;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        width: "340px",
        marginTop: "-100px",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100px", // Two columns
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        <div className="view" style={{ scale: "0.45" }}>
          <img
            src={collectibleViewable.image}
            alt={`Token`}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <p
          style={{
            width: "300px",
            marginTop: "-70px",
            textAlign: "center",
          }}
          className="content"
        >
          {collectibleViewable.name}
        </p>
      </div>
    </div>
  );
}
