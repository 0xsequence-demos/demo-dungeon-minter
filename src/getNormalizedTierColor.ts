import { Collectible } from "./Collectible";
import { getNormalizedTier } from "./getNormalizedTier";

const tierColors = {
  rubbish: "#e9e9e9",
  common: "#e9e9e9",
  magic: "#7c7cf6",
  rare: "#eaed0a",
  legendary: "#f97f00",
};

export function getNormalizedTierColor(item: Collectible) {
  const tier = getNormalizedTier(item);
  return tierColors[tier];
}
