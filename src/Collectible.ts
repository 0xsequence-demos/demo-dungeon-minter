export interface Collectible {
  name: string;
  tokenID: string;
  image: string;
  tier: string;
  category: string;
  type: string;
  stats: string[];
  attributes: Array<{
    [key: string]: string;
  }>;
}
