import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { Collectible } from "./Collectible";
import { getDungeonGame } from "./dungeon/entry";
import PlayImage from "./assets/play.svg?react";

export default function ChestLoadedAndOpenedModal(props: {
  color: string;
  address: string;
  txHash: string;
  setTxHash: Dispatch<SetStateAction<string>>;
  discoveredItems: Collectible[];
}) {
  const { color, address, txHash, setTxHash, discoveredItems } = props;

  const [minting, setMinting] = useState(false);

  const mint = useCallback(async () => {
    setMinting(true);

    const data = {
      address,
      mint: true,
      tokenID: discoveredItems[0].tokenID,
    };

    const res = await fetch("api/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    console.log(json);
    setTxHash(json.txnHash);
    setMinting(false);
  }, []);

  return (
    <div
      className="box-generation"
      style={{
        backgroundSize: "150%",
        backgroundPosition: "center",
        backgroundImage: `radial-gradient(circle, ${color}B3 0%, transparent 70%)`,
      }}
    >
      <div
        style={{
          width: "340px",
          height: "550px",
          paddingTop: "20px",
          backgroundColor: "black",
          display: "flex" /* Use flexbox to align children side by side */,
          justifyContent: "center" /* Align items to the center */,
          alignItems: "center" /* Center items vertically */,
          flexDirection:
            "column" /* Align children vertically for better control */,
          padding: "10px",
          boxShadow: `0px 0px 450px 450px ${color}70`,
          borderWidth: `3px`,
          borderStyle: `dashed`,
          borderColor: `${color}`,
        }}
      >
        {discoveredItems.map((item, index) => {
          console.log(item);

          return (
            <div key={index} data-tier={item.tier}>
              <div
                className="view"
                data-tier={item.tier}
                style={{ scale: "0.5" }}
              >
                <img style={{ width: "298px" }} src={item.url} />
              </div>
              <p
                className={`content`}
                style={{
                  marginLeft: "40px",
                  marginTop: "-50px",
                  fontSize: "20px !important",
                }}
              >
                {item.name}
              </p>
              <h2 className={`name_${item.tier}`}>
                {item.tier} {item.type}
              </h2>
              <hr className="half" />
              <ul className="scrollable-list">
                {item.main_stats.map((stat, index) => {
                  if (stat.length > 0) {
                    return (
                      <Fragment key={index}>
                        <li
                          style={{ color: "white" }}
                          className={item.category}
                        >
                          {stat}
                        </li>
                        {item.stats.map((stat, statIndex) => (
                          <li style={{ color: "white" }} key={statIndex}>
                            {stat}
                          </li>
                        ))}
                      </Fragment>
                    );
                  }
                })}
              </ul>
            </div>
          );
        })}
        {!minting && txHash == "" && (
          <p
            className="content"
            style={{ position: "relative", marginTop: "-10px" }}
            onClick={() => {
              mint();
            }}
          >
            <span className="mint-generation">Mint to wallet</span>
            <PlayImage className="play-image-mint" />
          </p>
        )}
        {minting && <p className="content">Mint pending...</p>}
        {txHash && (
          <p
            onClick={() => window.open(`https://nova.arbiscan.io/tx/${txHash}`)}
            style={{ color: "orange", cursor: "pointer" }}
          >{`see minted hash: ${txHash.slice(0, 4)}... on explorer`}</p>
        )}
        <p
          className="content"
          style={{ position: "relative", marginTop: "-17px" }}
          onClick={() => {
            setTxHash("");
            const party = getDungeonGame().party;
            if (party) {
              party.stepBack();
            }
          }}
        >
          <span className="cancel-generation">
            {txHash != "" ? "Close" : "Cancel"}
          </span>
          <PlayImage className="play-image-cancel" />
        </p>
      </div>
    </div>
  );
}
