import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { Collectible } from "./Collectible";
import { indexer } from "./indexer";
import PlayImage from "./assets/play.svg?react";
import { TokenBalance } from "@0xsequence/indexer";
import Modal from "./Modal";
import { CopyIcon } from "@0xsequence/design-system";

export default function WalletCollectiblesModal(props: {
  activeCollectible: Collectible | undefined;
  setActiveCollectible: Dispatch<SetStateAction<Collectible | undefined>>;
  address: string;
  collectedItems: Collectible[];
  setCollectedItems: Dispatch<SetStateAction<Collectible[]>>;
  setOpenWallet: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    address,
    collectedItems,
    setCollectedItems,
    activeCollectible,
    setActiveCollectible,
    setOpenWallet,
  } = props;

  useEffect(() => {
    if (activeCollectible) {
      return;
    }
    indexer
      .getTokenBalances({
        accountAddress: address,
        contractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
        includeMetadata: true,
      })
      .then((tokenBalances) => {
        setCollectedItems(
          tokenBalances.balances
            .filter((tb: TokenBalance) => !!tb.tokenMetadata)
            .map((tb: TokenBalance) => {
              return {
                name: tb.tokenMetadata!.name,
                tokenID: tb.tokenID || "",
                tier: "",
                type: "",
                category: "",
                image: tb.tokenMetadata?.image || "",
                attributes: tb.tokenMetadata!.attributes,
                stats: [],
              };
            }),
        );
      });
  }, [activeCollectible]);

  const onClickCopyAddressToClipboard = useCallback(() => {
    // Copy the address to the clipboard
    navigator.clipboard
      .writeText(address)
      .then(() => {
        console.log("Address copied to clipboard!");
        // Optionally, show a notification or change the UI to indicate success
      })
      .catch((err) => {
        console.error("Failed to copy the address: ", err);
        // Optionally, handle errors (e.g., display an error message)
      });
  }, []);

  return (
    <Modal>
      <span className="address" onClick={onClickCopyAddressToClipboard}>
        {address.slice(0, 8) +
          "..." +
          address.slice(address.length - 4, address.length)}
        <CopyIcon style={{ width: "26px" }} />
      </span>
      <div className="item-grid">
        {collectedItems.map((item) => (
          <div
            className="item-thumbnail"
            key={item.tokenID}
            onClick={() => setActiveCollectible(item)}
          >
            <img src={item.image} alt={`Token ${item.tokenID}`} />
          </div>
        ))}
      </div>
      <p
        className="content"
        style={{ position: "relative" }}
        onClick={() => {
          setOpenWallet(false);
          setActiveCollectible(undefined);
        }}
      >
        <span className="cancel-open-wallet">Close</span>
        <PlayImage className="play-image-cancel-open-wallet" />
      </p>
    </Modal>
  );
}
