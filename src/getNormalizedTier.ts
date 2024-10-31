import { Collectible } from "./Collectible";

const tiers = ["rubbish", "common", "magic", "rare", "legendary"] as const;

export function getNormalizedTier(item: Collectible): (typeof tiers)[number] {
  const tier = item?.tier?.toLowerCase() as (typeof tiers)[number];
  if (tier && tiers.includes(tier)) {
    return tier;
  }
  const tierAttr = item.attributes.find((a) => a.trait_type === "tier");
  if (tierAttr) {
    return tierAttr.value.toLowerCase() as (typeof tiers)[number];
  }
  const rarityAttr = item.attributes.find((a) => a.trait_type === "rarity");
  if (rarityAttr && typeof rarityAttr.value === "number") {
    return tiers[rarityAttr.value];
  }
  return "common";
}
