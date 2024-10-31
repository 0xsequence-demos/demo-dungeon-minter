import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { Collectible } from "./Collectible";
import sequence from "./SequenceEmbeddedWallet";
import PlayImage from "./assets/play.svg?react";
import CollectibleBasicInfo from "./CollectibleBasicInfo";
import Modal from "./Modal";
import { getNormalizedTierColor } from "./getNormalizedTierColor";
import AttributeList from "./AttributeList";

export default function WalletCollectibleModal(props: {
  activeCollectible: Collectible;
  setActiveCollectible: Dispatch<SetStateAction<Collectible | undefined>>;
}) {
  const { activeCollectible, setActiveCollectible } = props;

  const [transferStatus, setTransferStatus] = useState("");
  const [collectibleRecipientWallet, setCollectibleRecipientWallet] =
    useState("");

  const sendCollectible = useCallback(async () => {
    setTransferStatus("pending");
    const params = {
      to: collectibleRecipientWallet!,
      token: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
      values: [
        {
          id: activeCollectible.tokenID, // Asset ID
          amount: 1, // Amount for this asset
        },
      ],
    };
    console.log(params);
    const tx = await sequence.sendERC1155(params);
    console.log(tx);
    setTransferStatus("complete");
    setTimeout(() => {
      setActiveCollectible(undefined);
    }, 4000);
  }, [collectibleRecipientWallet, activeCollectible, setActiveCollectible]);

  return (
    <Modal color={getNormalizedTierColor(activeCollectible)} glow={true}>
      <CollectibleBasicInfo item={activeCollectible} />
      <hr className="half" />
      <AttributeList item={activeCollectible} />
      <input
        className="transfer-to-address-input"
        onChange={(evt) => setCollectibleRecipientWallet(evt.target.value)}
        placeholder="transfer to address"
      ></input>
      {!transferStatus && (
        <button className="modal-button" onClick={sendCollectible}>
          send collectible
        </button>
      )}
      {transferStatus && (
        <p className="content">Transfer {transferStatus}...</p>
      )}
      <p
        className="content close-button"
        style={{ position: "relative" }}
        onClick={() => {
          setActiveCollectible(undefined);
        }}
      >
        <span className="cancel-open-wallet">Close</span>
        <PlayImage className="play-image-cancel-open-wallet" />
      </p>
    </Modal>
  );
}
