import { useCallback, useEffect, useState } from "react";
import ChestLoadedAndOpenedModal from "./ChestLoadedAndOpened";
import LoadingTreasureModal from "./LoadingTreasureModal";
import OpenWalletButton from "./OpenWalletButton";
import WalletInventoryModal from "./WalletInventoryModal";
import { Collectible } from "./Collectible";
import { ChestData } from "./dungeon/ChestData";
import { getDungeonGame } from "./dungeon/entry";

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

  const [collectibleViewable, setCollectibleViewable] = useState<
    Collectible | undefined
  >();
  const [abortGenerationController, setAbortGenerationController] = useState<
    AbortController | undefined
  >();
  const [loaded, setLoaded] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);

  const onApproach = useCallback((d: ChestData) => {
    setColor(d.color);
    generate();
  }, []);
  const onOpen = useCallback(() => {
    setChestOpened(true);
  }, []);

  const onAbandon = useCallback((d: ChestData) => {
    if (abortGenerationController) abortGenerationController?.abort();
    console.log("aborting signal");
    setColor("#000000");
    setChestOpened(false);
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
    console.log("generating");
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

        setLoaded(true);

        json.loot.loot.url = json.image;
        json.loot.loot.tokenID = json.tokenID;
        setDiscoveredItems([json.loot.loot]);
        setTxHash("");
      }
    } catch (err) {
      // alert('generation service is erroring')
      console.log(err);
    }
  }, []);

  return (
    <>
      <OpenWalletButton isMobile={isMobile} setOpenWallet={setOpenWallet} />
      {openWallet && (
        <WalletInventoryModal
          color={color}
          collectibleViewable={collectibleViewable}
          address={address}
          setCollectibleViewable={setCollectibleViewable}
          collectedItems={collectedItems}
          setCollectedItems={setCollectedItems}
          setOpenWallet={setOpenWallet}
        />
      )}
      {loadingTreasure && (
        <LoadingTreasureModal
          color={color}
          setColor={setColor}
          abortGenerationController={abortGenerationController}
        />
      )}
      {loaded && chestOpened && (
        <ChestLoadedAndOpenedModal
          color={color}
          address={address}
          txHash={txHash}
          setTxHash={setTxHash}
          discoveredItems={discoveredItems}
        />
      )}
    </>
  );
}
