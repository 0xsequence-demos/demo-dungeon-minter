export interface Collectible {
  name: string;
  tokenID: string;
  url: string;
  tier: string;
  category: string;
  type: string;
  main_stats: string[];
  stats: string[];
  attributes: Array<{
    [key: string]: string;
  }>;
}
