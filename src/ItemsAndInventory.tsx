import { useCallback, useEffect, useState } from "react";
import ChestLoadedAndOpenedModal from "./ChestLoadedAndOpened";
import LoadingTreasureModal from "./LoadingTreasureModal";
import OpenWalletButton from "./OpenWalletButton";
import WalletCollectibleModal from "./WalletCollectibleModal";
import { Collectible } from "./Collectible";
import { ChestData } from "./dungeon/ChestData";
import { getDungeonGame } from "./dungeon/entry";
import WalletCollectiblesModal from "./WalletCollectiblesModal";

export default function ItemsAndInventory(props: {
  address: string;
  isMobile: boolean;
}) {
  const { address, isMobile } = props;

  const [discoveredItems, setDiscoveredItems] = useState<Collectible[]>([]);
  const [color, setColor] = useState("");
  const [openWallet, setOpenWallet] = useState(false);
  const [collectedItems, setCollectedItems] = useState<Collectible[]>([]);

  const [txHash, setTxHash] = useState("");
  const [loadingTreasure, setLoadingTreasure] = useState(false);

  const [activeCollectible, setActiveCollectible] = useState<
    Collectible | undefined
  >();
  const [abortGenerationController, setAbortGenerationController] = useState<
    AbortController | undefined
  >();
  const [chestOpened, setChestOpened] = useState(false);

  const onApproach = useCallback((d: ChestData) => {
    setColor(d.color);
    if (!d.looted) {
      generate();
    }
  }, []);
  const onOpen = useCallback((d: ChestData) => {
    setLoadingTreasure(true);
    setChestOpened(true);
    d.loot();
  }, []);

  const onAbandon = useCallback((d: ChestData) => {
    if (abortGenerationController) abortGenerationController?.abort();
    console.log("aborting signal");
    setColor("#000000");
    setChestOpened(false);
    setLoadingTreasure(false);
    d.loot();
    setDiscoveredItems([]);
  }, []);

  const onEachChestData = useCallback((chestData: ChestData) => {
    chestData.approachSignal.listen(onApproach);
    chestData.openSignal.listen(onOpen);
    chestData.abandonSignal.listen(onAbandon);
  }, []);

  useEffect(() => {
    if (address) {
      const game = getDungeonGame();

      game.listenForEachChestData(onEachChestData);
      return () => {
        game.stopListeningForEachChestData(onEachChestData);
        for (const chestData of game.chestDatas) {
          chestData.approachSignal.stopListening(onApproach);
          chestData.openSignal.stopListening(onOpen);
          chestData.abandonSignal.stopListening(onAbandon);
        }
      };
    }
    // }
  }, [address]);

  const generate = useCallback(async () => {
    const newController = new AbortController();
    setAbortGenerationController(newController);

    const data = {
      address: address,
      mint: false,
    };

    try {
      const res = await fetch("api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: newController.signal,
      });

      if (res.status == 400) {
        console.log("reached daily max");
      } else if (res.status == 200) {
        const json = await res.json();

        setLoadingTreasure(false);

        setDiscoveredItems([json]);
        setTxHash("");
      }
    } catch (err) {
      // alert('generation service is erroring')
      console.log(err);
    }
  }, []);

  const onCloseDiscoveredItems = useCallback(() => {
    setLoadingTreasure(false);
    setDiscoveredItems([]);
    setTxHash("");
    setChestOpened(false);
  }, []);

  return (
    <>
      <OpenWalletButton isMobile={isMobile} setOpenWallet={setOpenWallet} />
      {openWallet && (
        <WalletCollectiblesModal
          address={address}
          setActiveCollectible={setActiveCollectible}
          collectedItems={collectedItems}
          setCollectedItems={setCollectedItems}
          setOpenWallet={setOpenWallet}
          activeCollectible={activeCollectible}
        />
      )}
      {activeCollectible && (
        <WalletCollectibleModal
          activeCollectible={activeCollectible}
          setActiveCollectible={setActiveCollectible}
        />
      )}
      {loadingTreasure && (
        <LoadingTreasureModal
          color={color}
          setColor={setColor}
          abortGenerationController={abortGenerationController}
        />
      )}
      {discoveredItems.length > 0 && chestOpened && (
        <ChestLoadedAndOpenedModal
          address={address}
          txHash={txHash}
          setTxHash={setTxHash}
          discoveredItems={discoveredItems}
          onClose={onCloseDiscoveredItems}
        />
      )}
    </>
  );
}
