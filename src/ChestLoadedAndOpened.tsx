import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { Collectible } from "./Collectible";
import { getDungeonGame } from "./dungeon/entry";
import PlayImage from "./assets/play.svg?react";
import Modal from "./Modal";
import CollectibleBasicInfo from "./CollectibleBasicInfo";
import AttributeList from "./AttributeList";
import { getNormalizedTierColor } from "./getNormalizedTierColor";

export default function ChestLoadedAndOpenedModal(props: {
  address: string;
  txHash: string;
  setTxHash: Dispatch<SetStateAction<string>>;
  discoveredItems: Collectible[];
  onClose: () => void;
}) {
  const { address, onClose, txHash, setTxHash, discoveredItems } = props;

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
    setTxHash(json.txnHash);
    setMinting(false);
  }, [address, discoveredItems, setTxHash]);

  const discoveredItem = discoveredItems[0];

  return (
    <Modal glow={true} color={getNormalizedTierColor(discoveredItem)}>
      <CollectibleBasicInfo item={discoveredItem} />
      <hr className="half" />
      <AttributeList item={discoveredItem} />
      {!minting && txHash == "" && (
        <button className="modal-button" onClick={mint}>
          Mint to wallet
        </button>
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
        onClick={() => {
          onClose();
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
    </Modal>
  );
}
