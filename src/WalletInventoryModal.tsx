import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Collectible } from "./Collectible";
import sequence from "./SequenceEmbeddedWallet";
import { indexer } from "./indexer";
import PlayImage from "./assets/play.svg?react";
import { TokenBalance } from "@0xsequence/indexer";
import ImageGallery from "./ImageGallery";
import CollectibleView from "./CollectibleView";
import capitalizeFirstLetter from "./capitalizeFirstLetter";

export default function WalletInventoryModal(props: {
  color: string;
  collectibleViewable: Collectible | undefined;
  setCollectibleViewable: Dispatch<SetStateAction<Collectible | undefined>>;
  address: string;
  collectedItems: Collectible[];
  setCollectedItems: Dispatch<SetStateAction<Collectible[]>>;
  setOpenWallet: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    color,
    address,
    collectedItems,
    setCollectedItems,
    collectibleViewable,
    setCollectibleViewable,
    setOpenWallet,
  } = props;

  const [transferLoading, setTransferLoading] = useState(false);
  const [collectibleTo, setCollectibleTo] = useState("");

  useEffect(() => {
    indexer
      .getTokenBalances({
        accountAddress: address,
        contractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
        includeMetadata: true,
      })
      .then((tokenBalances) => {
        console.log("indexer", tokenBalances);
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
  }, []);

  const sendCollectible = useCallback(async () => {
    if (!collectibleViewable) {
      return;
    }
    setTransferLoading(true);
    const tx = await sequence.sendERC1155({
      to: collectibleTo!,
      token: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
      values: [
        {
          id: collectibleViewable.tokenID, // Asset ID
          amount: 1, // Amount for this asset
        },
      ],
    });
    console.log(tx);
    // setTimeout(() => {
    setTransferLoading(false);
    setCollectibleViewable(undefined);
    setOpenWallet(false);
    // }, 4000)
  }, []);

  const handleClick = useCallback(() => {
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
    <div className="box-generation">
      <div
        style={{
          width: "300px",
          height: "480px",
          paddingTop: "20px",
          backgroundColor: "black",
          display: "flex" /* Use flexbox to align children side by side */,
          justifyContent: "center" /* Align items to the center */,
          alignItems: "center" /* Center items vertically */,
          flexDirection:
            "column" /* Align children vertically for better control */,
          padding: "60px",
          borderWidth: `3px`,
          borderStyle: `dashed`,
          borderColor: `${color}`,
        }}
      >
        <br />
        <p
          style={{
            marginTop: "-50px",
            textAlign: "center",
            paddingTop: "-80px",
            fontSize: "29px",
            width: "100%" /* Make sure it spans the full width */,
            position: "relative",
            cursor: "pointer",
            marginBottom: "0px",
          }}
          onClick={handleClick}
        >
          {address.slice(0, 8) +
            "..." +
            address.slice(address.length - 4, address.length)}
        </p>
        <br />
        {!collectibleViewable ? (
          <ImageGallery
            setCollectibleViewable={setCollectibleViewable}
            items={collectedItems}
          />
        ) : (
          <CollectibleView collectibleViewable={collectibleViewable} />
        )}
        <br />
        <div style={{ marginTop: "-50px" }}></div>
        {collectibleViewable && (
          <>
            <hr className="half" />
            <ul className="scrollable-item">
              WIP
              {collectibleViewable.attributes.map((attr) => {
                // <React.Fragment key={index}>
                if (attr.display_type != "tier" && attr.display_type != "type")
                  if (attr.display_type == "category") {
                    return (
                      <li
                        style={{
                          transform: "translateY(-15px)",
                        }}
                        className={attr.display_type}
                      >
                        {capitalizeFirstLetter(attr.value)}
                      </li>
                    );
                  } else {
                    return (
                      <li
                        style={{
                          transform: "translateY(-15px)",
                        }}
                      >
                        {attr.trait_type + ": " + attr.value}
                      </li>
                    );
                  }
              })}
            </ul>{" "}
          </>
        )}
        <br />
        <br />
        {collectibleViewable && (
          <input
            className="transfer-to-address-input"
            onChange={(evt) => setCollectibleTo(evt.target.value)}
            placeholder="transfer to address"
          ></input>
        )}
        {collectibleViewable && !transferLoading && (
          <button
            className="send-collectible-button"
            onClick={() => sendCollectible()}
          >
            send collectible
          </button>
        )}
        {collectibleViewable && transferLoading && (
          <p className="content">Transfer pending...</p>
        )}
        <p
          className="content"
          style={{ position: "relative" }}
          onClick={() => {
            setOpenWallet(false);
            setCollectibleViewable(undefined);
          }}
        >
          <span className="cancel-open-wallet">Close</span>
          <PlayImage className="play-image-cancel-open-wallet" />
        </p>
      </div>
    </div>
  );
}
