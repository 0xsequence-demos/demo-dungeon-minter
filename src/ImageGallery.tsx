import React from "react";
import "./App.css";
import "./lootExpanse/styles.css";
import { Collectible } from "./Collectible";

export default function ImageGallery(props: {
  items: Collectible[];
  setCollectibleViewable: React.Dispatch<
    React.SetStateAction<Collectible | undefined>
  >;
}) {
  const { items, setCollectibleViewable } = props;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        width: "350px",
        overflowY: "auto",
        height: "300px",
        justifyContent: "space-around",
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.tokenID}
          onClick={() => setCollectibleViewable(item)}
          style={{
            width: "100px", // Two columns
            display: "flex",
            height: "150px",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px",
            cursor: "pointer",
            marginTop: index == 1 || index == 0 ? "-80px" : "",
          }}
        >
          <div className="view" style={{ scale: "0.45" }}>
            <img
              src={item.url}
              alt={`Token ${item.tokenID}`}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <span>{item.tokenID}</span>
        </div>
      ))}
    </div>
  );
}
